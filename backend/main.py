from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import pdfplumber
import io
from typing import List, Dict, Any
import chromadb
from langchain.text_splitter import RecursiveCharacterTextSplitter
import uuid
import random
import os
from dotenv import load_dotenv
from gpt_model import (
    get_embeddings, 
    generate_chat_response, 
    generate_tutor_question, 
    evaluate_tutor_answer,
    is_greeting_message,
    get_greeting_response
)

app = FastAPI(title="Document Tutor + Chatbot API")

# Load environment variables
load_dotenv()

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000"],  # Added common dev ports
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Global variables
chroma_client = chromadb.PersistentClient(path="./chroma_db")
collection = None
document_text = ""
document_chunks = []

def ensure_clean_start():
    """Ensure we start with a clean database on server startup"""
    global collection
    
    try:
        # Clear any existing collections on startup for fresh start
        existing_collections = chroma_client.list_collections()
        if existing_collections:
            for col in existing_collections:
                chroma_client.delete_collection(col.name)
                print(f"Startup cleanup: Deleted collection '{col.name}'")
            print("Startup: All previous collections cleared - ready for new document")
        else:
            print("Startup: No existing collections - ready for new document")
        
        # Reset collection variable
        collection = None
        
    except Exception as e:
        print(f"Startup cleanup error: {e}")
        collection = None

class ChatRequest(BaseModel):
    message: str

class TutorAnswerRequest(BaseModel):
    question: str
    user_answer: str

class DocumentResponse(BaseModel):
    success: bool
    message: str
    chunk_count: int

class ChatResponse(BaseModel):
    response: str
    sources: List[str]

class TutorQuestion(BaseModel):
    question: str

class TutorEvaluation(BaseModel):
    score: int
    correct_points: List[str]
    missing_points: List[str]
    improved_answer: str

import hashlib

def extract_text_from_pdf(file_content: bytes) -> str:
    """Extract text from PDF using pdfplumber"""
    text = ""
    with pdfplumber.open(io.BytesIO(file_content)) as pdf:
        for page in pdf.pages:
            page_text = page.extract_text()
            if page_text:
                text += page_text + "\n"
    return text

def chunk_document(text: str) -> List[Dict[str, Any]]:
    """Split document into chunks for RAG"""
    text_splitter = RecursiveCharacterTextSplitter(
        chunk_size=500,
        chunk_overlap=50,
        length_function=len,
    )
    
    chunks = text_splitter.split_text(text)
    
    chunk_objects = []
    for i, chunk in enumerate(chunks):
        chunk_objects.append({
            "id": str(uuid.uuid4()),
            "text": chunk,
            "chunk_index": i
        })
    
    return chunk_objects

async def setup_vector_db(chunks: List[Dict[str, Any]]):
    """Setup ChromaDB with document chunks using OpenAI embeddings"""
    global collection
    
    # Delete existing collection if it exists (clear previous document)
    try:
        chroma_client.delete_collection("documents")
        print("Cleared previous document embeddings from persistent storage")
    except Exception as e:
        print(f"No previous collection to clear: {e}")
    
    # Force reset the collection variable
    collection = None
    
    # Create new collection for the new document
    collection = chroma_client.create_collection(
        name="documents",
        metadata={"description": "Current document embeddings"}
    )
    
    # Generate embeddings using OpenAI and add to collection
    print(f"Generating embeddings for {len(chunks)} chunks...")
    texts = [chunk["text"] for chunk in chunks]
    embeddings = await get_embeddings(texts)
    
    collection.add(
        embeddings=embeddings,
        documents=texts,
        ids=[chunk["id"] for chunk in chunks]
    )
    
    print(f"New embeddings created and saved to ./chroma_db/ folder")
    print(f"Collection 'documents' now contains {len(chunks)} chunks")

async def retrieve_relevant_chunks(query: str, k: int = 3) -> List[str]:
    """Retrieve top-k relevant chunks for a query using OpenAI embeddings"""
    if not collection:
        return []
    
    query_embeddings = await get_embeddings([query])
    
    results = collection.query(
        query_embeddings=query_embeddings,
        n_results=k
    )
    
    return results["documents"][0] if results["documents"] else []

async def generate_question_from_document() -> str:
    """Generate a question based on document content using GPT"""
    if not document_chunks:
        return "No document loaded."
    
    # Select a random chunk
    chunk = random.choice(document_chunks)
    chunk_text = chunk["text"]
    
    return await generate_tutor_question(chunk_text)

async def evaluate_answer(question: str, user_answer: str, document_context: str) -> TutorEvaluation:
    """Evaluate user answer against document content using GPT"""
    # Retrieve relevant chunks for the question
    relevant_chunks = await retrieve_relevant_chunks(question, k=5)
    context = " ".join(relevant_chunks)
    
    # Get evaluation from GPT model
    evaluation_data = await evaluate_tutor_answer(question, user_answer, context)
    
    return TutorEvaluation(
        score=evaluation_data["score"],
        correct_points=evaluation_data["correct_points"],
        missing_points=evaluation_data["missing_points"],
        improved_answer=evaluation_data["improved_answer"]
    )

@app.post("/upload", response_model=DocumentResponse)
async def upload_document(file: UploadFile = File(...)):
    """Upload and process document (PDF or TXT) - Creates embeddings for chat/tutor use"""
    global document_text, document_chunks, collection
    
    try:
        print(f"📄 Starting document upload: {file.filename}")
        
        # Step 1: Clear ALL previous document data
        document_text = ""
        document_chunks = []
        collection = None
        
        # Clear any existing collections from persistent storage
        try:
            existing_collections = chroma_client.list_collections()
            for col in existing_collections:
                chroma_client.delete_collection(col.name)
                print(f"🗑️ Cleared previous collection: {col.name}")
        except Exception as e:
            print(f"ℹ️ No previous collections to clear: {e}")
        
        # Step 2: Read and extract text from uploaded file
        content = await file.read()
        
        if file.filename.lower().endswith('.pdf'):
            document_text = extract_text_from_pdf(content)
            print("📖 Extracted text from PDF")
        elif file.filename.lower().endswith('.txt'):
            document_text = content.decode('utf-8')
            print("📖 Loaded text from TXT file")
        else:
            raise HTTPException(status_code=400, detail="Only PDF and TXT files are supported")
        
        if not document_text.strip():
            raise HTTPException(status_code=400, detail="No text could be extracted from the document")
        
        # Step 3: Chunk the document for processing
        document_chunks = chunk_document(document_text)
        print(f"✂️ Document chunked into {len(document_chunks)} pieces")
        
        # Step 4: Create embeddings and store in vector database
        print("🔄 Creating embeddings... (this may take a moment)")
        await setup_vector_db(document_chunks)
        
        print(f"✅ Document '{file.filename}' processed successfully!")
        print(f"📊 Ready for chat and tutor modes with {len(document_chunks)} chunks")
        
        return DocumentResponse(
            success=True,
            message=f"Document processed successfully. Ready for chat and tutor modes!",
            chunk_count=len(document_chunks)
        )
        
    except Exception as e:
        # If there's an error, make sure we clear the data
        print(f"❌ Error processing document: {str(e)}")
        document_text = ""
        document_chunks = []
        collection = None
        raise HTTPException(status_code=500, detail=f"Error processing document: {str(e)}")

@app.post("/chat", response_model=ChatResponse)
async def chat_with_document(request: ChatRequest):
    """Chat mode - answer questions using document content and GPT"""
    # Check if document is uploaded and embeddings are ready
    if not document_text or not collection:
        raise HTTPException(
            status_code=400, 
            detail="No document uploaded. Please upload a PDF or TXT file first to start chatting!"
        )
    
    try:
        # Check if it's a greeting or casual message
        if is_greeting_message(request.message):
            return ChatResponse(
                response=get_greeting_response(request.message),
                sources=[]
            )
        
        # Retrieve relevant chunks for actual questions
        relevant_chunks = await retrieve_relevant_chunks(request.message, k=3)
        
        if not relevant_chunks:
            return ChatResponse(
                response="I couldn't find relevant information in the document to answer your question. Could you try rephrasing or asking about a different topic from the document?",
                sources=[]
            )
        
        # Generate response using GPT with document context
        context = " ".join(relevant_chunks)
        response = await generate_chat_response(request.message, context)
        
        return ChatResponse(
            response=response,
            sources=relevant_chunks[:2]  # Return top 2 sources
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error processing chat request: {str(e)}")

@app.get("/tutor/question", response_model=TutorQuestion)
async def get_tutor_question():
    """Get a question for tutor mode"""
    # Check if document is uploaded and embeddings are ready
    if not document_text or not collection:
        raise HTTPException(
            status_code=400, 
            detail="No document uploaded. Please upload a PDF or TXT file first to start tutor mode!"
        )
    
    try:
        question = await generate_question_from_document()
        return TutorQuestion(question=question)
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error generating question: {str(e)}")

@app.post("/tutor/evaluate", response_model=TutorEvaluation)
async def evaluate_tutor_answer(request: TutorAnswerRequest):
    """Evaluate user's answer in tutor mode"""
    # Check if document is uploaded and embeddings are ready
    if not document_text or not collection:
        raise HTTPException(
            status_code=400, 
            detail="No document uploaded. Please upload a PDF or TXT file first to use tutor mode!"
        )
    
    try:
        evaluation = await evaluate_answer(request.question, request.user_answer, document_text)
        return evaluation
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error evaluating answer: {str(e)}")

@app.post("/session/start")
async def start_new_session():
    """Start a new session - clear all previous document data"""
    global document_text, document_chunks, collection
    
    try:
        # Clear all memory variables
        document_text = ""
        document_chunks = []
        collection = None
        
        # Clear all existing collections from persistent storage
        try:
            existing_collections = chroma_client.list_collections()
            for col in existing_collections:
                chroma_client.delete_collection(col.name)
                print(f"Session start: Deleted collection '{col.name}'")
        except Exception as e:
            print(f"Session start: No existing collections to clear - {e}")
        
        print("New session started - all previous data cleared")
        
        return {
            "success": True, 
            "message": "New session started - all previous document data cleared",
            "timestamp": str(uuid.uuid4())[:8]  # Simple session ID
        }
        
    except Exception as e:
        return {
            "success": False, 
            "message": f"Error starting new session: {str(e)}"
        }

@app.post("/clear")
async def clear_document():
    """Clear current document and embeddings"""
    global document_text, document_chunks, collection
    
    try:
        # Clear all document data
        document_text = ""
        document_chunks = []
        
        # Clear ChromaDB collection (persistent storage)
        try:
            chroma_client.delete_collection("documents")
            print("Deleted collection from persistent storage")
        except Exception as e:
            print(f"No collection to delete: {e}")
        
        collection = None
        
        return {"success": True, "message": "All document data cleared from memory and persistent storage"}
    except Exception as e:
        return {"success": False, "message": f"Error clearing data: {str(e)}"}

@app.get("/document/status")
async def get_document_status():
    """Get current document status"""
    return {
        "document_loaded": bool(document_text),
        "chunks_count": len(document_chunks) if document_chunks else 0,
        "collection_exists": collection is not None,
        "has_embeddings": collection.count() if collection else 0
    }

@app.get("/health")
async def health_check():
    """Health check endpoint"""
    import os
    
    # Check if chroma_db folder exists
    chroma_db_exists = os.path.exists("./chroma_db")
    chroma_db_size = 0
    
    if chroma_db_exists:
        # Calculate folder size
        for dirpath, dirnames, filenames in os.walk("./chroma_db"):
            for filename in filenames:
                filepath = os.path.join(dirpath, filename)
                chroma_db_size += os.path.getsize(filepath)
    
    return {
        "status": "healthy",
        "document_loaded": bool(document_text),
        "chunks_count": len(document_chunks) if document_chunks else 0,
        "collection_exists": collection is not None,
        "persistent_storage": {
            "enabled": True,
            "folder_exists": chroma_db_exists,
            "folder_size_bytes": chroma_db_size,
            "folder_path": "./chroma_db"
        }
    }

if __name__ == "__main__":
    import uvicorn
    # Ensure clean start - ready for new document upload
    ensure_clean_start()
    uvicorn.run(app, host="0.0.0.0", port=8000)
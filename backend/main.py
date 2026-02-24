from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
import pdfplumber
import io
from typing import List, Dict, Any, Optional
import uuid
import random
import os
import chromadb
from dotenv import load_dotenv
from embeddings import get_embeddings
from mongodb_client import (
    connect_mongodb,
    store_document_metadata,
    store_embeddings,
    search_similar_chunks,
    create_chat_session,
    add_message_to_session,
    get_chat_history,
    get_all_sessions,
    delete_session,
    clear_all_data,
    use_mongodb
)
from chat_model import (
    generate_chat_response,
    is_greeting_message,
    get_greeting_response
)
from tutor_model import (
    generate_tutor_question,
    evaluate_tutor_answer
)
from conversational_tutor import (
    get_tutor_response,
    evaluate_student_answer,
    generate_practice_question,
    reset_session,
    get_session_progress
)
from voice_models import (
    speech_to_text_from_bytes,
    text_to_speech
)

app = FastAPI(title="Document Tutor + Chatbot API")

# Load environment variables
load_dotenv()

# ChromaDB fallback
chroma_client = chromadb.PersistentClient(path="./chroma_db")
chroma_collection = None

# CORS middleware - Allow all origins for production
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Global variables
document_text = ""
document_chunks = []
current_document_id = None

def ensure_clean_start():
    """Ensure we start with a clean database on server startup"""
    global current_document_id, chroma_collection
    
    try:
        # Try to connect to MongoDB
        connect_mongodb()
        
        # Reset document ID
        current_document_id = None
        chroma_collection = None
        
        print("Startup: Ready for new document")
        
    except Exception as e:
        print(f"Startup error: {e}")
        current_document_id = None

class ChatRequest(BaseModel):
    message: str

class VoiceRequest(BaseModel):
    message: str
    mode: str  # "chat" or "tutor"

class VoiceResponse(BaseModel):
    response: str
    audio_text: str
    sources: Optional[List[str]] = None

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
    # Simple text splitter without langchain dependency
    chunk_size = 500
    chunk_overlap = 50
    
    chunks = []
    start = 0
    text_length = len(text)
    chunk_index = 0
    
    while start < text_length:
        end = start + chunk_size
        chunk_text = text[start:end]
        
        chunks.append({
            "id": str(uuid.uuid4()),
            "text": chunk_text,
            "chunk_index": chunk_index
        })
        
        chunk_index += 1
        start += chunk_size - chunk_overlap
    
    return chunks

async def setup_vector_db(document_id: str, chunks: List[Dict[str, Any]]):
    """Setup vector database (MongoDB or ChromaDB) with document chunks"""
    global chroma_collection
    from mongodb_client import use_mongodb as mongo_connected
    
    # Generate embeddings using OpenAI
    print(f"Generating embeddings for {len(chunks)} chunks...")
    texts = [chunk["text"] for chunk in chunks]
    embeddings = await get_embeddings(texts)
    
    if mongo_connected:
        # Store embeddings in MongoDB
        count = store_embeddings(document_id, chunks, embeddings)
        print(f"✅ {count} embeddings stored in MongoDB")
    else:
        # Use ChromaDB fallback
        try:
            chroma_client.delete_collection("documents")
        except:
            pass
        
        chroma_collection = chroma_client.create_collection(
            name="documents",
            metadata={"description": "Current document embeddings"}
        )
        
        chroma_collection.add(
            embeddings=embeddings,
            documents=texts,
            ids=[chunk["id"] for chunk in chunks]
        )
        print(f"✅ {len(chunks)} embeddings stored in ChromaDB")
    
    return len(chunks)

async def retrieve_relevant_chunks(query: str, document_id: str, k: int = 3) -> List[str]:
    """Retrieve top-k relevant chunks for a query"""
    global chroma_collection
    from mongodb_client import use_mongodb as mongo_connected
    
    if mongo_connected:
        # Use MongoDB search
        query_embeddings = await get_embeddings([query])
        results = search_similar_chunks(query_embeddings[0], document_id, k)
        return results
    else:
        # Use ChromaDB fallback
        if not chroma_collection:
            return []
        
        query_embeddings = await get_embeddings([query])
        results = chroma_collection.query(
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

async def evaluate_answer(question: str, user_answer: str, document_id: str) -> TutorEvaluation:
    """Evaluate user answer against document content using GPT"""
    # Retrieve relevant chunks for the question
    relevant_chunks = await retrieve_relevant_chunks(question, document_id, k=5)
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
    global document_text, document_chunks, current_document_id
    
    try:
        print(f"📄 Starting document upload: {file.filename}")
        
        # Step 1: Clear ALL previous document data
        document_text = ""
        document_chunks = []
        current_document_id = None
        
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
        
        # Step 3: Generate document ID and store metadata
        current_document_id = str(uuid.uuid4())
        store_document_metadata(current_document_id, file.filename, len(content), document_text)
        print(f"📝 Document metadata stored with ID: {current_document_id}")
        
        # Step 4: Chunk the document for processing
        document_chunks = chunk_document(document_text)
        print(f"✂️ Document chunked into {len(document_chunks)} pieces")
        
        # Step 5: Create embeddings and store in MongoDB
        print("🔄 Creating embeddings... (this may take a moment)")
        await setup_vector_db(current_document_id, document_chunks)
        
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
        current_document_id = None
        raise HTTPException(status_code=500, detail=f"Error processing document: {str(e)}")

@app.post("/chat", response_model=ChatResponse)
async def chat_with_document(request: ChatRequest):
    """Chat mode - answer questions using document content and GPT"""
    # Check if document is uploaded and embeddings are ready
    if not document_text or not current_document_id:
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
        relevant_chunks = await retrieve_relevant_chunks(request.message, current_document_id, k=3)
        
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

# Chat History Endpoints
@app.post("/chat/session/create")
async def create_new_chat_session():
    """Create a new chat session"""
    if not current_document_id:
        raise HTTPException(status_code=400, detail="No document uploaded")
    
    try:
        session_id = create_chat_session(current_document_id)
        return {"session_id": session_id, "document_id": current_document_id}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error creating session: {str(e)}")

@app.post("/chat/session/{session_id}/message")
async def send_chat_message(session_id: str, request: ChatRequest):
    """Send a message in a chat session and get response"""
    if not document_text or not current_document_id:
        raise HTTPException(status_code=400, detail="No document uploaded")
    
    try:
        # Store user message
        add_message_to_session(session_id, "user", request.message)
        
        # Check if it's a greeting
        if is_greeting_message(request.message):
            response_text = get_greeting_response(request.message)
            add_message_to_session(session_id, "assistant", response_text)
            return ChatResponse(response=response_text, sources=[])
        
        # Retrieve relevant chunks
        relevant_chunks = await retrieve_relevant_chunks(request.message, current_document_id, k=3)
        
        if not relevant_chunks:
            response_text = "I couldn't find relevant information in the document to answer your question."
            add_message_to_session(session_id, "assistant", response_text)
            return ChatResponse(response=response_text, sources=[])
        
        # Generate response
        context = " ".join(relevant_chunks)
        response_text = await generate_chat_response(request.message, context)
        
        # Store assistant response with sources
        add_message_to_session(session_id, "assistant", response_text, relevant_chunks[:2])
        
        return ChatResponse(response=response_text, sources=relevant_chunks[:2])
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error processing message: {str(e)}")

@app.get("/chat/session/{session_id}/history")
async def get_session_history(session_id: str):
    """Get chat history for a session"""
    try:
        history = get_chat_history(session_id)
        return {"session_id": session_id, "messages": history}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error getting history: {str(e)}")

@app.get("/chat/sessions")
async def get_chat_sessions():
    """Get all chat sessions for current document"""
    if not current_document_id:
        raise HTTPException(status_code=400, detail="No document uploaded")
    
    try:
        sessions = get_all_sessions(current_document_id)
        return {"document_id": current_document_id, "sessions": sessions}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error getting sessions: {str(e)}")

@app.delete("/chat/session/{session_id}")
async def delete_chat_session(session_id: str):
    """Delete a chat session"""
    try:
        delete_session(session_id)
        return {"success": True, "message": "Session deleted"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error deleting session: {str(e)}")

@app.get("/tutor/question", response_model=TutorQuestion)
async def get_tutor_question():
    """Get a question for tutor mode"""
    # Check if document is uploaded and embeddings are ready
    if not document_text or not current_document_id:
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
async def evaluate_tutor_answer_endpoint(request: TutorAnswerRequest):
    """Evaluate user's answer in tutor mode"""
    # Check if document is uploaded and embeddings are ready
    if not document_text or not current_document_id:
        raise HTTPException(
            status_code=400, 
            detail="No document uploaded. Please upload a PDF or TXT file first to use tutor mode!"
        )
    
    try:
        evaluation = await evaluate_answer(request.question, request.user_answer, current_document_id)
        return evaluation
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error evaluating answer: {str(e)}")

@app.post("/session/start")
async def start_new_session():
    """Start a new session - clear all previous document data"""
    global document_text, document_chunks, current_document_id
    
    try:
        # Clear all memory variables
        document_text = ""
        document_chunks = []
        current_document_id = None
        
        # Clear MongoDB data
        clear_all_data()
        
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
    global document_text, document_chunks, current_document_id
    
    try:
        # Clear all document data
        document_text = ""
        document_chunks = []
        current_document_id = None
        
        # Clear MongoDB data
        clear_all_data()
        
        return {"success": True, "message": "All document data cleared from memory and MongoDB"}
    except Exception as e:
        return {"success": False, "message": f"Error clearing data: {str(e)}"}

@app.get("/document/status")
async def get_document_status():
    """Get current document status"""
    return {
        "document_loaded": bool(document_text),
        "chunks_count": len(document_chunks) if document_chunks else 0,
        "document_id": current_document_id,
        "has_embeddings": current_document_id is not None
    }

@app.post("/voice/chat", response_model=VoiceResponse)
async def voice_chat(request: VoiceRequest):
    """Voice mode - chat with document using voice input"""
    # Check if document is uploaded
    if not document_text or not current_document_id:
        raise HTTPException(
            status_code=400,
            detail="No document uploaded. Please upload a PDF or TXT file first!"
        )
    
    try:
        # Check if it's a greeting
        if is_greeting_message(request.message):
            response_text = get_greeting_response(request.message)
            return VoiceResponse(
                response=response_text,
                audio_text=response_text,
                sources=[]
            )
        
        # Retrieve relevant chunks
        relevant_chunks = await retrieve_relevant_chunks(request.message, current_document_id, k=3)
        
        if not relevant_chunks:
            response_text = "I couldn't find relevant information in the document to answer your question."
            return VoiceResponse(
                response=response_text,
                audio_text=response_text,
                sources=[]
            )
        
        # Generate response
        context = " ".join(relevant_chunks)
        response_text = await generate_chat_response(request.message, context)
        
        return VoiceResponse(
            response=response_text,
            audio_text=response_text,
            sources=relevant_chunks[:2]
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error processing voice chat: {str(e)}")

@app.get("/voice/tutor/question")
async def voice_tutor_question():
    """Voice mode - get a tutor question"""
    # Check if document is uploaded
    if not document_text or not current_document_id:
        raise HTTPException(
            status_code=400,
            detail="No document uploaded. Please upload a PDF or TXT file first!"
        )
    
    try:
        question = await generate_question_from_document()
        return {
            "question": question,
            "audio_text": question
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error generating question: {str(e)}")

@app.post("/voice/tutor/evaluate")
async def voice_tutor_evaluate(request: TutorAnswerRequest):
    """Voice mode - evaluate tutor answer"""
    # Check if document is uploaded
    if not document_text or not current_document_id:
        raise HTTPException(
            status_code=400,
            detail="No document uploaded. Please upload a PDF or TXT file first!"
        )
    
    try:
        evaluation = await evaluate_answer(request.question, request.user_answer, current_document_id)
        
        # Create a voice-friendly response
        audio_text = f"You scored {evaluation.score} out of 10. "
        if evaluation.correct_points:
            audio_text += f"Good job on: {'. '.join(evaluation.correct_points)}. "
        if evaluation.missing_points:
            audio_text += f"You could improve: {'. '.join(evaluation.missing_points)}. "
        if evaluation.improved_answer:
            audio_text += f"Here's a better answer: {evaluation.improved_answer}"
        
        return {
            "score": evaluation.score,
            "correct_points": evaluation.correct_points,
            "missing_points": evaluation.missing_points,
            "improved_answer": evaluation.improved_answer,
            "audio_text": audio_text
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error evaluating answer: {str(e)}")

# Conversational Tutor Endpoints
@app.post("/conversational/chat")
async def conversational_chat(request: dict):
    """Conversational tutor - general chat"""
    try:
        session_id = request.get("session_id", "default")
        message = request.get("message", "")
        
        if not message:
            raise HTTPException(status_code=400, detail="Message is required")
        
        result = await get_tutor_response(session_id, message)
        return result
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error: {str(e)}")

@app.post("/conversational/evaluate")
async def conversational_evaluate(request: dict):
    """Conversational tutor - evaluate answer"""
    try:
        session_id = request.get("session_id", "default")
        question = request.get("question", "")
        answer = request.get("answer", "")
        
        if not question or not answer:
            raise HTTPException(status_code=400, detail="Question and answer are required")
        
        result = await evaluate_student_answer(session_id, question, answer)
        return result
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error: {str(e)}")

@app.post("/conversational/question")
async def conversational_question(request: dict):
    """Conversational tutor - generate practice question"""
    try:
        session_id = request.get("session_id", "default")
        topic = request.get("topic", None)
        
        result = await generate_practice_question(session_id, topic)
        return result
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error: {str(e)}")

@app.get("/conversational/progress/{session_id}")
async def conversational_progress(session_id: str):
    """Get conversational tutor progress"""
    try:
        progress = get_session_progress(session_id)
        return progress
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error: {str(e)}")

@app.post("/conversational/reset")
async def conversational_reset(request: dict):
    """Reset conversational tutor session"""
    try:
        session_id = request.get("session_id", "default")
        result = reset_session(session_id)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error: {str(e)}")

# Voice Processing Endpoints
@app.post("/voice/transcribe")
async def transcribe_audio(audio: UploadFile = File(...)):
    """Transcribe audio to text using Whisper Large V3"""
    try:
        # Read audio file
        audio_bytes = await audio.read()
        
        # Transcribe using Whisper
        text = await speech_to_text_from_bytes(audio_bytes, audio.filename)
        
        if not text:
            raise HTTPException(status_code=400, detail="Could not transcribe audio")
        
        return {"text": text}
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Transcription error: {str(e)}")

@app.post("/voice/synthesize")
async def synthesize_speech(request: dict):
    """Convert text to speech using Orpheus V1 English"""
    try:
        text = request.get("text", "")
        
        if not text:
            raise HTTPException(status_code=400, detail="Text is required")
        
        # Generate speech
        audio_bytes = await text_to_speech(text)
        
        if not audio_bytes:
            # Return empty response if TTS not available (browser will handle it)
            return {"audio": None, "message": "TTS not available, use browser TTS"}
        
        # Return audio as base64
        import base64
        audio_base64 = base64.b64encode(audio_bytes).decode('utf-8')
        
        return {"audio": audio_base64, "format": "mp3"}
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"TTS error: {str(e)}")

@app.get("/health")
async def health_check():
    """Health check endpoint"""
    from mongodb_client import get_db
    
    # Check MongoDB connection
    mongodb_connected = False
    try:
        db = get_db()
        if db is not None:
            mongodb_connected = True
    except:
        pass
    
    return {
        "status": "healthy",
        "document_loaded": bool(document_text),
        "chunks_count": len(document_chunks) if document_chunks else 0,
        "document_id": current_document_id,
        "mongodb_connected": mongodb_connected
    }

if __name__ == "__main__":
    import uvicorn
    # Ensure clean start - ready for new document upload
    ensure_clean_start()
    uvicorn.run(app, host="0.0.0.0", port=8000)
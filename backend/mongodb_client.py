"""
MongoDB Client Module with ChromaDB Fallback
Handles MongoDB Atlas connection and operations for vector embeddings and chat history
Falls back to ChromaDB if MongoDB connection fails
"""

import os
import ssl
from typing import List, Dict, Any, Optional
from datetime import datetime
from pymongo import MongoClient
from pymongo.errors import ConnectionFailure
from dotenv import load_dotenv
import uuid
import certifi

load_dotenv()

# MongoDB connection
MONGODB_URI = os.getenv("MONGODB_URI")
client = None
db = None
use_mongodb = False

def connect_mongodb():
    """Initialize MongoDB connection with SSL workaround"""
    global client, db, use_mongodb
    try:
        # Create SSL context with legacy support for OpenSSL 3.x
        import ssl
        ssl_context = ssl.SSLContext(ssl.PROTOCOL_TLS_CLIENT)
        ssl_context.check_hostname = False
        ssl_context.verify_mode = ssl.CERT_NONE
        
        # Connect with custom SSL context
        client = MongoClient(
            MONGODB_URI,
            tls=True,
            tlsAllowInvalidCertificates=True,
            tlsAllowInvalidHostnames=True,
            serverSelectionTimeoutMS=10000,
            connectTimeoutMS=10000
        )
        # Test connection
        client.admin.command('ping')
        db = client['document_learning']
        use_mongodb = True
        print("✅ MongoDB connected successfully - using MongoDB for storage")
        
        # Create indexes
        db.embeddings.create_index([("document_id", 1)])
        db.chat_history.create_index([("session_id", 1)])
        db.documents.create_index([("document_id", 1)])
        
        return True
    except Exception as e:
        print(f"⚠️ MongoDB connection failed - using ChromaDB fallback")
        use_mongodb = False
        return False

def get_db():
    """Get database instance or return None if using ChromaDB"""
    global use_mongodb
    if not use_mongodb:
        return None
    if db is None:
        connect_mongodb()
    return db

# Document operations
def store_document_metadata(document_id: str, filename: str, file_size: int, content: str):
    """Store document metadata (MongoDB only, skipped for ChromaDB)"""
    database = get_db()
    if database is None:
        return document_id  # Skip for ChromaDB
    
    doc = {
        "document_id": document_id,
        "filename": filename,
        "file_size": file_size,
        "content_length": len(content),
        "uploaded_at": datetime.utcnow(),
        "status": "processed"
    }
    database.documents.insert_one(doc)
    return document_id

# Vector embedding operations
def store_embeddings(document_id: str, chunks: List[Dict[str, Any]], embeddings: List[List[float]]):
    """Store document chunks with their embeddings (returns count, actual storage handled by main.py)"""
    database = get_db()
    if database is None:
        return len(embeddings)  # ChromaDB handles storage in main.py
    
    # Clear existing embeddings for this document
    database.embeddings.delete_many({"document_id": document_id})
    
    # Store new embeddings
    embedding_docs = []
    for i, (chunk, embedding) in enumerate(zip(chunks, embeddings)):
        embedding_docs.append({
            "document_id": document_id,
            "chunk_id": chunk["id"],
            "chunk_index": i,
            "text": chunk["text"],
            "embedding": embedding,
            "created_at": datetime.utcnow()
        })
    
    if embedding_docs:
        database.embeddings.insert_many(embedding_docs)
    
    return len(embedding_docs)

def search_similar_chunks(query_embedding: List[float], document_id: str, k: int = 5) -> List[str]:
    """Search for similar chunks using cosine similarity (returns empty for ChromaDB fallback)"""
    database = get_db()
    if database is None:
        return []  # ChromaDB handles search in main.py
    
    # Get all embeddings for the document
    embeddings_cursor = database.embeddings.find({"document_id": document_id})
    
    # Calculate cosine similarity
    results = []
    for doc in embeddings_cursor:
        similarity = cosine_similarity(query_embedding, doc["embedding"])
        results.append({
            "text": doc["text"],
            "similarity": similarity
        })
    
    # Sort by similarity and return top k
    results.sort(key=lambda x: x["similarity"], reverse=True)
    return [r["text"] for r in results[:k]]

def cosine_similarity(vec1: List[float], vec2: List[float]) -> float:
    """Calculate cosine similarity between two vectors"""
    import math
    dot_product = sum(a * b for a, b in zip(vec1, vec2))
    magnitude1 = math.sqrt(sum(a * a for a in vec1))
    magnitude2 = math.sqrt(sum(b * b for b in vec2))
    if magnitude1 == 0 or magnitude2 == 0:
        return 0
    return dot_product / (magnitude1 * magnitude2)

# Chat history operations
def create_chat_session(document_id: str) -> str:
    """Create a new chat session (in-memory for ChromaDB fallback)"""
    database = get_db()
    session_id = str(uuid.uuid4())
    
    if database is None:
        return session_id  # Return session ID but don't store
    
    session = {
        "session_id": session_id,
        "document_id": document_id,
        "title": "New Chat",  # Default title
        "messages": [],
        "created_at": datetime.utcnow(),
        "updated_at": datetime.utcnow()
    }
    
    database.chat_history.insert_one(session)
    return session_id

def add_message_to_session(session_id: str, role: str, content: str, sources: Optional[List[str]] = None):
    """Add a message to chat session and update title if first user message"""
    database = get_db()
    if database is None:
        return  # Skip for ChromaDB
    
    message = {
        "role": role,
        "content": content,
        "timestamp": datetime.utcnow()
    }
    
    if sources:
        message["sources"] = sources
    
    # Get current session to check if this is the first user message
    session = database.chat_history.find_one({"session_id": session_id})
    update_data = {
        "$push": {"messages": message},
        "$set": {"updated_at": datetime.utcnow()}
    }
    
    # If this is the first user message, set it as the title (truncated)
    if session and role == "user" and len(session.get("messages", [])) == 0:
        title = content[:50] + "..." if len(content) > 50 else content
        update_data["$set"]["title"] = title
    
    database.chat_history.update_one(
        {"session_id": session_id},
        update_data
    )

def get_chat_history(session_id: str) -> List[Dict[str, Any]]:
    """Get chat history for a session"""
    database = get_db()
    if database is None:
        return []  # No history for ChromaDB
    
    session = database.chat_history.find_one({"session_id": session_id})
    
    if session:
        return session.get("messages", [])
    return []

def get_all_sessions(document_id: str) -> List[Dict[str, Any]]:
    """Get all chat sessions for a document with titles"""
    database = get_db()
    if database is None:
        return []  # No sessions for ChromaDB
    
    sessions = database.chat_history.find(
        {"document_id": document_id},
        {"session_id": 1, "title": 1, "created_at": 1, "updated_at": 1, "_id": 0}
    ).sort("updated_at", -1)
    
    return list(sessions)

def delete_session(session_id: str):
    """Delete a chat session"""
    database = get_db()
    if database is None:
        return  # Skip for ChromaDB
    
    database.chat_history.delete_one({"session_id": session_id})

def clear_all_data():
    """Clear all data from MongoDB"""
    database = get_db()
    if database is None:
        return  # Skip for ChromaDB
    
    database.embeddings.delete_many({})
    database.chat_history.delete_many({})
    database.documents.delete_many({})
    print("✅ All MongoDB data cleared")

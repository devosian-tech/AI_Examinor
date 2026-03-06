"""
MongoDB Client Module
Handles MongoDB Atlas connection and operations for vector embeddings and chat history
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
    global client, db, use_mongodb
    
    try:
        if not MONGODB_URI:
            print("❌ MongoDB URI not found in environment variables")
            use_mongodb = False
            return False
        
        print(f"🔄 Connecting to MongoDB Atlas...")
        print(f"   URI length: {len(MONGODB_URI)} characters")
        
        import certifi
        
        # Configure TLS settings to handle SSL properly
        client = MongoClient(
            MONGODB_URI,
            serverSelectionTimeoutMS=10000,
            connectTimeoutMS=10000,
            tls=True,
            tlsAllowInvalidCertificates=True,
            tlsCAFile=certifi.where()
        )

        # Test connection
        result = client.admin.command('ping')
        print(f"   Ping result: {result}")

        db = client['document_learning']
        use_mongodb = True

        print("✅ MongoDB connected successfully")
        
        # Create indexes
        print("🔄 Creating database indexes...")
        db.embeddings.create_index([("document_id", 1)])
        db.chat_history.create_index([("session_id", 1)])
        db.documents.create_index([("document_id", 1)])
        try:
            db.users.create_index([("email", 1)], unique=True)
        except Exception as idx_error:
            # Index might already exist
            print(f"   Note: {idx_error}")
        
        print("✅ Database indexes ready")

        return True

    except Exception as e:
        print(f"❌ MongoDB connection failed: {type(e).__name__}")
        print(f"   Error details: {str(e)}")
        use_mongodb = False
        return False

def get_db():
    """Get database instance"""
    global use_mongodb
    if not use_mongodb:
        raise Exception("MongoDB not connected")
    if db is None:
        connect_mongodb()
    return db

# User operations
def create_user(email: str, password: str, first_name: str, last_name: str) -> Dict[str, Any]:
    """Create a new user"""
    database = get_db()
    
    # Check if user already exists
    existing_user = database.users.find_one({"email": email})
    if existing_user:
        raise Exception("User with this email already exists")
    
    import hashlib
    user_id = str(uuid.uuid4())
    password_hash = hashlib.sha256(password.encode()).hexdigest()
    
    user = {
        "user_id": user_id,
        "email": email,
        "password_hash": password_hash,
        "first_name": first_name,
        "last_name": last_name,
        "created_at": datetime.utcnow(),
        "last_login": datetime.utcnow()
    }
    
    database.users.insert_one(user)
    database.users.create_index([("email", 1)], unique=True)
    
    return {
        "user_id": user_id,
        "email": email,
        "first_name": first_name,
        "last_name": last_name
    }

def authenticate_user(email: str, password: str) -> Optional[Dict[str, Any]]:
    """Authenticate user and return user data"""
    database = get_db()
    
    import hashlib
    password_hash = hashlib.sha256(password.encode()).hexdigest()
    
    user = database.users.find_one({
        "email": email,
        "password_hash": password_hash
    })
    
    if not user:
        return None
    
    # Update last login
    database.users.update_one(
        {"user_id": user["user_id"]},
        {"$set": {"last_login": datetime.utcnow()}}
    )
    
    return {
        "user_id": user["user_id"],
        "email": user["email"],
        "first_name": user["first_name"],
        "last_name": user["last_name"]
    }

def get_user_by_id(user_id: str) -> Optional[Dict[str, Any]]:
    """Get user by ID"""
    database = get_db()
    
    user = database.users.find_one({"user_id": user_id})
    if not user:
        return None
    
    return {
        "user_id": user["user_id"],
        "email": user["email"],
        "first_name": user["first_name"],
        "last_name": user["last_name"]
    }

# Document operations
def store_document_metadata(document_id: str, filename: str, file_size: int, user_id: str):
    """Store document metadata"""
    database = get_db()
    
    doc = {
        "document_id": document_id,
        "user_id": user_id,
        "filename": filename,
        "file_size": file_size,
        "uploaded_at": datetime.utcnow(),
        "status": "processed"
    }
    database.documents.insert_one(doc)
    return document_id

# Vector embedding operations
def store_embeddings(document_id: str, chunks: List[Dict[str, Any]], embeddings: List[List[float]]):
    """Store document chunks with their embeddings in MongoDB"""
    database = get_db()
    
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
    """Search for similar chunks using cosine similarity"""
    database = get_db()
    
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
def create_chat_session(document_id: str, user_id: str) -> str:
    """Create a new chat session"""
    database = get_db()
    session_id = str(uuid.uuid4())
    
    session = {
        "session_id": session_id,
        "document_id": document_id,
        "user_id": user_id,
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
    
    session = database.chat_history.find_one({"session_id": session_id})
    
    if session:
        return session.get("messages", [])
    return []

def get_all_sessions(document_id: str) -> List[Dict[str, Any]]:
    """Get all chat sessions for a document with titles"""
    database = get_db()
    
    sessions = database.chat_history.find(
        {"document_id": document_id},
        {"session_id": 1, "title": 1, "created_at": 1, "updated_at": 1, "_id": 0}
    ).sort("updated_at", -1)
    
    return list(sessions)

def delete_session(session_id: str):
    """Delete a chat session"""
    database = get_db()
    
    database.chat_history.delete_one({"session_id": session_id})

def clear_all_data():
    """Clear all data from MongoDB"""
    database = get_db()
    
    database.embeddings.delete_many({})
    database.chat_history.delete_many({})
    database.documents.delete_many({})
    print("✅ All MongoDB data cleared")

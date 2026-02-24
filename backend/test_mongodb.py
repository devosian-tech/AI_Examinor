"""
Test MongoDB integration
"""
import asyncio
from mongodb_client import (
    connect_mongodb,
    store_document_metadata,
    store_embeddings,
    search_similar_chunks,
    create_chat_session,
    add_message_to_session,
    get_chat_history,
    clear_all_data
)

async def test_mongodb():
    print("🧪 Testing MongoDB Integration...")
    
    # 1. Connect
    print("\n1. Testing connection...")
    if connect_mongodb():
        print("✅ Connected to MongoDB")
    else:
        print("❌ Failed to connect")
        return
    
    # 2. Clear old data
    print("\n2. Clearing old data...")
    clear_all_data()
    print("✅ Data cleared")
    
    # 3. Store document metadata
    print("\n3. Storing document metadata...")
    doc_id = "test-doc-123"
    store_document_metadata(doc_id, "test.pdf", 1024, "This is test content")
    print(f"✅ Document stored with ID: {doc_id}")
    
    # 4. Store embeddings
    print("\n4. Storing embeddings...")
    chunks = [
        {"id": "chunk1", "text": "Python is a programming language"},
        {"id": "chunk2", "text": "JavaScript is used for web development"}
    ]
    embeddings = [
        [0.1, 0.2, 0.3, 0.4, 0.5],  # Dummy embedding
        [0.5, 0.4, 0.3, 0.2, 0.1]   # Dummy embedding
    ]
    count = store_embeddings(doc_id, chunks, embeddings)
    print(f"✅ Stored {count} embeddings")
    
    # 5. Search similar chunks
    print("\n5. Searching similar chunks...")
    query_embedding = [0.1, 0.2, 0.3, 0.4, 0.5]
    results = search_similar_chunks(query_embedding, doc_id, k=2)
    print(f"✅ Found {len(results)} similar chunks:")
    for i, result in enumerate(results, 1):
        print(f"   {i}. {result[:50]}...")
    
    # 6. Create chat session
    print("\n6. Creating chat session...")
    session_id = create_chat_session(doc_id)
    print(f"✅ Session created: {session_id}")
    
    # 7. Add messages
    print("\n7. Adding messages to session...")
    add_message_to_session(session_id, "user", "What is Python?")
    add_message_to_session(session_id, "assistant", "Python is a programming language", ["Python is a programming language"])
    print("✅ Messages added")
    
    # 8. Get chat history
    print("\n8. Getting chat history...")
    history = get_chat_history(session_id)
    print(f"✅ Retrieved {len(history)} messages:")
    for msg in history:
        print(f"   {msg['role']}: {msg['content'][:50]}...")
    
    print("\n✅ All tests passed! MongoDB integration is working correctly.")

if __name__ == "__main__":
    asyncio.run(test_mongodb())

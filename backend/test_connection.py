#!/usr/bin/env python3
"""
MongoDB Connection Test Script
Run this to verify MongoDB connection before starting the server
"""

import os
import sys
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

def test_mongodb_connection():
    """Test MongoDB connection with detailed output"""
    print("=" * 60)
    print("MongoDB Connection Test")
    print("=" * 60)
    
    # Check environment variable
    mongodb_uri = os.getenv("MONGODB_URI")
    if not mongodb_uri:
        print("❌ MONGODB_URI not found in .env file")
        return False
    
    print(f"✅ MONGODB_URI found ({len(mongodb_uri)} characters)")
    print(f"   Starts with: {mongodb_uri[:30]}...")
    
    # Test import
    try:
        from pymongo import MongoClient
        import certifi
        print("✅ Required packages imported successfully")
    except ImportError as e:
        print(f"❌ Import error: {e}")
        print("   Run: pip install pymongo[srv] certifi")
        return False
    
    # Test connection
    print("\n🔄 Testing MongoDB connection...")
    try:
        client = MongoClient(
            mongodb_uri,
            serverSelectionTimeoutMS=10000,
            connectTimeoutMS=10000,
            tls=True,
            tlsAllowInvalidCertificates=True,
            tlsCAFile=certifi.where()
        )
        
        # Ping database
        result = client.admin.command('ping')
        print(f"✅ Connection successful! Ping: {result}")
        
        # List databases
        databases = client.list_database_names()
        print(f"✅ Available databases: {databases}")
        
        # Check if our database exists
        if 'document_learning' in databases:
            print("✅ 'document_learning' database found")
            db = client['document_learning']
            collections = db.list_collection_names()
            print(f"   Collections: {collections if collections else 'None (new database)'}")
        else:
            print("ℹ️  'document_learning' database will be created on first use")
        
        client.close()
        print("\n" + "=" * 60)
        print("✅ ALL TESTS PASSED - MongoDB is ready!")
        print("=" * 60)
        return True
        
    except Exception as e:
        print(f"\n❌ Connection failed: {type(e).__name__}")
        print(f"   Error: {str(e)}")
        print("\n" + "=" * 60)
        print("Troubleshooting tips:")
        print("1. Check your MongoDB Atlas cluster is running")
        print("2. Verify network access settings (IP whitelist)")
        print("3. Confirm database user credentials")
        print("4. Check if your internet connection is stable")
        print("=" * 60)
        return False

if __name__ == "__main__":
    success = test_mongodb_connection()
    sys.exit(0 if success else 1)

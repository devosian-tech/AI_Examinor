#!/bin/bash

echo "=================================="
echo "Document Tutor API - Startup"
echo "=================================="
echo ""

# Activate virtual environment
if [ -d "venv" ]; then
    echo "✅ Activating virtual environment..."
    source venv/bin/activate
else
    echo "❌ Virtual environment not found!"
    echo "   Run: python3 -m venv venv && source venv/bin/activate && pip install -r requirements.txt"
    exit 1
fi

# Test MongoDB connection
echo ""
echo "🔄 Testing MongoDB connection..."
python3 test_connection.py

if [ $? -eq 0 ]; then
    echo ""
    echo "🚀 Starting server..."
    echo ""
    python3 main.py
else
    echo ""
    echo "❌ MongoDB connection test failed!"
    echo "   Please fix the connection issues before starting the server."
    exit 1
fi

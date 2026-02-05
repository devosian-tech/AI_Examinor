#!/bin/bash

echo "🚀 Starting Document Tutor Backend..."

cd backend

# Activate virtual environment
if [ -d "venv" ]; then
    source venv/bin/activate
    echo "✅ Virtual environment activated"
else
    echo "❌ Virtual environment not found. Run setup.sh first."
    exit 1
fi

# Start the server
echo "🌐 Starting FastAPI server on http://localhost:8000"
uvicorn main:app --reload --port 8000
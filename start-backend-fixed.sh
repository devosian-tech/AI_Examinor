#!/bin/bash

echo "🚀 Starting Document Tutor Backend (Fixed Version)..."

cd backend

# Check if virtual environment exists
if [ ! -d "venv" ]; then
    echo "❌ Virtual environment not found. Please run setup.sh first."
    exit 1
fi

# Check if uvicorn is installed
if [ ! -f "venv/bin/uvicorn" ]; then
    echo "❌ uvicorn not found in virtual environment. Installing dependencies..."
    source venv/bin/activate
    pip install -r requirements.txt
fi

echo "✅ Starting FastAPI server..."
echo "🌐 Backend will be available at: http://localhost:8000"
echo "📖 API docs will be available at: http://localhost:8000/docs"
echo "🛑 Press Ctrl+C to stop the server"
echo "=" * 50

# Start the server using the virtual environment's uvicorn
./venv/bin/uvicorn main:app --reload --port 8000 --host 0.0.0.0
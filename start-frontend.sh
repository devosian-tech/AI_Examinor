#!/bin/bash

echo "🎨 Starting Document Tutor Frontend..."

cd frontend

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo "❌ Dependencies not installed. Run setup.sh first."
    exit 1
fi

# Start the development server
echo "🌐 Starting React development server on http://localhost:5173"
npm run dev
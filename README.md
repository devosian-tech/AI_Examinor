# Document Tutor + Chatbot Application

A full-stack application that provides both tutoring and chatbot functionality based on uploaded documents using RAG (Retrieval-Augmented Generation).

## Features

- **Document Upload**: Support for PDF and TXT files
- **Chat Mode**: RAG-based chatbot using only document content with chat history
- **Tutor Mode**: Interactive Q&A with scoring and feedback
- **Vector Search**: Efficient document chunk retrieval using MongoDB Atlas
- **Chat History**: Persistent conversation history like ChatGPT
- **AI-Powered**: Uses GPT-OSS-20B via Groq API

## Technology Stack

### Backend
- FastAPI - REST API framework
- pdfplumber - PDF text extraction
- sentence-transformers - Text embeddings
- pymongo - MongoDB driver for vector storage
- MongoDB Atlas - Cloud database for embeddings and chat history
- Groq API - GPT-OSS-20B model access

### Frontend
- React + Vite - Modern frontend framework
- Tailwind CSS - Utility-first styling
- Axios - HTTP client

## Prerequisites

- Python 3.8+
- Node.js 16+
- Groq API key ([Get one here](https://console.groq.com))
- MongoDB Atlas account ([Sign up free](https://www.mongodb.com/cloud/atlas/register))

## Installation

### 1. Clone the repository
```bash
git clone <your-repo-url>
cd AI-tutor-devosian-3
```

### 2. Backend Setup
```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
```

### 3. Configure Environment Variables
```bash
cp .env.example .env
# Edit .env and add:
# - GROQ_API_KEY (from Groq Console)
# - MONGODB_URI (from MongoDB Atlas)
```

### 4. Frontend Setup
```bash
cd frontend
npm install
```

## Running the Application

### Option 1: Using Shell Scripts
```bash
# Terminal 1 - Start backend
./start-backend.sh

# Terminal 2 - Start frontend
./start-frontend.sh
```

### Option 2: Manual Start

**Backend:**
```bash
cd backend
source venv/bin/activate
python main.py
```

**Frontend:**
```bash
cd frontend
npm run dev
```

Visit http://localhost:5173 to use the application.

## Usage

1. Upload a PDF or TXT document
2. Choose between:
   - **Chat Mode**: Ask questions about the document (with persistent chat history)
   - **Tutor Mode**: Answer questions generated from the document

The system only uses information from your uploaded document - no external knowledge is used. Chat history is saved in MongoDB for future reference.

## Project Structure

```
.
├── backend/
│   ├── main.py              # FastAPI application
│   ├── gpt_model.py         # GPT model integration
│   ├── requirements.txt     # Python dependencies
│   └── .env                 # Environment variables (not in git)
├── frontend/
│   ├── src/
│   │   ├── App.jsx          # Main React component
│   │   └── components/      # React components
│   ├── package.json         # Node dependencies
│   └── vite.config.js       # Vite configuration
└── sample-documents/        # Example documents for testing
```

## API Endpoints

### Document Management
- `POST /upload` - Upload and process documents
- `POST /clear` - Clear all data
- `GET /document/status` - Get document status

### Chat (with history)
- `POST /chat/session/create` - Create new chat session
- `POST /chat/session/{session_id}/message` - Send message
- `GET /chat/session/{session_id}/history` - Get chat history
- `GET /chat/sessions` - List all sessions
- `DELETE /chat/session/{session_id}` - Delete session

### Tutor Mode
- `GET /tutor/question` - Generate tutor questions
- `POST /tutor/evaluate` - Evaluate tutor answers

### System
- `POST /session/start` - Initialize new session
- `GET /health` - Health check with MongoDB status

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request


## Acknowledgments

- Built with [Groq](https://groq.com) for fast AI inference
- Uses [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) for vector storage and chat history
- Powered by [FastAPI](https://fastapi.tiangolo.com/) and [React](https://react.dev/)

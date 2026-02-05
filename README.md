# Document Tutor + Chatbot Application

A full-stack application that provides both tutoring and chatbot functionality based on uploaded documents using RAG (Retrieval-Augmented Generation).

## Features

- **Document Upload**: Support for PDF and TXT files
- **Chat Mode**: RAG-based chatbot using only document content
- **Tutor Mode**: Interactive Q&A with scoring and feedback
- **Vector Search**: Efficient document chunk retrieval using ChromaDB
- **AI-Powered**: Uses GPT-OSS-20B via Groq API

## Technology Stack

### Backend
- FastAPI - REST API framework
- pdfplumber - PDF text extraction
- sentence-transformers - Text embeddings
- chromadb - Vector database
- langchain - Text processing utilities
- Groq API - GPT-OSS-20B model access

### Frontend
- React + Vite - Modern frontend framework
- Tailwind CSS - Utility-first styling
- Axios - HTTP client

## Prerequisites

- Python 3.8+
- Node.js 16+
- Groq API key ([Get one here](https://console.groq.com))

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
# Edit .env and add your GROQ_API_KEY
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
   - **Chat Mode**: Ask questions about the document
   - **Tutor Mode**: Answer questions generated from the document

The system only uses information from your uploaded document - no external knowledge is used.

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

- `POST /upload` - Upload and process documents
- `POST /chat` - Chat with document content
- `POST /tutor/question` - Generate tutor questions
- `POST /tutor/evaluate` - Evaluate tutor answers
- `POST /session/start` - Initialize new session

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- Built with [Groq](https://groq.com) for fast AI inference
- Uses [ChromaDB](https://www.trychroma.com/) for vector storage
- Powered by [FastAPI](https://fastapi.tiangolo.com/) and [React](https://react.dev/)

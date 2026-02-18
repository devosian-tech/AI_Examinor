# Document Learning Platform - Backend

FastAPI backend for document-based learning with AI tutoring capabilities.

## Railway Deployment

### Environment Variables Required:
- `GROQ_API_KEY` - Your Groq API key for LLM access

### Deployment Steps:
1. Push code to GitHub
2. Create new project on Railway
3. Connect GitHub repository
4. Set root directory to `backend`
5. Add `GROQ_API_KEY` environment variable
6. Deploy

Railway will automatically:
- Detect Python app
- Install dependencies from requirements.txt
- Start server using Procfile

### Local Development:
```bash
cd backend
pip install -r requirements.txt
uvicorn main:app --reload
```

### API Endpoints:
- `POST /upload` - Upload PDF/TXT document
- `POST /chat` - Chat with document
- `GET /tutor/question` - Get practice question
- `POST /tutor/evaluate` - Evaluate answer
- `POST /voice/chat` - Voice chat
- `GET /voice/tutor/question` - Voice tutor question

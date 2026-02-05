# Frontend Integration Guide

## Auto-Clear Embeddings Feature

To ensure old embeddings are cleared when users refresh the page or start a new session, add these API calls to your frontend:

### 1. On Page Load/Refresh

Add this to your main component's `useEffect` or page load handler:

```javascript
// React example
useEffect(() => {
  // Clear old embeddings when page loads/refreshes
  fetch('http://localhost:8000/session/start', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
  })
  .then(response => response.json())
  .then(data => {
    console.log('Session started:', data.message);
  })
  .catch(error => {
    console.error('Error starting session:', error);
  });
}, []); // Empty dependency array = runs once on mount
```

### 2. Before Document Upload

The upload endpoint already clears old data, but you can also call the session start for extra safety:

```javascript
const handleFileUpload = async (file) => {
  // Optional: Clear session before upload
  await fetch('http://localhost:8000/session/start', { method: 'POST' });
  
  // Then upload the file
  const formData = new FormData();
  formData.append('file', file);
  
  const response = await fetch('http://localhost:8000/upload', {
    method: 'POST',
    body: formData,
  });
  
  const result = await response.json();
  console.log('Upload result:', result);
};
```

### 3. Check Document Status

You can check if a document is currently loaded:

```javascript
const checkDocumentStatus = async () => {
  const response = await fetch('http://localhost:8000/document/status');
  const status = await response.json();
  
  console.log('Document loaded:', status.document_loaded);
  console.log('Chunks count:', status.chunks_count);
  console.log('Has embeddings:', status.has_embeddings);
};
```

## Available Endpoints

- `POST /session/start` - Clear all old data and start fresh session
- `POST /upload` - Upload document (automatically clears old data)
- `GET /document/status` - Check current document status
- `POST /clear` - Manual clear (for debugging)
- `GET /health` - Server health check

## Behavior Summary

✅ **Server Startup** - Clears any existing embeddings
✅ **Page Refresh** - Call `/session/start` to clear old data  
✅ **New Upload** - Automatically clears old embeddings
✅ **Manual Clear** - Use `/clear` endpoint if needed

This ensures users always start with a clean state!
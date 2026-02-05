import React, { useState } from 'react';
import DocumentUpload from './components/DocumentUpload';
import ModeSelector from './components/ModeSelector';
import ChatMode from './components/ChatMode';
import TutorMode from './components/TutorMode';

function App() {
  const [documentUploaded, setDocumentUploaded] = useState(false);
  const [selectedMode, setSelectedMode] = useState(null);

  const handleDocumentUpload = () => {
    setDocumentUploaded(true);
    setSelectedMode(null);
  };

  const handleModeSelect = (mode) => {
    setSelectedMode(mode);
  };

  const handleBackToModes = () => {
    setSelectedMode(null);
  };

  const handleNewDocument = () => {
    setDocumentUploaded(false);
    setSelectedMode(null);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <h1 className="text-2xl font-bold text-gray-900">
            Document Tutor + Chatbot
          </h1>
          <p className="text-gray-600 mt-1">
            Upload a document and choose between chat or tutor mode
          </p>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8">
        {!documentUploaded ? (
          <DocumentUpload onUploadSuccess={handleDocumentUpload} />
        ) : !selectedMode ? (
          <ModeSelector 
            onModeSelect={handleModeSelect}
            onNewDocument={handleNewDocument}
          />
        ) : selectedMode === 'chat' ? (
          <ChatMode 
            onBack={handleBackToModes}
            onNewDocument={handleNewDocument}
          />
        ) : (
          <TutorMode 
            onBack={handleBackToModes}
            onNewDocument={handleNewDocument}
          />
        )}
      </main>
    </div>
  );
}

export default App;
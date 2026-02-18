import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, useNavigate } from 'react-router-dom';
import DocumentUpload from './components/DocumentUpload';
import ModeSelector from './components/ModeSelector';
import ChatMode from './components/ChatMode';
import TutorMode from './components/TutorMode';
import ConversationalTutor from './components/ConversationalTutor';

function MainApp() {
  const [documentUploaded, setDocumentUploaded] = useState(false);
  const navigate = useNavigate();

  const handleDocumentUpload = () => {
    setDocumentUploaded(true);
  };

  const handleModeSelect = (mode) => {
    if (mode === 'conversational') {
      navigate('/voice-tutor');
    } else if (mode === 'chat') {
      navigate('/chat');
    } else if (mode === 'tutor') {
      navigate('/tutor');
    }
  };

  const handleNewDocument = () => {
    setDocumentUploaded(false);
  };

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-slate-950 via-indigo-950 to-slate-950 overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-violet-600/20 rounded-full blur-3xl animate-pulse-slow"></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-cyan-600/20 rounded-full blur-3xl animate-pulse-slow" style={{ animationDelay: '1s' }}></div>
        <div className="absolute top-1/2 left-1/2 w-96 h-96 bg-pink-600/10 rounded-full blur-3xl animate-pulse-slow" style={{ animationDelay: '2s' }}></div>
      </div>

      {/* Grid overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:100px_100px] [mask-image:radial-gradient(ellipse_80%_80%_at_50%_50%,black_40%,transparent_100%)]"></div>

      <header className="relative border-b border-white/10 bg-black/20 backdrop-blur-2xl z-50">
        <div className="max-w-7xl mx-auto px-8 py-4">
          <div className="flex items-center gap-4">
            <div className="relative group">
              <div className="absolute -inset-1 bg-gradient-to-r from-violet-600 via-pink-600 to-cyan-600 rounded-xl blur-lg opacity-75 group-hover:opacity-100 transition"></div>
              <div className="relative w-10 h-10 bg-gradient-to-br from-violet-600 via-pink-600 to-cyan-600 rounded-xl flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
            </div>
            <div>
              <h1 className="text-lg font-bold text-transparent bg-clip-text bg-gradient-to-r from-white via-violet-200 to-cyan-200">
                Document Learning Platform
              </h1>
              <p className="text-xs text-violet-300/60">AI-Powered Knowledge Assistant</p>
            </div>
          </div>
        </div>
      </header>

      <main className="relative h-[calc(100vh-73px)] overflow-y-auto">
        <div className="max-w-7xl mx-auto px-8 py-8 flex items-center justify-center min-h-full">
          {!documentUploaded ? (
            <DocumentUpload onUploadSuccess={handleDocumentUpload} />
          ) : (
            <ModeSelector 
              onModeSelect={handleModeSelect}
              onNewDocument={handleNewDocument}
            />
          )}
        </div>
      </main>

      <style jsx>{`
        @keyframes pulse-slow {
          0%, 100% { opacity: 0.2; transform: scale(1); }
          50% { opacity: 0.3; transform: scale(1.1); }
        }
        .animate-pulse-slow {
          animation: pulse-slow 8s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}

function ChatPage() {
  const navigate = useNavigate();

  return (
    <ChatMode 
      onBack={() => navigate('-1')}
      onNewDocument={() => navigate('/')}
    />
  );
}

function TutorPage() {
  const navigate = useNavigate();

  return (
    <TutorMode 
      onBack={() => navigate('/')}
      onNewDocument={() => navigate('/')}
    />
  );
}

function VoiceTutorPage() {
  const navigate = useNavigate();

  return (
    <ConversationalTutor 
      onBack={() => navigate('/')}
      onNewDocument={() => navigate('/')}
    />
  );
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<MainApp />} />
        <Route path="/chat" element={<ChatPage />} />
        <Route path="/tutor" element={<TutorPage />} />
        <Route path="/voice-tutor" element={<VoiceTutorPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
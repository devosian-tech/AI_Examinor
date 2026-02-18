import { useState, useEffect, useRef } from 'react';
import axios from 'axios';

const ConversationalTutor = ({ onBack, onNewDocument }) => {
  const [sessionId] = useState(() => `session_${Date.now()}`);
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState(null);
  const [isListening, setIsListening] = useState(false);
  const [isProcessingAudio, setIsProcessingAudio] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const recognitionRef = useRef(null);
  const synthRef = useRef(window.speechSynthesis);
  const audioRef = useRef(null);

  useEffect(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;
      recognitionRef.current.lang = 'en-US';
      recognitionRef.current.maxAlternatives = 1;

      let finalTranscript = '';
      let silenceTimer = null;

      recognitionRef.current.onresult = (event) => {
        let interimTranscript = '';
        
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            finalTranscript += transcript + ' ';
          } else {
            interimTranscript += transcript;
          }
        }

        setInputMessage(finalTranscript + interimTranscript);

        if (silenceTimer) clearTimeout(silenceTimer);

        silenceTimer = setTimeout(() => {
          if (finalTranscript.trim()) {
            setIsListening(false);
            setIsProcessingAudio(true);
            recognitionRef.current.stop();
            handleSendMessage(finalTranscript.trim());
            finalTranscript = '';
          }
        }, 2000);
      };

      recognitionRef.current.onerror = (event) => {
        if (event.error !== 'no-speech' && event.error !== 'aborted') {
          setIsListening(false);
          setIsProcessingAudio(false);
        }
      };

      recognitionRef.current.onend = () => {
        setIsListening(false);
        setIsProcessingAudio(false);
      };

      recognitionRef.current.onstart = () => {
        setIsListening(true);
        setIsProcessingAudio(false);
      };
    }

    addMessage('assistant', "Hey there! I'm your AI tutor. What would you like to learn today?");
    speak("Hey there! I'm your AI tutor. What would you like to learn today?");
    fetchProgress();

    return () => {
      if (recognitionRef.current) recognitionRef.current.stop();
      if (audioRef.current) audioRef.current.pause();
      synthRef.current.cancel();
    };
  }, []);

  const addMessage = (role, content) => {
    setMessages(prev => [...prev, { role, content, timestamp: new Date() }]);
  };

  const speak = (text) => {
    setIsSpeaking(true);
    axios.post('http://localhost:8000/voice/synthesize', { text })
      .then(res => {
        if (res.data.audio) {
          const audio = new Audio(`data:audio/mp3;base64,${res.data.audio}`);
          audioRef.current = audio;
          audio.play();
          audio.onended = () => {
            audioRef.current = null;
            setIsSpeaking(false);
            setTimeout(() => startListening(), 500);
          };
        } else {
          useBrowserTTS(text);
        }
      })
      .catch(() => useBrowserTTS(text));
  };

  const useBrowserTTS = (text) => {
    synthRef.current.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.9;
    utterance.pitch = 1;
    utterance.volume = 1;
    utterance.onend = () => {
      setIsSpeaking(false);
      setTimeout(() => startListening(), 500);
    };
    synthRef.current.speak(utterance);
  };

  const startListening = () => {
    if (recognitionRef.current && !isListening) {
      try {
        setInputMessage('');
        recognitionRef.current.start();
      } catch (err) {
        if (err.name !== 'InvalidStateError') console.error('Error starting recognition:', err);
      }
    }
  };

  const stopListening = () => {
    if (recognitionRef.current && isListening) recognitionRef.current.stop();
  };

  const stopSpeaking = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
    synthRef.current.cancel();
    setIsSpeaking(false);
  };

  const fetchProgress = async () => {
    try {
      const res = await axios.get(`http://localhost:8000/conversational/progress/${sessionId}`);
      setProgress(res.data);
    } catch (err) {
      console.error('Error fetching progress:', err);
    }
  };

  const handleSendMessage = async (messageText = null) => {
    const text = messageText || inputMessage.trim();
    if (!text || isLoading) return;

    setInputMessage('');
    setIsLoading(true);
    setIsProcessingAudio(false);
    addMessage('user', text);

    try {
      if (text.toLowerCase().includes('quiz me') || text.toLowerCase().includes('test me') || text.toLowerCase().includes('practice')) {
        const res = await axios.post('http://localhost:8000/conversational/question', {
          session_id: sessionId,
          topic: text.replace(/quiz me|test me|practice/gi, '').trim() || null
        });
        addMessage('assistant', res.data.question);
        speak(res.data.question);
        setProgress(res.data.session_info);
      } else {
        const res = await axios.post('http://localhost:8000/conversational/chat', {
          session_id: sessionId,
          message: text
        });
        addMessage('assistant', res.data.response);
        speak(res.data.response);
        setProgress(res.data.session_info);
      }
    } catch (err) {
      const errorMsg = err.response?.data?.detail || 'Error communicating with tutor';
      addMessage('assistant', errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = async () => {
    try {
      await axios.post('http://localhost:8000/conversational/reset', { session_id: sessionId });
      setMessages([]);
      addMessage('assistant', "Session reset! What would you like to study?");
      fetchProgress();
    } catch (err) {
      console.error('Error resetting session:', err);
    }
  };

  return (
    <div className="fixed inset-0 bg-zinc-950 overflow-hidden">
      {/* Subtle grid background */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:80px_80px]"></div>
      
      {/* Minimal gradient accents */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-violet-600/10 rounded-full blur-[120px]"></div>
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-cyan-600/10 rounded-full blur-[120px]"></div>

      {/* Top bar - minimal and clean */}
      <div className="absolute top-0 left-0 right-0 z-50 border-b border-white/5">
        <div className="max-w-7xl mx-auto px-8 py-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-gradient-to-br from-violet-600 to-cyan-600 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
            </div>
            <div>
              <h1 className="text-lg font-semibold text-white">Voice Tutor</h1>
              <p className="text-xs text-zinc-500">AI Learning Assistant</p>
            </div>
          </div>
          
          {progress && progress.questions_asked > 0 && (
            <div className="flex items-center gap-8">
              <div className="text-right">
                <div className="text-xs text-zinc-500 mb-1">Accuracy</div>
                <div className="text-2xl font-bold text-white">{progress.accuracy.toFixed(0)}%</div>
              </div>
              <div className="text-right">
                <div className="text-xs text-zinc-500 mb-1">Score</div>
                <div className="text-2xl font-bold text-white">{progress.correct_answers}/{progress.questions_asked}</div>
              </div>
            </div>
          )}
          
          <button
            onClick={onBack}
            className="px-4 py-2 text-sm text-zinc-400 hover:text-white transition-colors"
          >
            Exit
          </button>
        </div>
      </div>

      {/* Main content - centered and minimal */}
      <div className="absolute inset-0 flex items-center justify-center pt-20 pb-24">
        <div className="relative z-10 flex flex-col items-center max-w-4xl w-full px-8">
          
          {/* AI Core - clean and sophisticated */}
          <div className="relative mb-16">
            {/* Subtle outer ring */}
            {(isSpeaking || isListening || isLoading) && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className={`w-[420px] h-[420px] rounded-full border ${
                  isSpeaking ? 'border-violet-500/20' : isLoading ? 'border-cyan-500/20' : 'border-emerald-500/20'
                } animate-pulse-ring`}></div>
              </div>
            )}
            
            {/* Main orb - minimalist design */}
            <div className="relative">
              <div className={`absolute -inset-4 rounded-full blur-2xl transition-all duration-700 ${
                isSpeaking ? 'bg-violet-600/20' : 
                isLoading ? 'bg-cyan-600/20' :
                isListening ? 'bg-emerald-600/20' : 
                'bg-zinc-700/10'
              }`}></div>
              
              <div className={`relative w-72 h-72 rounded-full transition-all duration-700 ${
                isSpeaking ? 'bg-gradient-to-br from-violet-600/90 to-violet-800/90' : 
                isLoading ? 'bg-gradient-to-br from-cyan-600/90 to-cyan-800/90' :
                isListening ? 'bg-gradient-to-br from-emerald-600/90 to-emerald-800/90' : 
                'bg-gradient-to-br from-zinc-800/90 to-zinc-900/90'
              } backdrop-blur-xl border border-white/10 shadow-2xl flex items-center justify-center`}>
                
                {isSpeaking ? (
                  <div className="relative">
                    <svg className="w-32 h-32 text-white/90" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19.114 5.636a9 9 0 010 12.728M16.463 8.288a5.25 5.25 0 010 7.424M6.75 8.25l4.72-4.72a.75.75 0 011.28.53v15.88a.75.75 0 01-1.28.53l-4.72-4.72H4.51c-.88 0-1.704-.507-1.938-1.354A9.01 9.01 0 012.25 12c0-.83.112-1.633.322-2.396C2.806 8.756 3.63 8.25 4.51 8.25H6.75z" />
                    </svg>
                  </div>
                ) : isLoading ? (
                  <div className="relative w-32 h-32">
                    <div className="absolute inset-0 border-4 border-white/10 rounded-full"></div>
                    <div className="absolute inset-0 border-4 border-transparent border-t-white/80 rounded-full animate-spin"></div>
                  </div>
                ) : isListening ? (
                  <div className="relative">
                    <svg className="w-32 h-32 text-white/90" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 18.75a6 6 0 006-6v-1.5m-6 7.5a6 6 0 01-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15.75a3 3 0 01-3-3V4.5a3 3 0 116 0v8.25a3 3 0 01-3 3z" />
                    </svg>
                  </div>
                ) : (
                  <svg className="w-32 h-32 text-white/40" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a5.969 5.969 0 01-.474-.065 4.48 4.48 0 00.978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z" />
                  </svg>
                )}
              </div>
            </div>
          </div>

          
          {/* Status text - clean typography */}
          <div className="text-center mb-12 w-full">
            <h2 className={`text-5xl font-light tracking-tight mb-4 transition-colors duration-700 ${
              isSpeaking ? 'text-violet-400' : 
              isLoading ? 'text-cyan-400' :
              isListening ? 'text-emerald-400' : 
              'text-white'
            }`}>
              {isSpeaking ? 'Speaking' : 
               isLoading ? 'Processing' :
               isListening ? 'Listening' : 
               'Ready'}
            </h2>
            
            <p className="text-lg text-zinc-500 mb-8">
              {isSpeaking ? 'AI is responding' : 
               isLoading ? 'Analyzing your input' :
               isListening ? 'Speak naturally' : 
               'Press the button to begin'}
            </p>
            
            {/* Transcript display */}
            {isListening && inputMessage && (
              <div className="bg-zinc-900/50 backdrop-blur-xl rounded-2xl p-6 border border-white/5 max-w-2xl mx-auto">
                <p className="text-white/80 text-lg">{inputMessage}</p>
              </div>
            )}
          </div>
          
          {/* Control button - minimal and elegant */}
          <div className="relative">
            {isSpeaking ? (
              <button
                onClick={stopSpeaking}
                className="group relative px-12 py-4 bg-zinc-900 hover:bg-zinc-800 border border-white/10 hover:border-white/20 rounded-full transition-all"
              >
                <span className="text-white font-medium flex items-center gap-3">
                  <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                  Stop
                </span>
              </button>
            ) : !isLoading && (
              <button
                onClick={() => (isListening ? stopListening() : startListening())}
                className={`group relative px-12 py-4 rounded-full transition-all ${
                  isListening
                    ? 'bg-zinc-900 hover:bg-zinc-800 border border-white/10 hover:border-white/20'
                    : 'bg-white hover:bg-zinc-100 border border-white/20'
                }`}
                disabled={isProcessingAudio}
              >
                <span className={`font-medium flex items-center gap-3 ${
                  isListening ? 'text-white' : 'text-zinc-900'
                }`}>
                  {isListening ? (
                    <>
                      <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
                      Stop
                    </>
                  ) : (
                    <>
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 18.75a6 6 0 006-6v-1.5m-6 7.5a6 6 0 01-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15.75a3 3 0 01-3-3V4.5a3 3 0 116 0v8.25a3 3 0 01-3 3z" />
                      </svg>
                      Start
                    </>
                  )}
                </span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Bottom bar - minimal */}
      <div className="absolute bottom-0 left-0 right-0 z-50 border-t border-white/5">
        <div className="max-w-7xl mx-auto px-8 py-6 flex gap-4 justify-center">
          <button
            onClick={handleReset}
            className="px-6 py-2 text-sm text-zinc-400 hover:text-white transition-colors"
          >
            Reset
          </button>
          <button
            onClick={onNewDocument}
            className="px-6 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-sm text-white transition-all"
          >
            New Document
          </button>
        </div>
      </div>

      <style jsx>{`
        @keyframes pulse-ring {
          0%, 100% { transform: scale(1); opacity: 0.3; }
          50% { transform: scale(1.02); opacity: 0.5; }
        }
        .animate-pulse-ring {
          animation: pulse-ring 3s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
};

export default ConversationalTutor;

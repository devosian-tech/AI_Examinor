import { useState, useRef, useEffect } from 'react';
import axios from 'axios';

const VoiceMode = ({ onBack, onNewDocument }) => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [response, setResponse] = useState('');
  const [mode, setMode] = useState('chat'); // 'chat' or 'tutor'
  const [currentQuestion, setCurrentQuestion] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState('');
  
  const recognitionRef = useRef(null);
  const synthRef = useRef(window.speechSynthesis);

  useEffect(() => {
    // Initialize speech recognition
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;
      recognitionRef.current.lang = 'en-US';

      recognitionRef.current.onresult = (event) => {
        const text = event.results[0][0].transcript;
        setTranscript(text);
        handleVoiceInput(text);
      };

      recognitionRef.current.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
        setError(`Speech recognition error: ${event.error}`);
        setIsListening(false);
      };

      recognitionRef.current.onend = () => {
        setIsListening(false);
      };
    } else {
      setError('Speech recognition is not supported in your browser.');
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, [mode, currentQuestion]);

  const startListening = () => {
    if (recognitionRef.current && !isListening) {
      setError('');
      setTranscript('');
      setResponse('');
      recognitionRef.current.start();
      setIsListening(true);
    }
  };

  const stopListening = () => {
    if (recognitionRef.current && isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    }
  };

  const speak = (text) => {
    // Cancel any ongoing speech
    synthRef.current.cancel();
    
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.9;
    utterance.pitch = 1;
    utterance.volume = 1;
    
    synthRef.current.speak(utterance);
  };

  const handleVoiceInput = async (text) => {
    setIsProcessing(true);
    setError('');

    try {
      if (mode === 'chat') {
        // Voice chat mode
        const res = await axios.post('http://localhost:8000/voice/chat', {
          message: text,
          mode: 'chat'
        });
        
        setResponse(res.data.response);
        speak(res.data.audio_text);
      } else {
        // Voice tutor mode - evaluate answer
        if (!currentQuestion) {
          setError('No question available. Please get a question first.');
          return;
        }

        const res = await axios.post('http://localhost:8000/voice/tutor/evaluate', {
          question: currentQuestion,
          user_answer: text
        });
        
        const feedback = `You scored ${res.data.score} out of 10. ${res.data.audio_text}`;
        setResponse(feedback);
        speak(res.data.audio_text);
      }
    } catch (err) {
      const errorMsg = err.response?.data?.detail || 'Error processing voice input';
      setError(errorMsg);
      speak(errorMsg);
    } finally {
      setIsProcessing(false);
    }
  };

  const getNewQuestion = async () => {
    setIsProcessing(true);
    setError('');
    setTranscript('');
    setResponse('');

    try {
      const res = await axios.get('http://localhost:8000/voice/tutor/question');
      setCurrentQuestion(res.data.question);
      speak(res.data.audio_text);
    } catch (err) {
      const errorMsg = err.response?.data?.detail || 'Error getting question';
      setError(errorMsg);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-2xl font-bold mb-6 text-gray-800">🎤 Voice Mode</h2>

        {/* Mode Selector */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Select Mode:
          </label>
          <div className="flex gap-4">
            <button
              onClick={() => setMode('chat')}
              className={`px-6 py-2 rounded-lg font-medium transition-colors ${
                mode === 'chat'
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              Voice Chat
            </button>
            <button
              onClick={() => setMode('tutor')}
              className={`px-6 py-2 rounded-lg font-medium transition-colors ${
                mode === 'tutor'
                  ? 'bg-green-500 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              Voice Tutor
            </button>
          </div>
        </div>

        {/* Tutor Mode - Get Question Button */}
        {mode === 'tutor' && (
          <div className="mb-6">
            <button
              onClick={getNewQuestion}
              disabled={isProcessing}
              className="w-full bg-green-500 text-white py-3 rounded-lg hover:bg-green-600 disabled:bg-gray-400 transition-colors font-medium"
            >
              {isProcessing ? 'Loading...' : 'Get New Question'}
            </button>
            {currentQuestion && (
              <div className="mt-4 p-4 bg-green-50 rounded-lg border border-green-200">
                <p className="font-medium text-green-800">Question:</p>
                <p className="text-gray-700 mt-2">{currentQuestion}</p>
              </div>
            )}
          </div>
        )}

        {/* Voice Control */}
        <div className="mb-6 text-center">
          <button
            onClick={isListening ? stopListening : startListening}
            disabled={isProcessing || (mode === 'tutor' && !currentQuestion)}
            className={`w-32 h-32 rounded-full text-white font-bold text-lg shadow-lg transition-all ${
              isListening
                ? 'bg-red-500 hover:bg-red-600 animate-pulse'
                : 'bg-blue-500 hover:bg-blue-600'
            } disabled:bg-gray-400 disabled:cursor-not-allowed`}
          >
            {isListening ? '🎤 Stop' : '🎤 Speak'}
          </button>
          <p className="mt-4 text-sm text-gray-600">
            {isListening
              ? 'Listening... Speak now'
              : mode === 'chat'
              ? 'Click to ask a question'
              : 'Click to answer the question'}
          </p>
        </div>

        {/* Transcript */}
        {transcript && (
          <div className="mb-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <p className="font-medium text-blue-800">You said:</p>
            <p className="text-gray-700 mt-2">{transcript}</p>
          </div>
        )}

        {/* Response */}
        {response && (
          <div className="mb-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
            <p className="font-medium text-gray-800">Response:</p>
            <p className="text-gray-700 mt-2 whitespace-pre-wrap">{response}</p>
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="mb-4 p-4 bg-red-50 rounded-lg border border-red-200">
            <p className="font-medium text-red-800">Error:</p>
            <p className="text-red-600 mt-2">{error}</p>
          </div>
        )}

        {/* Instructions */}
        <div className="mt-6 p-4 bg-yellow-50 rounded-lg border border-yellow-200">
          <p className="font-medium text-yellow-800">Instructions:</p>
          <ul className="list-disc list-inside text-sm text-gray-700 mt-2 space-y-1">
            <li>Make sure your microphone is enabled</li>
            <li>Voice Chat: Ask questions about the document</li>
            <li>Voice Tutor: Get a question, then answer it using voice</li>
            <li>Responses will be spoken aloud automatically</li>
          </ul>
        </div>

        {/* Navigation Buttons */}
        <div className="mt-6 flex gap-4">
          <button
            onClick={onBack}
            className="flex-1 bg-gray-500 text-white py-2 rounded-lg hover:bg-gray-600 transition-colors"
          >
            ← Back to Modes
          </button>
          <button
            onClick={onNewDocument}
            className="flex-1 bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600 transition-colors"
          >
            📄 New Document
          </button>
        </div>
      </div>
    </div>
  );
};

export default VoiceMode;

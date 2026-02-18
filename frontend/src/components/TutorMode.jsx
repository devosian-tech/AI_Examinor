import { useState, useEffect } from 'react';
import axios from 'axios';

const TutorMode = ({ onBack, onNewDocument }) => {
  const [currentQuestion, setCurrentQuestion] = useState('');
  const [userAnswer, setUserAnswer] = useState('');
  const [evaluation, setEvaluation] = useState(null);
  const [loading, setLoading] = useState(false);
  const [questionLoading, setQuestionLoading] = useState(false);

  const fetchNewQuestion = async () => {
    setQuestionLoading(true);
    setEvaluation(null);
    setUserAnswer('');

    try {
      // Add timestamp to prevent caching
      const response = await axios.get(`http://localhost:8000/tutor/question?t=${Date.now()}`);
      setCurrentQuestion(response.data.question);
    } catch (error) {
      setCurrentQuestion('Error loading question. Please try again.');
    } finally {
      setQuestionLoading(false);
    }
  };

  const submitAnswer = async () => {
    if (!userAnswer.trim()) return;

    setLoading(true);

    try {
      const response = await axios.post('http://localhost:8000/tutor/evaluate', {
        question: currentQuestion,
        user_answer: userAnswer
      });

      setEvaluation(response.data);
    } catch (error) {
      setEvaluation({
        score: 0,
        correct_points: [],
        missing_points: ['Error evaluating answer. Please try again.'],
        improved_answer: 'Unable to provide feedback at this time.'
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNewQuestion();
  }, []);

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-slate-950 via-indigo-950 to-slate-950 overflow-hidden">
      {/* Animated background */}
      <div className="absolute inset-0">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-violet-600/20 rounded-full blur-3xl animate-pulse-slow"></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-cyan-600/20 rounded-full blur-3xl animate-pulse-slow" style={{ animationDelay: '1s' }}></div>
        <div className="absolute top-1/2 left-1/2 w-96 h-96 bg-pink-600/10 rounded-full blur-3xl animate-pulse-slow" style={{ animationDelay: '2s' }}></div>
      </div>

      {/* Grid overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:100px_100px] [mask-image:radial-gradient(ellipse_80%_80%_at_50%_50%,black_40%,transparent_100%)]"></div>

      {/* Header */}
      <div className="relative border-b border-white/10 bg-black/20 backdrop-blur-2xl z-50">
        <div className="max-w-7xl mx-auto px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="relative group">
                <div className="absolute -inset-1 bg-gradient-to-r from-emerald-600 via-green-600 to-emerald-600 rounded-xl blur-lg opacity-75 group-hover:opacity-100 transition"></div>
                <div className="relative w-10 h-10 bg-gradient-to-br from-emerald-600 via-green-600 to-emerald-600 rounded-xl flex items-center justify-center">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.26 10.147a60.436 60.436 0 00-.491 6.347A48.627 48.627 0 0112 20.904a48.627 48.627 0 018.232-4.41 60.46 60.46 0 00-.491-6.347m-15.482 0a50.57 50.57 0 00-2.658-.813A59.905 59.905 0 0112 3.493a59.902 59.902 0 0110.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.697 50.697 0 0112 13.489a50.702 50.702 0 017.74-3.342M6.75 15a.75.75 0 100-1.5.75.75 0 000 1.5zm0 0v-3.675A55.378 55.378 0 0112 8.443m-7.007 11.55A5.981 5.981 0 006.75 15.75v-1.5" />
                  </svg>
                </div>
              </div>
              <div>
                <h1 className="text-lg font-bold text-transparent bg-clip-text bg-gradient-to-r from-white via-violet-200 to-cyan-200">
                  Tutor Mode
                </h1>
                <p className="text-xs text-violet-300/60">Practice & Get Feedback</p>
              </div>
            </div>
            
            <div className="flex gap-3">
              <button
                onClick={onBack}
                className="px-4 py-2 text-sm text-slate-400 hover:text-white transition-colors"
              >
                ← Back
              </button>
              <button
                onClick={onNewDocument}
                className="px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-sm text-white transition-all"
              >
                New Document
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="relative h-[calc(100vh-73px)] overflow-hidden">
        <div className="flex h-full">
          {/* Quiz Section - Slides to left when evaluation is shown */}
          <div className={`transition-all duration-700 ease-in-out ${
            evaluation ? 'w-1/2' : 'w-full'
          } h-full overflow-y-auto`}>
            <div className="max-w-4xl mx-auto px-6 py-4">
              {/* Question Section */}
              <div className="mb-4">
                <div className="flex justify-between items-center mb-3">
                  <h3 className="text-sm font-semibold text-white">Question</h3>
                  <button
                    onClick={fetchNewQuestion}
                    disabled={questionLoading}
                    className="group relative"
                  >
                    <div className="absolute -inset-1 bg-gradient-to-r from-violet-600 via-pink-600 to-cyan-600 rounded-lg blur opacity-50 group-hover:opacity-75 transition"></div>
                    <div className="relative flex items-center gap-2 px-4 py-2 bg-slate-900 border border-white/10 rounded-lg text-sm text-white transition-all hover:bg-slate-800">
                      <svg className={`w-4 h-4 ${questionLoading ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                      </svg>
                      {questionLoading ? 'Loading...' : 'New Question'}
                    </div>
                  </button>
                </div>
                
                {questionLoading ? (
                  <div className="bg-slate-900/50 backdrop-blur-xl border border-white/10 rounded-xl p-4">
                    <div className="animate-pulse space-y-2">
                      <div className="h-3 bg-slate-700 rounded w-3/4"></div>
                      <div className="h-3 bg-slate-700 rounded w-1/2"></div>
                    </div>
                  </div>
                ) : (
                  <div className="relative group">
                    <div className="absolute -inset-0.5 bg-gradient-to-r from-violet-600 via-pink-600 to-cyan-600 rounded-xl blur opacity-20 group-hover:opacity-30 transition"></div>
                    <div className="relative bg-slate-900/90 backdrop-blur-xl border border-white/10 rounded-xl p-4">
                      <p className="text-white leading-relaxed text-sm">{currentQuestion}</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Answer Section */}
              <div className="mb-4">
                <h3 className="text-sm font-semibold text-white mb-3">Your Answer</h3>
                <textarea
                  value={userAnswer}
                  onChange={(e) => setUserAnswer(e.target.value)}
                  placeholder="Type your answer here..."
                  className="w-full bg-slate-900/90 backdrop-blur-xl border border-white/10 rounded-xl px-3 py-2 text-sm text-white placeholder-slate-500 resize-none focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-transparent transition-all"
                  rows="6"
                  disabled={loading || questionLoading}
                />
                
                <div className="mt-3 flex justify-end">
                  <button
                    onClick={submitAnswer}
                    disabled={!userAnswer.trim() || loading || questionLoading}
                    className="group/btn relative"
                  >
                    <div className="absolute -inset-0.5 bg-gradient-to-r from-violet-600 via-pink-600 to-cyan-600 rounded-lg blur opacity-75 group-hover/btn:opacity-100 transition"></div>
                    <div className={`relative flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                      !userAnswer.trim() || loading || questionLoading
                        ? 'bg-slate-800 text-slate-600 cursor-not-allowed'
                        : 'bg-gradient-to-r from-violet-600 via-pink-600 to-cyan-600 text-white shadow-2xl'
                    }`}>
                      {loading ? (
                        <>
                          <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Evaluating...
                        </>
                      ) : (
                        <>
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          Submit Answer
                        </>
                      )}
                    </div>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Evaluation Section - Slides in from right */}
          <div className={`transition-all duration-700 ease-in-out border-l border-white/10 ${
            evaluation ? 'w-1/2 opacity-100' : 'w-0 opacity-0'
          } h-full overflow-y-auto bg-slate-950/50 backdrop-blur-xl scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-transparent`}>
            {evaluation && (
              <div className="px-6 py-4 min-h-full">
                <div className="space-y-3 pb-4">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-sm font-semibold text-white">Evaluation Report</h3>
                    <button
                      onClick={fetchNewQuestion}
                      className="group/btn relative"
                    >
                      <div className="absolute -inset-1 bg-gradient-to-r from-violet-600 via-pink-600 to-cyan-600 rounded-lg blur opacity-50 group-hover/btn:opacity-75 transition"></div>
                      <div className="relative flex items-center gap-2 px-4 py-2 bg-slate-900 border border-white/10 rounded-lg text-sm text-white transition-all hover:bg-slate-800">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                        </svg>
                        Next Question
                      </div>
                    </button>
                  </div>
                  
                  {/* Score */}
                  <div className="relative group">
                    <div className="absolute -inset-0.5 bg-gradient-to-r from-violet-600 via-pink-600 to-cyan-600 rounded-xl blur opacity-30 transition"></div>
                    <div className="relative bg-slate-900/90 backdrop-blur-xl border border-white/10 rounded-xl p-4">
                      <div className="flex items-center justify-center mb-3">
                        <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl font-bold text-lg ${
                          evaluation.score >= 8 ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40' :
                          evaluation.score >= 6 ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/40' :
                          'bg-red-500/20 text-red-400 border border-red-500/40'
                        }`}>
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                          </svg>
                          {evaluation.score}/10
                        </div>
                      </div>
                      <div className="bg-slate-800 rounded-full h-2.5 overflow-hidden mb-4">
                        <div 
                          className={`h-full transition-all duration-700 ease-out ${
                            evaluation.score >= 8 ? 'bg-gradient-to-r from-emerald-500 to-green-500' :
                            evaluation.score >= 6 ? 'bg-gradient-to-r from-yellow-500 to-orange-500' :
                            'bg-gradient-to-r from-red-500 to-pink-500'
                          }`}
                          style={{ width: `${evaluation.score * 10}%` }}
                        ></div>
                      </div>

                      {/* Correct Points */}
                      <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-lg p-3 mb-3">
                        <h4 className="text-xs font-semibold text-emerald-400 mb-2 flex items-center gap-1.5">
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          Correct Points
                        </h4>
                        {evaluation.correct_points.length > 0 ? (
                          <ul className="space-y-1.5">
                            {evaluation.correct_points.map((point, index) => (
                              <li key={index} className="flex items-start gap-2 text-xs text-slate-300 leading-relaxed">
                                <span className="text-emerald-400 mt-0.5 flex-shrink-0">✓</span>
                                <span className="break-words">{point}</span>
                              </li>
                            ))}
                          </ul>
                        ) : (
                          <p className="text-xs text-slate-500 italic">No correct points identified</p>
                        )}
                      </div>

                      {/* Missing Points */}
                      <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3 mb-3">
                        <h4 className="text-xs font-semibold text-red-400 mb-2 flex items-center gap-1.5">
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          Missing/Wrong Points
                        </h4>
                        {evaluation.missing_points.length > 0 ? (
                          <ul className="space-y-1.5">
                            {evaluation.missing_points.map((point, index) => (
                              <li key={index} className="flex items-start gap-2 text-xs text-slate-300 leading-relaxed">
                                <span className="text-red-400 mt-0.5 flex-shrink-0">✗</span>
                                <span className="break-words">{point}</span>
                              </li>
                            ))}
                          </ul>
                        ) : (
                          <p className="text-xs text-slate-500 italic">No missing points</p>
                        )}
                      </div>

                      {/* Improved Answer */}
                      <div className="bg-violet-500/10 border border-violet-500/20 rounded-lg p-3">
                        <h4 className="text-xs font-semibold text-violet-400 mb-2 flex items-center gap-1.5">
                          <svg className="w-3.5 h-3.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                          </svg>
                          Improved Answer
                        </h4>
                        <div className="max-h-64 overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-violet-500/30 scrollbar-track-transparent">
                          <p className="text-xs text-slate-300 leading-relaxed break-words whitespace-pre-wrap">{evaluation.improved_answer}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

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
};

export default TutorMode;

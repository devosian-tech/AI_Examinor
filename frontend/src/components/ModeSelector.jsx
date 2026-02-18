import React from 'react';

const ModeSelector = ({ onModeSelect, onNewDocument }) => {
  const modes = [
    {
      id: 'chat',
      name: 'Chat Mode',
      description: 'Interactive Q&A with your document',
      gradient: 'from-blue-600 via-cyan-600 to-blue-600',
      glowColor: 'blue',
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.5">
          <path strokeLinecap="round" strokeLinejoin="round" d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a5.969 5.969 0 01-.474-.065 4.48 4.48 0 00.978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z" />
        </svg>
      ),
      features: ['RAG-powered responses', 'Source citations', 'Context-aware']
    },
    {
      id: 'tutor',
      name: 'Tutor Mode',
      description: 'Practice with AI-generated questions',
      gradient: 'from-emerald-600 via-green-600 to-emerald-600',
      glowColor: 'emerald',
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.5">
          <path strokeLinecap="round" strokeLinejoin="round" d="M4.26 10.147a60.436 60.436 0 00-.491 6.347A48.627 48.627 0 0112 20.904a48.627 48.627 0 018.232-4.41 60.46 60.46 0 00-.491-6.347m-15.482 0a50.57 50.57 0 00-2.658-.813A59.905 59.905 0 0112 3.493a59.902 59.902 0 0110.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.697 50.697 0 0112 13.489a50.702 50.702 0 017.74-3.342M6.75 15a.75.75 0 100-1.5.75.75 0 000 1.5zm0 0v-3.675A55.378 55.378 0 0112 8.443m-7.007 11.55A5.981 5.981 0 006.75 15.75v-1.5" />
        </svg>
      ),
      features: ['Auto questions', 'Instant feedback', 'Progress tracking']
    },
    {
      id: 'conversational',
      name: 'Voice Tutor',
      description: 'Natural voice-based learning',
      gradient: 'from-violet-600 via-pink-600 to-violet-600',
      glowColor: 'violet',
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.5">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 18.75a6 6 0 006-6v-1.5m-6 7.5a6 6 0 01-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15.75a3 3 0 01-3-3V4.5a3 3 0 116 0v8.25a3 3 0 01-3 3z" />
        </svg>
      ),
      features: ['Voice interface', 'Natural dialogue', 'Adaptive learning']
    }
  ];

  return (
    <div className="w-full max-w-6xl">
      <div className="text-center mb-10">
        <div className="relative inline-block mb-4">
          <div className="absolute -inset-4 bg-gradient-to-r from-emerald-600 to-cyan-600 rounded-full blur-2xl opacity-50 animate-pulse"></div>
          <div className="relative w-16 h-16 bg-gradient-to-br from-emerald-600 to-cyan-600 rounded-full flex items-center justify-center shadow-2xl">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="3">
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </div>
        </div>
        <h2 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-white via-violet-200 to-cyan-200 mb-3">
          Document Ready
        </h2>
        <p className="text-lg text-slate-400">
          Choose your preferred learning mode
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-6 mb-8">
        {modes.map((mode, idx) => (
          <button
            key={mode.id}
            onClick={() => onModeSelect(mode.id)}
            className="group relative text-left"
          >
            <div className={`absolute -inset-1 bg-gradient-to-r ${mode.gradient} rounded-3xl blur-xl opacity-0 group-hover:opacity-60 transition duration-500`}></div>
            
            <div className="relative h-full bg-slate-900/90 backdrop-blur-xl border border-white/10 group-hover:border-white/20 rounded-3xl p-6 transition-all duration-300 group-hover:transform group-hover:scale-[1.02]">
              <div className="mb-5 relative">
                <div className={`absolute -inset-2 bg-gradient-to-r ${mode.gradient} rounded-2xl blur-lg opacity-50 group-hover:opacity-75 transition`}></div>
                <div className={`relative w-14 h-14 bg-gradient-to-br ${mode.gradient} rounded-2xl flex items-center justify-center text-white shadow-2xl`}>
                  {mode.icon}
                </div>
              </div>
              
              <h3 className="text-xl font-bold text-white mb-2 group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-white group-hover:to-violet-200 transition">
                {mode.name}
              </h3>
              <p className="text-slate-400 mb-5 text-sm leading-relaxed">
                {mode.description}
              </p>
              
              <div className="space-y-2 mb-5">
                {mode.features.map((feature, featureIdx) => (
                  <div key={featureIdx} className="flex items-center gap-2 text-xs text-slate-300">
                    <div className={`w-1.5 h-1.5 rounded-full bg-gradient-to-r ${mode.gradient}`}></div>
                    <span>{feature}</span>
                  </div>
                ))}
              </div>

              <div className="flex items-center gap-2 text-slate-400 group-hover:text-white transition text-sm">
                <span className="font-medium">Get Started</span>
                <svg className="w-4 h-4 transform group-hover:translate-x-1 transition" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </div>

              <div className={`absolute top-4 right-4 w-6 h-6 border-t-2 border-r-2 border-${mode.glowColor}-500/30 rounded-tr-xl opacity-0 group-hover:opacity-100 transition`}></div>
              <div className={`absolute bottom-4 left-4 w-6 h-6 border-b-2 border-l-2 border-${mode.glowColor}-500/30 rounded-bl-xl opacity-0 group-hover:opacity-100 transition`}></div>
            </div>
          </button>
        ))}
      </div>

      <div className="text-center pt-6 border-t border-white/5">
        <button
          onClick={onNewDocument}
          className="group inline-flex items-center gap-2 text-slate-400 hover:text-white transition-colors text-sm"
        >
          <svg className="w-4 h-4 transform group-hover:-translate-x-1 transition" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
          <span className="font-medium">Upload a different document</span>
        </button>
      </div>
    </div>
  );
};

export default ModeSelector;

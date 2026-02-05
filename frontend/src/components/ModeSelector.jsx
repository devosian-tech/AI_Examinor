import React from 'react';

const ModeSelector = ({ onModeSelect, onNewDocument }) => {
  return (
    <div className="bg-white rounded-lg shadow-md p-8">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Document Processed Successfully!
        </h2>
        <p className="text-gray-600">
          Choose how you'd like to interact with your document
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Chat Mode */}
        <div 
          onClick={() => onModeSelect('chat')}
          className="border-2 border-gray-200 rounded-lg p-6 hover:border-blue-500 hover:bg-blue-50 cursor-pointer transition-all group"
        >
          <div className="text-center">
            <div className="mb-4">
              <svg className="mx-auto h-12 w-12 text-blue-600 group-hover:text-blue-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Chat Mode
            </h3>
            <p className="text-gray-600 text-sm mb-4">
              Ask questions and get answers based only on your document content
            </p>
            <ul className="text-xs text-gray-500 text-left space-y-1">
              <li>• RAG-powered responses</li>
              <li>• Document-only knowledge</li>
              <li>• Interactive Q&A</li>
            </ul>
          </div>
        </div>

        {/* Tutor Mode */}
        <div 
          onClick={() => onModeSelect('tutor')}
          className="border-2 border-gray-200 rounded-lg p-6 hover:border-green-500 hover:bg-green-50 cursor-pointer transition-all group"
        >
          <div className="text-center">
            <div className="mb-4">
              <svg className="mx-auto h-12 w-12 text-green-600 group-hover:text-green-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Tutor Mode
            </h3>
            <p className="text-gray-600 text-sm mb-4">
              Answer questions generated from your document and get scored feedback
            </p>
            <ul className="text-xs text-gray-500 text-left space-y-1">
              <li>• Document-based questions</li>
              <li>• Scoring & feedback</li>
              <li>• Learning assessment</li>
            </ul>
          </div>
        </div>
      </div>

      <div className="mt-8 text-center">
        <button
          onClick={onNewDocument}
          className="text-gray-500 hover:text-gray-700 text-sm underline"
        >
          Upload a different document
        </button>
      </div>
    </div>
  );
};

export default ModeSelector;
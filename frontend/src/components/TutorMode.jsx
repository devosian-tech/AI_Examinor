import React, { useState, useEffect } from 'react';
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
      const response = await axios.get('http://localhost:8000/tutor/question');
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

  const getScoreColor = (score) => {
    if (score >= 8) return 'text-green-600';
    if (score >= 6) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreBackground = (score) => {
    if (score >= 8) return 'bg-green-100';
    if (score >= 6) return 'bg-yellow-100';
    return 'bg-red-100';
  };

  useEffect(() => {
    fetchNewQuestion();
  }, []);

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      {/* Header */}
      <div className="border-b pb-4 mb-6 flex justify-between items-center">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">Tutor Mode</h2>
          <p className="text-sm text-gray-600">Answer questions and get feedback</p>
        </div>
        <div className="flex space-x-2">
          <button
            onClick={onBack}
            className="px-3 py-1 text-sm text-gray-600 hover:text-gray-800"
          >
            ← Back
          </button>
          <button
            onClick={onNewDocument}
            className="px-3 py-1 text-sm text-blue-600 hover:text-blue-800"
          >
            New Document
          </button>
        </div>
      </div>

      {/* Question Section */}
      <div className="mb-6">
        <div className="flex justify-between items-center mb-3">
          <h3 className="text-md font-medium text-gray-900">Question:</h3>
          <button
            onClick={fetchNewQuestion}
            disabled={questionLoading}
            className="text-sm text-blue-600 hover:text-blue-800 disabled:text-gray-400"
          >
            {questionLoading ? 'Loading...' : 'New Question'}
          </button>
        </div>
        
        {questionLoading ? (
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            </div>
          </div>
        ) : (
          <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
            <p className="text-gray-800">{currentQuestion}</p>
          </div>
        )}
      </div>

      {/* Answer Section */}
      <div className="mb-6">
        <h3 className="text-md font-medium text-gray-900 mb-3">Your Answer:</h3>
        <textarea
          value={userAnswer}
          onChange={(e) => setUserAnswer(e.target.value)}
          placeholder="Type your answer here..."
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
          rows="4"
          disabled={loading || questionLoading}
        />
        
        <div className="mt-3 flex justify-end">
          <button
            onClick={submitAnswer}
            disabled={!userAnswer.trim() || loading || questionLoading}
            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? 'Evaluating...' : 'Submit Answer'}
          </button>
        </div>
      </div>

      {/* Evaluation Section */}
      {evaluation && (
        <div className="border-t pt-6">
          <h3 className="text-md font-medium text-gray-900 mb-4">Evaluation:</h3>
          
          {/* Score */}
          <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium mb-4 ${getScoreBackground(evaluation.score)} ${getScoreColor(evaluation.score)}`}>
            Score: {evaluation.score}/10
          </div>

          <div className="grid md:grid-cols-2 gap-4 mb-4">
            {/* Correct Points */}
            <div>
              <h4 className="text-sm font-medium text-green-700 mb-2">✓ What's Correct:</h4>
              {evaluation.correct_points.length > 0 ? (
                <ul className="text-sm text-gray-700 space-y-1">
                  {evaluation.correct_points.map((point, index) => (
                    <li key={index} className="flex items-start">
                      <span className="text-green-500 mr-2">•</span>
                      {point}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-gray-500 italic">No specific correct points identified</p>
              )}
            </div>

            {/* Missing Points */}
            <div>
              <h4 className="text-sm font-medium text-red-700 mb-2">✗ What's Missing/Wrong:</h4>
              {evaluation.missing_points.length > 0 ? (
                <ul className="text-sm text-gray-700 space-y-1">
                  {evaluation.missing_points.map((point, index) => (
                    <li key={index} className="flex items-start">
                      <span className="text-red-500 mr-2">•</span>
                      {point}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-gray-500 italic">No missing points identified</p>
              )}
            </div>
          </div>

          {/* Improved Answer */}
          <div>
            <h4 className="text-sm font-medium text-blue-700 mb-2">💡 Improved Answer:</h4>
            <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
              <p className="text-sm text-gray-800">{evaluation.improved_answer}</p>
            </div>
          </div>

          <div className="mt-4 text-center">
            <button
              onClick={fetchNewQuestion}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Next Question
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default TutorMode;
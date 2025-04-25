// pages/PlayQuestionPage.jsx
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { motion } from 'framer-motion';
import { ClockIcon } from '@heroicons/react/24/outline';

export default function PlayQuestionPage() {
  const { sessionId } = useParams();
  const [question, setQuestion] = useState(null);
  const [selectedAnswers, setSelectedAnswers] = useState([]);
  const [timeLeft, setTimeLeft] = useState(0);
  const [showResults, setShowResults] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    const fetchQuestion = async () => {
      try {
        const res = await axios.get(`/play/session/${sessionId}/question`, { headers: { Authorization: `Bearer ${token}` } });
        setQuestion(res.data.question);
        setTimeLeft(res.data.question.duration);
        setSelectedAnswers([]);
        setShowResults(false);
      } catch (err) {
        console.error('Failed to fetch question:', err);
        navigate('/play/join');
      }
    };

    fetchQuestion();
    const interval = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(interval);
          setShowResults(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [sessionId, navigate]);

  const submitAnswer = async () => {
    const token = localStorage.getItem('token');
    try {
      await axios.post(`/play/session/${sessionId}/answer`, { answers: selectedAnswers }, { headers: { Authorization: `Bearer ${token}` } });
      setShowResults(true);
    } catch (err) {
      console.error('Failed to submit answer:', err);
    }
  };

  if (!question) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Timer */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl shadow-lg p-6 mb-8 flex items-center justify-center"
        >
          <div className="flex items-center space-x-3">
            <ClockIcon className="w-8 h-8 text-blue-600" />
            <span className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 text-transparent bg-clip-text">
              {timeLeft}s
            </span>
          </div>
        </motion.div>

        {/* Question Card */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-2xl shadow-lg p-8 mb-8"
        >
          <h2 className="text-3xl font-bold text-gray-800 mb-6">{question.stem}</h2>
          
          {/* Media Display */}
          {question.mediaUrl && (
            <div className="mb-8">
              {question.mediaUrl.endsWith('.mp4') ? (
                <video 
                  src={question.mediaUrl} 
                  controls 
                  className="w-full rounded-xl shadow-md" 
                />
              ) : (
                <img 
                  src={question.mediaUrl} 
                  alt="Question media" 
                  className="w-full rounded-xl shadow-md" 
                />
              )}
            </div>
          )}

          {/* Options */}
          <div className="space-y-4">
            {question.options.map((option, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 + index * 0.1 }}
                className={`p-4 rounded-xl border-2 cursor-pointer transition-all duration-200 transform hover:scale-[1.02] ${
                  selectedAnswers.includes(index)
                    ? 'border-blue-500 bg-blue-50 shadow-md'
                    : 'border-gray-200 hover:border-blue-300 hover:shadow-md'
                }`}
                onClick={() => {
                  if (showResults) return;
                  if (question.type === 'single') {
                    setSelectedAnswers([index]);
                  } else {
                    setSelectedAnswers(prev =>
                      prev.includes(index)
                        ? prev.filter(i => i !== index)
                        : [...prev, index]
                    );
                  }
                }}
              >
                <div className="flex items-center space-x-4">
                  <div className={`flex-shrink-0 h-6 w-6 rounded-lg border-2 ${
                    selectedAnswers.includes(index)
                      ? 'border-blue-500 bg-blue-500'
                      : 'border-gray-300'
                  }`}>
                    {selectedAnswers.includes(index) && (
                      <svg className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </div>
                  <span className="text-lg text-gray-700">{option}</span>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Submit Button */}
        {!showResults && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="flex justify-center"
          >
            <button
              onClick={submitAnswer}
              disabled={selectedAnswers.length === 0}
              className={`px-8 py-4 text-xl font-medium rounded-xl transition-all duration-200 ${
                selectedAnswers.length === 0
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700 transform hover:scale-105 hover:shadow-lg'
              }`}
            >
              Submit Answer
            </button>
          </motion.div>
        )}

        {/* Results Message */}
        {showResults && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="text-center bg-white rounded-2xl shadow-lg p-8"
          >
            <h3 className="text-2xl font-bold text-gray-800 mb-4">Answer Submitted!</h3>
            <p className="text-lg text-gray-600">Waiting for the next question...</p>
            <div className="mt-6">
              <div className="animate-spin rounded-full h-8 w-8 border-4 border-blue-500 border-t-transparent mx-auto"></div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
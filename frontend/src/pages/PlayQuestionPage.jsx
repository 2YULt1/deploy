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

  if (!question) return <div>Loading...</div>;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Timer */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-xl shadow-md p-6 mb-8"
        >
          <div className="flex items-center justify-center space-x-2">
            <ClockIcon className="w-6 h-6 text-gray-600" />
            <span className="text-2xl font-bold text-gray-800">{timeLeft}</span>
          </div>
        </motion.div>

        {/* Question Card */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-xl shadow-md p-6 mb-8"
        >
          <h2 className="text-2xl font-bold text-gray-800 mb-4">{question.stem}</h2>
          
          {/* Media Display */}
          {question.mediaUrl && (
            <div className="mb-6">
              {question.mediaUrl.endsWith('.mp4') ? (
                <video src={question.mediaUrl} controls className="w-full rounded-lg" />
              ) : (
                <img src={question.mediaUrl} alt="Question media" className="w-full rounded-lg" />
              )}
            </div>
          )}

          {/* Options */}
          <div className="space-y-3">
            {question.options.map((option, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 + index * 0.1 }}
                className={`p-4 rounded-lg border-2 cursor-pointer transition-colors ${
                  selectedAnswers.includes(index)
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-blue-300'
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
                <div className="flex items-center space-x-3">
                  <input
                    type={question.type === 'single' ? 'radio' : 'checkbox'}
                    checked={selectedAnswers.includes(index)}
                    readOnly
                    className={`h-5 w-5 ${
                      question.type === 'single' ? 'text-blue-600' : 'text-blue-600'
                    }`}
                  />
                  <span className="text-lg">{option}</span>
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
            <motion.button
              onClick={submitAnswer}
              disabled={selectedAnswers.length === 0}
              className={`px-8 py-4 text-lg font-medium rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                selectedAnswers.length === 0
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500'
              }`}
              whileHover={{ scale: selectedAnswers.length > 0 ? 1.05 : 1 }}
              whileTap={{ scale: selectedAnswers.length > 0 ? 0.95 : 1 }}
            >
              Submit Answer
            </motion.button>
          </motion.div>
        )}

        {/* Results Message */}
        {showResults && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="text-center"
          >
            <p className="text-gray-600 text-lg">Waiting for next question...</p>
          </motion.div>
        )}
      </div>
    </div>
  );
}
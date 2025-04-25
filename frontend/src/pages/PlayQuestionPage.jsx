// pages/PlayQuestionPage.jsx
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import { useParams, useNavigate } from 'react-router-dom';
import timerIcon from '../assets/timer-icon.png';

export default function PlayQuestionPage() {
  const { playerId } = useParams();
  const [question, setQuestion] = useState(null);
  const [timeLeft, setTimeLeft] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState([]);
  const [showResults, setShowResults] = useState(false);
  const [results, setResults] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetch = async () => {
      const res = await axios.get(`/play/${playerId}/question`);
      setQuestion(res.data.question);
      setTimeLeft(res.data.question.duration);
      setSelectedAnswers([]);
      setShowResults(false);
      setResults(null);
    };
    fetch();
  }, [playerId]);

  useEffect(() => {
    if (!timeLeft) return;
    const interval = setInterval(() => setTimeLeft(t => t - 1), 1000);
    return () => clearInterval(interval);
  }, [timeLeft]);

  const handleAnswer = async (index) => {
    if (showResults) return;
    
    let newSelected;
    if (question.type === 'single') {
      newSelected = [index];
    } else if (question.type === 'multiple') {
      newSelected = selectedAnswers.includes(index)
        ? selectedAnswers.filter(i => i !== index)
        : [...selectedAnswers, index];
    } else {
      newSelected = [index];
    }

    setSelectedAnswers(newSelected);
    
    try {
      await axios.put(`/play/${playerId}/answer`, { answers: newSelected });
    } catch (err) {
      console.error('Failed to submit answer:', err);
    }
  };

  useEffect(() => {
    if (timeLeft === 0 && !showResults) {
      const fetchResults = async () => {
        const res = await axios.get(`/play/${playerId}/results`);
        setResults(res.data);
        setShowResults(true);
      };
      fetchResults();
    }
  }, [timeLeft, playerId, showResults]);

  if (!question) return <div>Loading...</div>;

  const renderMedia = () => {
    if (!question.mediaUrl) return null;
    
    if (question.mediaUrl.includes('youtube.com')) {
      const videoId = question.mediaUrl.split('v=')[1];
      return (
        <div className="my-4">
          <iframe
            width="100%"
            height="315"
            src={`https://www.youtube.com/embed/${videoId}`}
            title="YouTube video player"
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </div>
      );
    }
    
    return (
      <div className="my-4">
        <img src={question.mediaUrl} alt="Question media" className="max-w-full rounded-lg" />
      </div>
    );
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.4 }} className="max-w-2xl mx-auto bg-white p-6 rounded-lg shadow">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center">
          <img src={timerIcon} alt="Timer" className="w-8 h-8 mr-2" />
          <span className="text-lg font-medium">Time Left: {timeLeft}s</span>
        </div>
        <span className="text-lg font-medium">Points: {question.points}</span>
      </div>

      <h3 className="text-xl font-semibold mb-4">{question.stem}</h3>
      
      {renderMedia()}

      <div className="space-y-2">
        {question.options.map((option, index) => (
          <motion.button
            key={index}
            onClick={() => handleAnswer(index)}
            className={`w-full p-4 text-left rounded-lg border transition-colors ${
              showResults
                ? question.correctAnswers.includes(index)
                  ? 'bg-green-100 border-green-500'
                  : selectedAnswers.includes(index)
                  ? 'bg-red-100 border-red-500'
                  : 'bg-gray-50'
                : selectedAnswers.includes(index)
                ? 'bg-blue-100 border-blue-500'
                : 'bg-gray-50 hover:bg-gray-100'
            }`}
            whileHover={!showResults ? { scale: 1.02 } : {}}
            whileTap={!showResults ? { scale: 0.98 } : {}}
          >
            {option}
          </motion.button>
        ))}
      </div>

      {showResults && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-6 p-4 bg-gray-50 rounded-lg"
        >
          <h4 className="text-lg font-semibold mb-2">Results</h4>
          <p>Your score: {results.score}</p>
          <p>Time taken: {results.timeTaken}s</p>
        </motion.div>
      )}

      {showResults && (
        <motion.button
          onClick={() => navigate(`/play/results/${playerId}`)}
          className="mt-4 w-full py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          View Final Results
        </motion.button>
      )}
    </motion.div>
  );
}
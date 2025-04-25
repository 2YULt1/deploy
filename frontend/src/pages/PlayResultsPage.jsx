// pages/PlayResultsPage.jsx
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { motion } from 'framer-motion';
import { TrophyIcon, ClockIcon, ChartBarIcon } from '@heroicons/react/24/outline';

export default function PlayResultsPage() {
  const { sessionId } = useParams();
  const [results, setResults] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    const fetchResults = async () => {
      try {
        const res = await axios.get(`/play/session/${sessionId}/results`, { headers: { Authorization: `Bearer ${token}` } });
        setResults(res.data);
      } catch (err) {
        console.error('Failed to fetch results:', err);
        navigate('/play/join');
      }
    };

    fetchResults();
    const interval = setInterval(fetchResults, 1000);
    return () => clearInterval(interval);
  }, [sessionId, navigate]);

  if (!results) return <div>Loading...</div>;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header Section */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Game Results</h1>
          <p className="text-gray-600">See how you and others performed</p>
        </motion.div>

        {/* Player Stats */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-xl shadow-md p-6 mb-8"
        >
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Your Performance</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="flex items-center space-x-3 p-4 bg-blue-50 rounded-lg">
              <TrophyIcon className="w-8 h-8 text-blue-600" />
              <div>
                <p className="text-sm text-gray-600">Score</p>
                <p className="text-2xl font-bold text-gray-800">{results.score}</p>
              </div>
            </div>
            <div className="flex items-center space-x-3 p-4 bg-green-50 rounded-lg">
              <ClockIcon className="w-8 h-8 text-green-600" />
              <div>
                <p className="text-sm text-gray-600">Average Time</p>
                <p className="text-2xl font-bold text-gray-800">{results.averageTime}s</p>
              </div>
            </div>
            <div className="flex items-center space-x-3 p-4 bg-purple-50 rounded-lg">
              <ChartBarIcon className="w-8 h-8 text-purple-600" />
              <div>
                <p className="text-sm text-gray-600">Rank</p>
                <p className="text-2xl font-bold text-gray-800">#{results.rank}</p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Leaderboard */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-xl shadow-md p-6 mb-8"
        >
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Leaderboard</h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4 text-gray-600 font-medium">Rank</th>
                  <th className="text-left py-3 px-4 text-gray-600 font-medium">Player</th>
                  <th className="text-right py-3 px-4 text-gray-600 font-medium">Score</th>
                  <th className="text-right py-3 px-4 text-gray-600 font-medium">Time</th>
                </tr>
              </thead>
              <tbody>
                {results.leaderboard.map((player, index) => (
                  <tr 
                    key={index} 
                    className={`border-b ${
                      player.id === results.playerId ? 'bg-blue-50' : 'hover:bg-gray-50'
                    }`}
                  >
                    <td className="py-3 px-4 font-medium">#{index + 1}</td>
                    <td className="py-3 px-4">{player.name}</td>
                    <td className="py-3 px-4 text-right font-medium">{player.score}</td>
                    <td className="py-3 px-4 text-right">{player.averageTime}s</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>

        {/* Question Breakdown */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-xl shadow-md p-6"
        >
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Question Breakdown</h2>
          <div className="space-y-4">
            {results.questions.map((q, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 + index * 0.1 }}
                className={`p-4 rounded-lg border-2 ${
                  q.correct ? 'border-green-500 bg-green-50' : 'border-red-500 bg-red-50'
                }`}
              >
                <div className="flex justify-between items-start mb-2">
                  <h3 className="text-lg font-medium text-gray-800">Question {index + 1}</h3>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                    q.correct ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {q.correct ? 'Correct' : 'Incorrect'}
                  </span>
                </div>
                <p className="text-gray-600 mb-2">{q.stem}</p>
                <div className="space-y-2">
                  {q.options.map((option, optionIndex) => (
                    <div
                      key={optionIndex}
                      className={`p-2 rounded ${
                        q.correctAnswers.includes(optionIndex)
                          ? 'bg-green-100 text-green-800'
                          : q.selectedAnswers.includes(optionIndex)
                          ? 'bg-red-100 text-red-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      {option}
                    </div>
                  ))}
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
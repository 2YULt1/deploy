// pages/SessionPage.jsx
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { motion } from 'framer-motion';
import { LineChart, Line, XAxis, YAxis, Tooltip, BarChart, Bar, ResponsiveContainer } from 'recharts';
import copyIcon from '../assets/copy-icon.png';

export default function SessionPage() {
  const { sessionId } = useParams();
  const [status, setStatus] = useState(null);
  const [results, setResults] = useState([]);
  const [showCopySuccess, setShowCopySuccess] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      const token = localStorage.getItem('token');
      try {
        const [statusRes, resultsRes] = await Promise.all([
          axios.get(`/admin/session/${sessionId}/status`, { headers: { Authorization: `Bearer ${token}` } }),
          axios.get(`/admin/session/${sessionId}/results`, { headers: { Authorization: `Bearer ${token}` } })
        ]);
        setStatus(statusRes.data);
        setResults(resultsRes.data.results);
      } catch (err) {
        console.error('Failed to fetch session data:', err);
      }
    };

    fetchData();
    const interval = setInterval(fetchData, 1000);
    return () => clearInterval(interval);
  }, [sessionId]);

  const startSession = async () => {
    const token = localStorage.getItem('token');
    try {
      await axios.post(`/admin/session/${sessionId}/start`, {}, { headers: { Authorization: `Bearer ${token}` } });
    } catch (err) {
      console.error('Failed to start session:', err);
    }
  };

  const nextQuestion = async () => {
    const token = localStorage.getItem('token');
    try {
      await axios.post(`/admin/session/${sessionId}/advance`, {}, { headers: { Authorization: `Bearer ${token}` } });
    } catch (err) {
      console.error('Failed to advance to next question:', err);
    }
  };

  const endSession = async () => {
    const token = localStorage.getItem('token');
    try {
      await axios.post(`/admin/session/${sessionId}/end`, {}, { headers: { Authorization: `Bearer ${token}` } });
      if (window.confirm('Would you like to view the results?')) {
        navigate(`/session/${sessionId}/results`);
      }
    } catch (err) {
      console.error('Failed to end session:', err);
    }
  };

  const copySessionLink = () => {
    const link = `${window.location.origin}/play/join/${sessionId}`;
    navigator.clipboard.writeText(link);
    setShowCopySuccess(true);
    setTimeout(() => setShowCopySuccess(false), 2000);
  };

  if (!status) return <div>Loading...</div>;

  const renderSessionControls = () => {
    if (status.position === -1) {
      return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center space-y-4">
          <motion.button
            onClick={startSession}
            className="px-6 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Start Session
          </motion.button>
          <div className="flex items-center space-x-2">
            <span className="text-gray-600">Session ID: {sessionId}</span>
            <motion.button
              onClick={copySessionLink}
              className="p-2 hover:bg-gray-100 rounded"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              <img src={copyIcon} alt="Copy" className="w-4 h-4" />
            </motion.button>
            {showCopySuccess && (
              <motion.span
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="text-green-500"
              >
                Copied!
              </motion.span>
            )}
          </div>
        </motion.div>
      );
    }

    if (status.position >= 0 && status.position < status.totalQuestions) {
      return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex space-x-4">
          <motion.button
            onClick={nextQuestion}
            className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Next Question
          </motion.button>
          <motion.button
            onClick={endSession}
            className="px-6 py-3 bg-red-500 text-white rounded-lg hover:bg-red-600"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            End Session
          </motion.button>
        </motion.div>
      );
    }

    return null;
  };

  const renderResults = () => {
    if (!results.length) return null;

    const accuracyData = results.map((r, i) => ({
      question: i + 1,
      correctRate: (r.correctCount / r.totalPlayers) * 100
    }));

    const timeData = results.map((r, i) => ({
      question: i + 1,
      avgTime: r.averageTime
    }));

    const topPlayers = results[0].players
      .sort((a, b) => b.score - a.score)
      .slice(0, 5);

    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="space-y-8 mt-8"
      >
        <div>
          <h3 className="text-xl font-bold mb-4">Top Players</h3>
          <div className="bg-white bg-opacity-80 p-4 rounded-lg shadow">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2">Player</th>
                  <th className="text-right py-2">Score</th>
                </tr>
              </thead>
              <tbody>
                {topPlayers.map((player, i) => (
                  <tr key={i} className="border-b">
                    <td className="py-2">{player.name}</td>
                    <td className="text-right py-2">{player.score}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div>
          <h3 className="text-xl font-bold mb-4">Question Accuracy</h3>
          <div className="bg-white bg-opacity-80 p-4 rounded-lg shadow">
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={accuracyData}>
                <XAxis dataKey="question" />
                <YAxis label={{ value: '% Correct', angle: -90, position: 'insideLeft' }} />
                <Tooltip />
                <Line type="monotone" dataKey="correctRate" stroke="#8884d8" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div>
          <h3 className="text-xl font-bold mb-4">Average Response Time</h3>
          <div className="bg-white bg-opacity-80 p-4 rounded-lg shadow">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={timeData}>
                <XAxis dataKey="question" />
                <YAxis label={{ value: 'Seconds', angle: -90, position: 'insideLeft' }} />
                <Tooltip />
                <Bar dataKey="avgTime" fill="#82ca9d" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </motion.div>
    );
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {renderSessionControls()}
      {renderResults()}
    </div>
  );
}
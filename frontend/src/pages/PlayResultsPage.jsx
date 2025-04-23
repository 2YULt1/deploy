// pages/PlayResultsPage.jsx
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import { useParams } from 'react-router-dom';

export default function PlayResultsPage() {
  const { playerId } = useParams();
  const [results, setResults] = useState([]);

  useEffect(() => {
    axios.get(`/play/${playerId}/results`).then(res => setResults(res.data));
  }, [playerId]);

  return (
    <motion.div initial={{ y: 20 }} animate={{ y: 0 }} transition={{ duration: 0.5 }} className="max-w-2xl mx-auto bg-white bg-opacity-90 p-6 rounded-lg">
      <h2 className="text-2xl font-bold mb-4">Your Results</h2>
      <ul className="space-y-3">
        {results.map((r, i) => (
          <motion.li key={i} whileHover={{ scale: 1.02 }} className="p-3 bg-gray-100 rounded">
            <div>Question {i + 1}: {r.correct ? '✅' : '❌'}</div>
            <div>Your Answer: {r.answers.join(', ')}</div>
            <div>Time: {Math.round((new Date(r.answeredAt) - new Date(r.questionStartedAt)) / 1000)}s</div>
          </motion.li>
        ))}
      </ul>
    </motion.div>
  );
}
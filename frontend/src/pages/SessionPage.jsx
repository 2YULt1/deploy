// pages/SessionPage.jsx
import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { motion } from 'framer-motion';
import { LineChart, Line, XAxis, YAxis, Tooltip, BarChart, Bar } from 'recharts';

export default function SessionPage() {
  const { sessionId } = useParams();
  const [status, setStatus] = useState(null);
  const [results, setResults] = useState([]);

  useEffect(() => {
    const token = localStorage.getItem('token');
    axios.get(`/admin/session/${sessionId}/status`, { headers: { Authorization: `Bearer ${token}` } }).then(res => setStatus(res.data));
    axios.get(`/admin/session/${sessionId}/results`, { headers: { Authorization: `Bearer ${token}` } }).then(res => setResults(res.data.results));
  }, [sessionId]);

  if (!status) return <div>Loading...</div>;

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }} className="flex space-x-4">
        <button className="bg-green-500 text-white px-4 py-2 rounded">Start</button>
        <button className="bg-yellow-500 text-white px-4 py-2 rounded">Next</button>
        <button className="bg-red-500 text-white px-4 py-2 rounded">End</button>
      </motion.div>
      <motion.div initial={{ x: -50 }} animate={{ x: 0 }} transition={{ duration: 0.6 }}>
        <h3 className="text-xl font-bold mb-2">Scoreboard</h3>
        <ul className="bg-white bg-opacity-80 p-4 rounded shadow">
          {status.players.map((p, i) => <li key={i}>{p}</li>)}
        </ul>
      </motion.div>
      <motion.div initial={{ x: 50 }} animate={{ x: 0 }} transition={{ duration: 0.6 }}>
        <h3 className="text-xl font-bold mb-2">Accuracy</h3>
        <LineChart width={600} height={300} data={results}> <XAxis dataKey="question" /> <YAxis /> <Tooltip /> <Line type="monotone" dataKey="correctRate" stroke="#8884d8" /> </LineChart>
      </motion.div>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}>
        <h3 className="text-xl font-bold mb-2">Response Time</h3>
        <BarChart width={600} height={300} data={results}> <XAxis dataKey="question" /> <YAxis /> <Tooltip /> <Bar dataKey="avgTime" fill="#82ca9d" /> </BarChart>
      </motion.div>
    </div>
  );
}
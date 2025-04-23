// pages/JoinPage.jsx
import React, { useState } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import { useNavigate, useParams } from 'react-router-dom';
import joinIcon from '../assets/join-icon.png';

export default function JoinPage() {
  const { sessionId } = useParams();
  const [name, setName] = useState('');
  const navigate = useNavigate();

  const join = async () => {
    const { data } = await axios.post(`/play/join/${sessionId}`, { name });
    localStorage.setItem('playerId', data.playerId);
    navigate(`/play/question/${data.playerId}`);
  };

  return (
    <motion.div initial={{ scale: 0.8 }} animate={{ scale: 1 }} transition={{ duration: 0.5 }} className="max-w-md mx-auto bg-white p-6 rounded-lg shadow-lg text-center">
      <img src={joinIcon} alt="Join" className="w-16 h-16 mx-auto mb-4" />
      <h2 className="text-2xl font-bold mb-4">Join Session</h2>
      <input value={name} onChange={e => setName(e.target.value)} placeholder="Your Name" className="w-full p-2 border rounded mb-4" />
      <motion.button onClick={join} className="px-6 py-2 bg-blue-600 text-white rounded" whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>Join</motion.button>
    </motion.div>
  );
}

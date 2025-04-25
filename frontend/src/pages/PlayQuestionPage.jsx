// pages/PlayQuestionPage.jsx
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import { useParams } from 'react-router-dom';
import timerIcon from '../assets/timer-icon.png';

export default function PlayQuestionPage() {
  const { playerId } = useParams();
  const [question, setQuestion] = useState(null);
  const [timeLeft, setTimeLeft] = useState(0);

  useEffect(() => {
    const fetch = async () => {
      const res = await axios.get(`/play/${playerId}/question`);
      setQuestion(res.data.question);
      setTimeLeft(res.data.question.duration);
    };
    fetch();
  }, [playerId]);

  useEffect(() => {
    if (!timeLeft) return;
    const interval = setInterval(() => setTimeLeft(t => t - 1), 1000);
    return () => clearInterval(interval);
  }, [timeLeft]);

  if (!question) return <div>Loading...</div>;
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.4 }} className="max-w-xl mx-auto bg-white p-6 rounded-lg shadow">
      <div className="flex items-center mb-4">
        <img src={timerIcon} alt="Timer" className="w-8 h-8 mr-2" />
        <span className="text-lg font-medium">Time Left: {timeLeft}s</span>
      </div>
      <h3 className="text-xl font-semibold mb-4">{question.stem}</h3>
      {/* options rendering with buttons */}
    </motion.div>
  );
}
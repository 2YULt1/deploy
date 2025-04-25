// pages/QuestionEditPage.jsx
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { motion } from 'framer-motion';

export default function QuestionEditPage() {
  const { gameId, questionId } = useParams();
  const [question, setQuestion] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    axios.get('/admin/games', { headers: { Authorization: `Bearer ${token}` } }).then(res => {
      const game = res.data.games.find(g => g.id === +gameId);
      setQuestion(game.questions[+questionId]);
    });
  }, [gameId, questionId]);

  const save = async () => {
    // PUT updated question back
    navigate(-1);
  };

  if (!question) return <div>Loading...</div>;
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }} className="max-w-lg mx-auto bg-white p-6 rounded-lg shadow">
      <h3 className="text-xl font-semibold mb-4">Edit Question {+questionId + 1}</h3>
      <div className="space-y-3">
        <textarea value={question.stem} onChange={e => setQuestion({ ...question, stem: e.target.value })} className="w-full p-2 border rounded" />
        {/* options and media input */}
      </div>
      <motion.button onClick={save} className="mt-4 bg-blue-600 text-white py-2 px-4 rounded" whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
        Save
      </motion.button>
    </motion.div>
  );
}
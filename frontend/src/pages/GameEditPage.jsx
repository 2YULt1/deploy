// pages/GameEditPage.jsx
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { motion } from 'framer-motion';
import editIcon from '../assets/edit-icon.png';

export default function GameEditPage() {
  const { gameId } = useParams();
  const [game, setGame] = useState(null);
  const nav = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    axios.get('/admin/games', { headers: { Authorization: `Bearer ${token}` } }).then(res => {
      setGame(res.data.games.find(g => g.id === +gameId));
    });
  }, [gameId]);

  const addQuestion = () => {
    const updated = { ...game, questions: [...(game.questions || []), { type: 'single', stem: '', options: [''], duration: 30 }] };
    setGame(updated);
    const token = localStorage.getItem('token');
    axios.put('/admin/games', { games: [updated] }, { headers: { Authorization: `Bearer ${token}` } });
  };

  if (!game) return <div>Loading...</div>;
  return (
    <div className="max-w-2xl mx-auto">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }} className="flex items-center mb-4">
        <img src={editIcon} alt="Edit" className="w-10 h-10 mr-2" />
        <h2 className="text-2xl font-bold">Editing: {game.name}</h2>
      </motion.div>
      <motion.button onClick={addQuestion} className="mb-4 bg-green-500 text-white py-2 px-4 rounded" whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
        Add Question
      </motion.button>
      <ul className="space-y-2">
        {game.questions.map((_, idx) => (
          <motion.li key={idx} whileHover={{ backgroundColor: '#f0f0f0' }} className="p-2 rounded cursor-pointer" onClick={() => nav(`/game/${gameId}/question/${idx}`)}>
            Question {idx + 1}
          </motion.li>
        ))}
      </ul>
    </div>
  );
}

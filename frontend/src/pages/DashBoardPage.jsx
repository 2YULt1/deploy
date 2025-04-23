// pages/DashboardPage.jsx
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { motion } from 'framer-motion';
import gameIcon from '../assets/game-card.png';

export default function DashboardPage() {
  const [games, setGames] = useState([]);
  const [newName, setNewName] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    axios.get('/admin/games', { headers: { Authorization: `Bearer ${token}` } }).then(res => setGames(res.data.games));
  }, []);

  const createGame = async () => {
    const token = localStorage.getItem('token');
    const updated = [...games, { name: newName, owner: '' }];
    await axios.put('/admin/games', { games: updated }, { headers: { Authorization: `Bearer ${token}` } });
    setGames(updated);
    setNewName('');
  };

  return (
    <div className="max-w-3xl mx-auto">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }} className="flex mb-6">
        <input value={newName} onChange={e => setNewName(e.target.value)} placeholder="New Game Name" className="flex-1 p-2 border rounded-l" />
        <motion.button onClick={createGame} className="px-4 bg-blue-500 text-white rounded-r" whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>Add Game</motion.button>
      </motion.div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {games.map(g => (
          <motion.div key={g.id} className="bg-white bg-opacity-80 p-4 rounded-lg shadow" whileHover={{ scale: 1.02 }} onClick={() => navigate(`/game/${g.id}`)}>
            <img src={gameIcon} alt="Game" className="w-12 h-12 mb-2" />
            <h3 className="text-xl font-semibold">{g.name}</h3>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

// pages/DashboardPage.jsx
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
export default function DashboardPage() {
  const [games, setGames] = useState([]);
  const [newName, setNewName] = useState('');
  const navigate = useNavigate();
  useEffect(() => {
    const token = localStorage.getItem('token');
    axios.get('/admin/games', { headers: { Authorization: `Bearer ${token}` } })
      .then(res => setGames(res.data.games));
  }, []);
  const createGame = async () => {
    const token = localStorage.getItem('token');
    const updated = [...games, { name: newName, owner: '' }];
    await axios.put('/admin/games', { games: updated }, { headers: { Authorization: `Bearer ${token}` } });
    setGames(updated);
    setNewName('');
  };
  return (
    <div>
      <h2>Dashboard</h2>
      <input value={newName} onChange={e => setNewName(e.target.value)} placeholder="Game Name" />
      <button onClick={createGame}>Create</button>
      <ul>{games.map(g => <li key={g.id} onClick={() => navigate(`/game/${g.id}`)}>{g.name}</li>)}</ul>
    </div>
  );
}
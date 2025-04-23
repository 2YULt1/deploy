// pages/GameEditPage.jsx
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
export default function GameEditPage() {
  const { gameId } = useParams();
  const [game, setGame] = useState(null);
  const nav = useNavigate();
  useEffect(() => {
    const token = localStorage.getItem('token');
    axios.get('/admin/games', { headers: { Authorization: `Bearer ${token}` } })
      .then(res => setGame(res.data.games.find(g=>g.id===parseInt(gameId))));
  }, [gameId]);
  const addQuestion = () => {
    const updated = {...game, questions: [...(game.questions||[]), { type:'single', stem:'', options:[''], duration:30 }]};
    setGame(updated);
    const token = localStorage.getItem('token');
    axios.put('/admin/games', { games:[updated] }, { headers: { Authorization: `Bearer ${token}` } });
  };
  if(!game) return <div>Loading...</div>;
  return (
    <div>
      <h2>Edit {game.name}</h2>
      <button onClick={addQuestion}>Add Question</button>
      <ul>{game.questions.map((q,i)=><li key={i} onClick={()=>nav(`/game/${gameId}/question/${i}`)}>Q{i+1}</li>)}</ul>
    </div>
  );
}

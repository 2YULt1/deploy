// pages/JoinPage.jsx
import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, useParams } from 'react-router-dom';
export default function JoinPage(){
  const { sessionId } = useParams();
  const [name,setName]=useState('');
  const nav = useNavigate();
  const join=async()=>{
    const {playerId}=await axios.post(`/play/join/${sessionId}`,{name});
    localStorage.setItem('playerId',playerId);
    nav(`/play/question/${playerId}`);
  };
  return <div><h2>Join</h2><input value={name} onChange={e=>setName(e.target.value)} placeholder="Your Name" /><button onClick={join}>Join</button></div>;
}
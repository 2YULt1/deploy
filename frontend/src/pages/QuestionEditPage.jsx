// pages/QuestionEditPage.jsx
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
export default function QuestionEditPage() {
  const {gameId,questionId} = useParams();
  const nav = useNavigate();
  const [question,setQuestion] = useState(null);
  useEffect(()=>{
    // fetch game then pick question
  },[]);
  return (
    <div>/* Implement question editor: type, stem, options, media */</div>
  );
}
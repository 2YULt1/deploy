// pages/PlayQuestionPage.jsx
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
export default function PlayQuestionPage(){
  const { playerId } = useParams();
  const [question,setQuestion]=useState(null);
  useEffect(()=>{/* load question */},[]);
  return <div>/* render question & options with timer */</div>;
}

// pages/PlayResultsPage.jsx
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';
export default function PlayResultsPage(){
  const { playerId } = useParams();
  const [results,setResults]=useState([]);
  useEffect(()=>{/* load results */},[]);
  return <div>/* display per-question results */</div>;
}

// pages/SessionPage.jsx
import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { LineChart, Line, XAxis, YAxis, Tooltip, BarChart, Bar } from 'recharts';
export default function SessionPage() {
  const { sessionId } = useParams();
  const [status,setStatus]=useState(null);
  useEffect(()=>{ /* fetch status & results */ },[]);
  return <div>/* Display controls and charts */</div>;
}
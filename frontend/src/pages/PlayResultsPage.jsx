// pages/PlayResultsPage.jsx
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import { useParams } from 'react-router-dom';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

export default function PlayResultsPage() {
  const { playerId } = useParams();
  const [results, setResults] = useState([]);
  const [totalScore, setTotalScore] = useState(0);
  const [averageTime, setAverageTime] = useState(0);

  useEffect(() => {
    const fetchResults = async () => {
      const res = await axios.get(`/play/${playerId}/results`);
      setResults(res.data.results);
      
      // Calculate total score and average time
      const score = res.data.results.reduce((sum, r) => sum + (r.correct ? r.points : 0), 0);
      const times = res.data.results.map(r => 
        (new Date(r.answeredAt) - new Date(r.questionStartedAt)) / 1000
      );
      const avgTime = times.reduce((sum, t) => sum + t, 0) / times.length;
      
      setTotalScore(score);
      setAverageTime(avgTime);
    };
    fetchResults();
  }, [playerId]);

  const renderQuestionResult = (result, index) => {
    const timeTaken = (new Date(result.answeredAt) - new Date(result.questionStartedAt)) / 1000;
    const score = result.correct ? result.points : 0;
    
    return (
      <motion.div
        key={index}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.1 }}
        className={`p-4 rounded-lg mb-4 ${
          result.correct ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'
        } border`}
      >
        <div className="flex justify-between items-start mb-2">
          <h3 className="text-lg font-semibold">Question {index + 1}</h3>
          <div className="flex items-center space-x-4">
            <span className={`font-medium ${result.correct ? 'text-green-600' : 'text-red-600'}`}>
              {result.correct ? '✅ Correct' : '❌ Incorrect'}
            </span>
            <span className="text-gray-600">Score: {score}/{result.points}</span>
            <span className="text-gray-600">Time: {Math.round(timeTaken)}s</span>
          </div>
        </div>
        <p className="text-gray-700 mb-2">{result.question}</p>
        <div className="space-y-1">
          <p className="text-sm text-gray-600">Your answer: {result.answers.join(', ')}</p>
          <p className="text-sm text-gray-600">Correct answer: {result.correctAnswers.join(', ')}</p>
        </div>
      </motion.div>
    );
  };

  const renderPerformanceChart = () => {
    const data = results.map((r, i) => ({
      question: i + 1,
      time: (new Date(r.answeredAt) - new Date(r.questionStartedAt)) / 1000,
      score: r.correct ? r.points : 0
    }));

    return (
      <div className="bg-white bg-opacity-80 p-4 rounded-lg shadow mt-8">
        <h3 className="text-xl font-bold mb-4">Performance Over Time</h3>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={data}>
            <XAxis dataKey="question" />
            <YAxis yAxisId="left" label={{ value: 'Time (s)', angle: -90, position: 'insideLeft' }} />
            <YAxis yAxisId="right" orientation="right" label={{ value: 'Score', angle: 90, position: 'insideRight' }} />
            <Tooltip />
            <Line yAxisId="left" type="monotone" dataKey="time" stroke="#8884d8" name="Time (s)" />
            <Line yAxisId="right" type="monotone" dataKey="score" stroke="#82ca9d" name="Score" />
          </LineChart>
        </ResponsiveContainer>
      </div>
    );
  };

  return (
    <motion.div
      initial={{ y: 20 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5 }}
      className="max-w-4xl mx-auto bg-white bg-opacity-90 p-6 rounded-lg"
    >
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-2xl font-bold">Your Results</h2>
        <div className="text-right">
          <p className="text-xl font-semibold">Total Score: {totalScore}</p>
          <p className="text-gray-600">Average Time: {Math.round(averageTime)}s per question</p>
        </div>
      </div>

      <div className="space-y-4">
        {results.map((result, index) => renderQuestionResult(result, index))}
      </div>

      {renderPerformanceChart()}

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="mt-8 p-4 bg-blue-50 rounded-lg"
      >
        <h3 className="text-lg font-semibold mb-2">Performance Summary</h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-gray-600">Questions Answered: {results.length}</p>
            <p className="text-gray-600">Correct Answers: {results.filter(r => r.correct).length}</p>
          </div>
          <div>
            <p className="text-gray-600">Fastest Answer: {Math.min(...results.map(r => 
              (new Date(r.answeredAt) - new Date(r.questionStartedAt)) / 1000
            )).toFixed(1)}s</p>
            <p className="text-gray-600">Slowest Answer: {Math.max(...results.map(r => 
              (new Date(r.answeredAt) - new Date(r.questionStartedAt)) / 1000
            )).toFixed(1)}s</p>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
// pages/GameEditPage.jsx
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { motion } from 'framer-motion';
import { PlusIcon, TrashIcon } from '@heroicons/react/24/outline';

export default function GameEditPage() {
  const { gameId } = useParams();
  const [game, setGame] = useState(null);
  const [newQuestion, setNewQuestion] = useState({ type: 'single', stem: '', options: ['', ''], correctAnswers: [0] });
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    axios.get(`/admin/game/${gameId}`, { headers: { Authorization: `Bearer ${token}` } })
      .then(res => setGame(res.data.game));
  }, [gameId]);

  const addQuestion = async () => {
    const token = localStorage.getItem('token');
    const updated = { ...game, questions: [...game.questions, newQuestion] };
    await axios.put(`/admin/game/${gameId}`, { game: updated }, { headers: { Authorization: `Bearer ${token}` } });
    setGame(updated);
    setNewQuestion({ type: 'single', stem: '', options: ['', ''], correctAnswers: [0] });
  };

  const updateQuestion = async (index, updatedQuestion) => {
    const token = localStorage.getItem('token');
    const updated = { ...game, questions: game.questions.map((q, i) => i === index ? updatedQuestion : q) };
    await axios.put(`/admin/game/${gameId}`, { game: updated }, { headers: { Authorization: `Bearer ${token}` } });
    setGame(updated);
  };

  const deleteQuestion = async (index) => {
    const token = localStorage.getItem('token');
    const updated = { ...game, questions: game.questions.filter((_, i) => i !== index) };
    await axios.put(`/admin/game/${gameId}`, { game: updated }, { headers: { Authorization: `Bearer ${token}` } });
    setGame(updated);
  };

  const startSession = async () => {
    const token = localStorage.getItem('token');
    const res = await axios.post(`/admin/session`, { gameId }, { headers: { Authorization: `Bearer ${token}` } });
    navigate(`/session/${res.data.sessionId}`);
  };

  if (!game) return <div>Loading...</div>;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        {/* Header Section */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold text-gray-800 mb-2">{game.name}</h1>
          <p className="text-gray-600">Edit your game questions and settings</p>
        </motion.div>

        {/* Game Settings */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-xl shadow-md p-6 mb-8"
        >
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h2 className="text-xl font-semibold text-gray-800 mb-2">Game Settings</h2>
              <p className="text-gray-600">Configure your game options</p>
            </div>
            <motion.button
              onClick={startSession}
              className="px-6 py-3 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Start Session
            </motion.button>
          </div>
        </motion.div>

        {/* Questions List */}
        <div className="space-y-6">
          {game.questions.map((q, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 + index * 0.1 }}
              className="bg-white rounded-xl shadow-md p-6"
            >
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-lg font-semibold text-gray-800">Question {index + 1}</h3>
                <motion.button
                  onClick={() => deleteQuestion(index)}
                  className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <TrashIcon className="w-5 h-5" />
                </motion.button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Question Type</label>
                  <select
                    value={q.type}
                    onChange={e => updateQuestion(index, { ...q, type: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="single">Single Choice</option>
                    <option value="multiple">Multiple Choice</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Question Text</label>
                  <input
                    type="text"
                    value={q.stem}
                    onChange={e => updateQuestion(index, { ...q, stem: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Options</label>
                  <div className="space-y-2">
                    {q.options.map((option, optionIndex) => (
                      <div key={optionIndex} className="flex items-center space-x-2">
                        <input
                          type={q.type === 'single' ? 'radio' : 'checkbox'}
                          checked={q.correctAnswers.includes(optionIndex)}
                          onChange={() => {
                            const newCorrectAnswers = q.type === 'single'
                              ? [optionIndex]
                              : q.correctAnswers.includes(optionIndex)
                                ? q.correctAnswers.filter(i => i !== optionIndex)
                                : [...q.correctAnswers, optionIndex];
                            updateQuestion(index, { ...q, correctAnswers: newCorrectAnswers });
                          }}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                        <input
                          type="text"
                          value={option}
                          onChange={e => {
                            const newOptions = [...q.options];
                            newOptions[optionIndex] = e.target.value;
                            updateQuestion(index, { ...q, options: newOptions });
                          }}
                          className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Add Question Form */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-xl shadow-md p-6 mt-8"
        >
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Add New Question</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Question Type</label>
              <select
                value={newQuestion.type}
                onChange={e => setNewQuestion({ ...newQuestion, type: e.target.value, correctAnswers: [0] })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="single">Single Choice</option>
                <option value="multiple">Multiple Choice</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Question Text</label>
              <input
                type="text"
                value={newQuestion.stem}
                onChange={e => setNewQuestion({ ...newQuestion, stem: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Options</label>
              <div className="space-y-2">
                {newQuestion.options.map((option, index) => (
                  <div key={index} className="flex items-center space-x-2">
                    <input
                      type={newQuestion.type === 'single' ? 'radio' : 'checkbox'}
                      checked={newQuestion.correctAnswers.includes(index)}
                      onChange={() => {
                        const newCorrectAnswers = newQuestion.type === 'single'
                          ? [index]
                          : newQuestion.correctAnswers.includes(index)
                            ? newQuestion.correctAnswers.filter(i => i !== index)
                            : [...newQuestion.correctAnswers, index];
                        setNewQuestion({ ...newQuestion, correctAnswers: newCorrectAnswers });
                      }}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <input
                      type="text"
                      value={option}
                      onChange={e => {
                        const newOptions = [...newQuestion.options];
                        newOptions[index] = e.target.value;
                        setNewQuestion({ ...newQuestion, options: newOptions });
                      }}
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                ))}
              </div>
            </div>

            <motion.button
              onClick={addQuestion}
              className="w-full px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              Add Question
            </motion.button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

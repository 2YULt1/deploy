// pages/DashboardPage.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  PlusIcon, 
  PencilIcon, 
  TrashIcon, 
  PlayIcon,
  ChartBarIcon,
  ClockIcon,
  UserGroupIcon,
  ArrowPathIcon
} from '@heroicons/react/24/outline';

export default function DashboardPage() {
  const [games, setGames] = useState([]);
  const [newGameName, setNewGameName] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('recent');
  const navigate = useNavigate();

  useEffect(() => {
    fetchGames();
  }, []);

  const fetchGames = async () => {
    try {
      setIsLoading(true);
      const res = await axios.get('/games');
      setGames(res.data);
    } catch (err) {
      setError('Failed to fetch games');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateGame = async (e) => {
    e.preventDefault();
    if (!newGameName.trim()) return;
    
    try {
      setIsLoading(true);
      const res = await axios.post('/games', { name: newGameName });
      setGames([...games, res.data]);
      setNewGameName('');
      navigate(`/games/${res.data.id}/edit`);
    } catch (err) {
      setError('Failed to create game');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteGame = async (gameId) => {
    if (!window.confirm('Are you sure you want to delete this game? This action cannot be undone.')) return;
    
    try {
      setIsLoading(true);
      await axios.delete(`/games/${gameId}`);
      setGames(games.filter(game => game.id !== gameId));
    } catch (err) {
      setError('Failed to delete game');
    } finally {
      setIsLoading(false);
    }
  };

  const filteredGames = games.filter(game => 
    game.name.toLowerCase().includes(searchQuery.toLowerCase())
  ).sort((a, b) => {
    switch (sortBy) {
      case 'name':
        return a.name.localeCompare(b.name);
      case 'questions':
        return (b.questions?.length || 0) - (a.questions?.length || 0);
      case 'sessions':
        return (b.sessions?.length || 0) - (a.sessions?.length || 0);
      default:
        return new Date(b.updatedAt) - new Date(a.updatedAt);
    }
  });

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header Section */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col md:flex-row md:items-center md:justify-between mb-12 gap-6"
        >
          <div>
            <h1 className="text-5xl font-bold text-gray-800 mb-4">Your Games</h1>
            <p className="text-xl text-gray-600">Create and manage your quiz games</p>
          </div>

          {/* Create Game Form */}
          <motion.form 
            onSubmit={handleCreateGame}
            className="flex gap-4"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            <div className="relative flex-grow">
              <input
                type="text"
                value={newGameName}
                onChange={(e) => setNewGameName(e.target.value)}
                placeholder="Enter game name"
                className="w-full pl-4 pr-12 py-3 text-lg border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <button
                type="submit"
                className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-blue-600 hover:text-blue-700"
                disabled={isLoading}
              >
                <PlusIcon className="h-5 w-5" />
              </button>
            </div>
          </motion.form>
        </motion.div>

        {/* Search and Sort */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="flex flex-col sm:flex-row gap-4 mb-8"
        >
          <div className="relative flex-grow">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search games..."
              className="w-full pl-4 pr-4 py-3 text-lg border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="px-4 py-3 text-lg border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="recent">Most Recent</option>
            <option value="name">Name</option>
            <option value="questions">Most Questions</option>
            <option value="sessions">Most Sessions</option>
          </select>
        </motion.div>

        {/* Error Message */}
        {error && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="p-4 bg-red-50 text-red-600 rounded-xl text-lg mb-8"
          >
            {error}
          </motion.div>
        )}

        {/* Games Grid */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          <AnimatePresence>
            {filteredGames.map((game) => (
              <motion.div
                key={game.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="bg-white rounded-2xl shadow-xl p-6 hover:shadow-2xl transition-shadow duration-300"
              >
                <div className="flex justify-between items-start mb-4">
                  <h2 className="text-2xl font-bold text-gray-800">{game.name}</h2>
                  <div className="flex gap-2">
                    <button
                      onClick={() => navigate(`/game/${game.id}`)}
                      className="p-2 text-blue-600 hover:text-blue-700"
                    >
                      <PencilIcon className="h-5 w-5" />
                    </button>
                    <button
                      onClick={() => handleDeleteGame(game.id)}
                      className="p-2 text-red-600 hover:text-red-700"
                    >
                      <TrashIcon className="h-5 w-5" />
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4 mb-6">
                  <div className="text-center">
                    <ChartBarIcon className="h-6 w-6 text-blue-600 mx-auto mb-2" />
                    <p className="text-lg font-medium text-gray-700">{game.questions?.length || 0}</p>
                    <p className="text-sm text-gray-500">Questions</p>
                  </div>
                  <div className="text-center">
                    <UserGroupIcon className="h-6 w-6 text-green-600 mx-auto mb-2" />
                    <p className="text-lg font-medium text-gray-700">{game.sessions?.length || 0}</p>
                    <p className="text-sm text-gray-500">Sessions</p>
                  </div>
                  <div className="text-center">
                    <ClockIcon className="h-6 w-6 text-purple-600 mx-auto mb-2" />
                    <p className="text-lg font-medium text-gray-700">
                      {new Date(game.updatedAt).toLocaleDateString()}
                    </p>
                    <p className="text-sm text-gray-500">Updated</p>
                  </div>
                </div>

                <button
                  onClick={() => navigate(`/play/join/${game.id}`)}
                  className="w-full px-6 py-3 bg-blue-600 text-white text-lg font-medium rounded-xl hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 flex items-center justify-center gap-2"
                >
                  <PlayIcon className="h-4 w-4" />
                  Start Game
                </button>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>

        {/* Loading State */}
        {isLoading && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex justify-center items-center py-12"
          >
            <ArrowPathIcon className="h-6 w-6 text-blue-600 animate-spin" />
          </motion.div>
        )}

        {/* Empty State */}
        {!isLoading && filteredGames.length === 0 && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-12"
          >
            <p className="text-xl text-gray-600">No games found. Create your first game!</p>
          </motion.div>
        )}
      </div>
    </div>
  );
}

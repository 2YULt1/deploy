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
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header Section */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col md:flex-row md:items-center md:justify-between mb-8 gap-4"
        >
          <div>
            <h1 className="text-3xl font-bold text-gray-800 mb-2">Your Games</h1>
            <p className="text-gray-600">Create and manage your quiz games</p>
          </div>
          <div className="flex items-center gap-4">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="recent">Recently Updated</option>
              <option value="name">Name</option>
              <option value="questions">Most Questions</option>
              <option value="sessions">Most Sessions</option>
            </select>
            <button
              onClick={fetchGames}
              className="p-2 text-gray-600 hover:text-gray-800 rounded-lg hover:bg-gray-100"
              disabled={isLoading}
            >
              <ArrowPathIcon className={`h-5 w-5 ${isLoading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </motion.div>

        {/* Search and Create Form */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-xl shadow-md p-6 mb-8"
        >
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search games..."
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <form onSubmit={handleCreateGame} className="flex gap-4">
              <div className="flex-1">
                <input
                  type="text"
                  value={newGameName}
                  onChange={(e) => setNewGameName(e.target.value)}
                  placeholder="Enter game name"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>
              <motion.button
                type="submit"
                disabled={isLoading}
                className="px-6 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <PlusIcon className="h-5 w-5" />
                Create Game
              </motion.button>
            </form>
          </div>
        </motion.div>

        {/* Error Message */}
        {error && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="p-3 bg-red-50 text-red-600 rounded-lg text-sm mb-8"
          >
            {error}
          </motion.div>
        )}

        {/* Games Grid */}
        <AnimatePresence>
          {isLoading ? (
            <div className="text-center py-12">
              <ArrowPathIcon className="h-8 w-8 text-gray-400 animate-spin mx-auto" />
              <p className="mt-2 text-gray-500">Loading games...</p>
            </div>
          ) : filteredGames.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredGames.map((game, index) => (
                <motion.div
                  key={game.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ delay: 0.1 * index }}
                  className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow"
                >
                  <div className="p-6">
                    <h3 className="text-xl font-semibold text-gray-800 mb-2">{game.name}</h3>
                    <div className="flex flex-wrap gap-4 text-sm text-gray-500 mb-4">
                      <div className="flex items-center gap-1">
                        <ChartBarIcon className="h-4 w-4" />
                        <span>{game.questions?.length || 0} questions</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <UserGroupIcon className="h-4 w-4" />
                        <span>{game.sessions?.length || 0} sessions</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <ClockIcon className="h-4 w-4" />
                        <span>{new Date(game.updatedAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <motion.button
                        onClick={() => navigate(`/games/${game.id}/edit`)}
                        className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 flex items-center justify-center gap-2"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <PencilIcon className="h-4 w-4" />
                        Edit
                      </motion.button>
                      <motion.button
                        onClick={() => navigate(`/games/${game.id}/play`)}
                        className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 flex items-center justify-center gap-2"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <PlayIcon className="h-4 w-4" />
                        Play
                      </motion.button>
                      <motion.button
                        onClick={() => handleDeleteGame(game.id)}
                        className="px-4 py-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 flex items-center justify-center"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <TrashIcon className="h-4 w-4" />
                      </motion.button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-12"
            >
              <p className="text-gray-500">
                {searchQuery ? 'No games found matching your search.' : 'No games yet. Create your first game to get started!'}
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

// pages/JoinPage.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { motion } from 'framer-motion';
import { UserGroupIcon, ArrowRightIcon } from '@heroicons/react/24/outline';

export default function JoinPage() {
  const [sessionCode, setSessionCode] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const res = await axios.post('/sessions/join', { sessionCode, name });
      localStorage.setItem('playerToken', res.data.token);
      navigate(`/sessions/${sessionCode}/play`);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to join session');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Section - Image */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-gradient-to-br from-green-500 to-blue-600">
        <div className="absolute inset-0 bg-black/20" />
        <div className="absolute bottom-20 left-12 text-white">
          <h2 className="text-5xl font-bold mb-4">Join a Game</h2>
          <p className="text-xl opacity-90">Test your knowledge and have fun!</p>
        </div>
      </div>

      {/* Right Section - Join Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-gray-50">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md space-y-8"
        >
          <div className="text-center">
            <h1 className="text-4xl font-bold text-gray-900 mb-2">Join Game Session</h1>
            <p className="text-lg text-gray-600">Enter the session code to start playing</p>
          </div>

          <form onSubmit={handleSubmit} className="mt-8 space-y-6">
            <div className="space-y-4">
              <div>
                <label htmlFor="sessionCode" className="block text-sm font-medium text-gray-700 mb-1">
                  Session Code
                </label>
                <input
                  id="sessionCode"
                  type="text"
                  value={sessionCode}
                  onChange={(e) => setSessionCode(e.target.value)}
                  required
                  className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-blue-500 focus:ring-blue-500 transition-colors text-gray-800 text-lg"
                  placeholder="Enter session code"
                />
              </div>

              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                  Your Name
                </label>
                <input
                  id="name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-blue-500 focus:ring-blue-500 transition-colors text-gray-800 text-lg"
                  placeholder="Enter your name"
                />
              </div>
            </div>

            {error && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="p-4 bg-red-50 text-red-600 rounded-xl text-center"
              >
                {error}
              </motion.div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 px-4 bg-gradient-to-r from-green-600 to-blue-600 text-white rounded-xl text-lg font-medium hover:from-green-700 hover:to-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isLoading ? 'Joining...' : 'Join Game'}
              <ArrowRightIcon className="h-5 w-5" />
            </button>

            <p className="text-center text-gray-600">
              Want to create your own game?{' '}
              <button
                onClick={() => navigate('/dashboard')}
                className="text-blue-600 hover:text-blue-700 font-medium"
              >
                Go to Dashboard
              </button>
            </p>
          </form>
        </motion.div>
      </div>
    </div>
  );
}

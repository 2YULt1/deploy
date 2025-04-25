// src/pages/LoginPage.jsx
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { motion } from 'framer-motion';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const response = await axios.post('/auth/login', { email, password });
      localStorage.setItem('token', response.data.token);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to login');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Section - Image */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-gradient-to-br from-blue-500 to-purple-600">
        <div className="absolute inset-0 bg-black/20" />
        <div className="absolute bottom-20 left-12 text-white">
          <h2 className="text-5xl font-bold mb-4">Quiz Master</h2>
          <p className="text-xl opacity-90">Create and manage interactive quizzes</p>
        </div>
      </div>

      {/* Right Section - Login Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-gray-50">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md space-y-8"
        >
          <div className="text-center">
            <h1 className="text-4xl font-bold text-gray-900 mb-2">Welcome back!</h1>
            <p className="text-lg text-gray-600">Login to continue using our service</p>
          </div>

          <form onSubmit={handleSubmit} className="mt-8 space-y-6">
            <div className="space-y-4">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                  Email Address
                </label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-purple-500 focus:ring-purple-500 transition-colors text-gray-800 text-lg"
                  placeholder="Enter your email"
                />
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                  Password
                </label>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-purple-500 focus:ring-purple-500 transition-colors text-gray-800 text-lg"
                  placeholder="Enter your password"
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

            <div className="flex items-center justify-between text-sm">
              <Link to="/forgot-password" className="text-purple-600 hover:text-purple-500">
                Forgot Password?
              </Link>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 px-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl text-lg font-medium hover:from-blue-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Logging in...' : 'Login'}
            </button>

            <p className="text-center text-gray-600">
              Don't have an account?{' '}
              <Link to="/register" className="text-purple-600 hover:text-purple-500 font-medium">
                Create an account
              </Link>
            </p>
          </form>
        </motion.div>
      </div>
    </div>
  );
}

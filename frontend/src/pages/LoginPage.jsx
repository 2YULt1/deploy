// src/pages/LoginPage.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { motion } from 'framer-motion';
import avatar from '../assets/admin-avatar.png';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async e => {
    e.preventDefault();
    setError('');
    try {
      const res = await axios.post('/admin/auth/login', { email, password });
      localStorage.setItem('token', res.data.token);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.error || 'Login failed. Please try again.');
    }
  };

  const handleKeyPress = e => {
    if (e.key === 'Enter') {
      handleSubmit(e);
    }
  };

  return (
    <div className="flex h-screen">
      {/* Left */}
      <div className="w-1/3"></div>

      {/* Right login  */}
      <div className="w-2/3 flex items-center justify-center">
        <motion.div
          className="bg-white bg-opacity-90 p-10 rounded-2xl shadow-xl max-w-md w-full"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
        >
          {/* Heading */}
          <h1 className="text-6xl font-extrabold text-gray-800 text-center mb-8">
            BigBrain
          </h1>

          {/* Subtitle */}
          <h2 className="text-2xl font-semibold text-gray-600 text-center mb-6">
            Admin Login
          </h2>

          {/* Avatar */}
          <div className="flex justify-center mb-6">
            <img src={avatar} alt="Admin" className="w-24 h-24" />
          </div>

          {/* Error message */}
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4"
            >
              {error}
            </motion.div>
          )}

          {/* Login form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <motion.input
              whileFocus={{ scale: 1.02 }}
              type="email"
              placeholder="Email"
              className="w-full text-lg p-4 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={email}
              onChange={e => setEmail(e.target.value)}
              onKeyPress={handleKeyPress}
              required
            />
            <motion.input
              whileFocus={{ scale: 1.02 }}
              type="password"
              placeholder="Password"
              className="w-full text-lg p-4 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={password}
              onChange={e => setPassword(e.target.value)}
              onKeyPress={handleKeyPress}
              required
            />
            <motion.button
              type="submit"
              className="w-full text-lg py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
            >
              Login
            </motion.button>
          </form>

          {/* Register link */}
          <div className="mt-6 text-center">
            <p className="text-gray-600">
              Don't have an account?{' '}
              <motion.a
                href="/register"
                className="text-blue-600 hover:text-blue-800"
                whileHover={{ scale: 1.05 }}
              >
                Register here
              </motion.a>
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

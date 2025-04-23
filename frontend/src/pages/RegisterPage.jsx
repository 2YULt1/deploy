// pages/RegisterPage.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { motion } from 'framer-motion';
import avatar from '../assets/register-avatar.png';

export default function RegisterPage() {
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async e => {
    e.preventDefault();
    if (password !== confirm) return alert('Passwords do not match');
    try {
      const { token } = await axios.post('/admin/auth/register', { email, name, password });
      localStorage.setItem('token', token);
      navigate('/dashboard');
    } catch {
      alert('Registration failed');
    }
  };

  return (
    <motion.div
      className="max-w-sm mx-auto bg-white bg-opacity-90 p-8 rounded-2xl shadow-lg"
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      <img src={avatar} alt="Register" className="w-16 h-16 mx-auto mb-4" />
      <h2 className="text-2xl font-bold text-center mb-4">Admin Register</h2>
      <form onSubmit={handleSubmit} className="space-y-3">
        <motion.input whileFocus={{ x: 2 }} placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} className="w-full p-2 border rounded" />
        <motion.input whileFocus={{ x: 2 }} placeholder="Name" value={name} onChange={e => setName(e.target.value)} className="w-full p-2 border rounded" />
        <motion.input whileFocus={{ x: 2 }} type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} className="w-full p-2 border rounded" />
        <motion.input whileFocus={{ x: 2 }} type="password" placeholder="Confirm" value={confirm} onChange={e => setConfirm(e.target.value)} className="w-full p-2 border rounded" />
        <motion.button type="submit" className="w-full bg-green-600 text-white py-2 rounded hover:bg-green-700" whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>Register</motion.button>
      </form>
    </motion.div>
  );
}
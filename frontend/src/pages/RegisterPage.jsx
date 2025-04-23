// pages/RegisterPage.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
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
    <form onSubmit={handleSubmit}>
      <h2>Admin Register</h2>
      <input placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} />
      <input placeholder="Name" value={name} onChange={e => setName(e.target.value)} />
      <input type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} />
      <input type="password" placeholder="Confirm Password" value={confirm} onChange={e => setConfirm(e.target.value)} />
      <button type="submit">Register</button>
    </form>
  );
}
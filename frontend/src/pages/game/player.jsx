import React, { useState, useEffect, useRef } from 'react';
import { Input, Button, Typography, Card, message, Spin } from 'antd';
import { useParams, useNavigate } from 'react-router';
import { post, get } from '../../tools/request';

const { Title, Paragraph } = Typography;

export default function PlayerPage() {
  const { sessionId } = useParams();
  const navigate = useNavigate();

  const [nickname, setNickname] = useState('');
  const [loading, setLoading] = useState(false);
  const [isWaiting, setIsWaiting] = useState(false);
  const [playerId, setPlayerId] = useState(null); 
  const pollingRef = useRef(null); 

  const handleJoin = async () => {
    if (!nickname.trim()) {
      message.warning('Please enter a nickname');
      return;
    }

    try {
      setLoading(true);
      const res = await post(`/play/join/${sessionId}`, { name: nickname.trim() });

      setPlayerId(res.playerId); 
      localStorage.setItem('playerId', res.playerId); 
      setIsWaiting(true);
      message.success('Joined! Waiting for game to start...');
    } catch (err) {
      message.error(err.message || 'Failed to join game');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!isWaiting || !playerId) return;

    pollingRef.current = setInterval(async () => {
      try {
        const statusRes = await get(`/play/${playerId}/status`);
        if (statusRes.started) {
          clearInterval(pollingRef.current);
          navigate(`/answer/${sessionId}`);
        }
      } catch (err) {
        console.error(err);
        clearInterval(pollingRef.current);
        message.error('Error checking game status');
      }
    }, 3000);

    return () => clearInterval(pollingRef.current);
  }, [isWaiting, playerId]);

  if (isWaiting) {
    return (
      <div
        style={{
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          background: '#f0f2f5',
        }}
      >
        <Title level={3}>Waiting for the game to start...</Title>
        <div style={{ marginTop: 32 }}>
          <Spin size="large" />
        </div>
      </div>
    );
  }

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        background: '#f0f2f5',
        padding: 24,
      }}
    >
      <Card
        style={{
          width: 400,
          textAlign: 'center',
          padding: 24,
          boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
        }}
      >
        <Title level={2}>BigBrain</Title>
        <Paragraph style={{ marginBottom: 32 }}>Welcome to the game!</Paragraph>

        <Input
          placeholder="Enter your nickname"
          size="large"
          value={nickname}
          onChange={(e) => setNickname(e.target.value)}
          style={{ marginBottom: 20 }}
        />

        <Button
          type="primary"
          size="large"
          block
          onClick={handleJoin}
          loading={loading}
        >
          Join Game
        </Button>
      </Card>
    </div>
  );
}


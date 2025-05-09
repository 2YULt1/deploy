import React, { useEffect, useState } from 'react';
import { Typography, Card, Radio, Button, message } from 'antd';
import { get, put } from '../../tools/request';

const { Title } = Typography;

export default function AnswerPage() {
  const [question, setQuestion] = useState(null);
  const [selected, setSelected] = useState('');
  const [correctAnswers, setCorrectAnswers] = useState([]);
  const [timeLeft, setTimeLeft] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);
  const playerId = localStorage.getItem('playerId');

  useEffect(() => {
    const fetchQuestion = async () => {
      try {
        const res = await get(`/play/${playerId}/question`);
        if (res.question) {
          setQuestion(res.question);
          setTimeLeft(parseInt(res.question.duration) || 10);
        } else {
          message.info('No question available');
        }
      } catch (err) {
        message.error('Failed to load question');
      }
    };

    fetchQuestion();
  }, [playerId]);

  useEffect(() => {
    if (timeLeft <= 0 || showAnswer) return;

    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          handleTimeUp();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft, showAnswer]);

  const handleTimeUp = async () => {
    if (!showAnswer) {
      await fetchCorrectAnswers();
      setShowAnswer(true);
    }
  };

  const fetchCorrectAnswers = async () => {
    try {
      const res = await get(`/play/${playerId}/answer`);
      console.log(res,'res')
      if (Array.isArray(res)) {
        setCorrectAnswers(res);
      } else {
        message.warning('Correct answer format is invalid');
        setCorrectAnswers([]);
      }
    } catch (err) {
      message.error('Failed to fetch correct answers');
      setCorrectAnswers([]);
    }
  };

  const handleSubmit = async () => {
    try {
      await put(`/play/${playerId}/answer`, {
        answers: [selected]
      });
      message.success('Answer submitted!');
      await fetchCorrectAnswers();
      setShowAnswer(true);
    } catch (err) {
      message.error('Failed to submit answer');
    }
  };

  if (!question) {
    return <Title level={3}>Loading question...</Title>;
  }

  return (
    <Card title="Current Question" style={{ maxWidth: 600, margin: 'auto', marginTop: 48 }}>
      <Title level={4}>{question.text}</Title>
      <p>⏱ Time left: {timeLeft}s</p>

      <Radio.Group
        onChange={e => setSelected(e.target.value)}
        value={selected}
        disabled={showAnswer}
      >
        {question.answers.map((ans, idx) => {
          const isCorrect = Array.isArray(correctAnswers) && correctAnswers.includes(ans.text);
          const isSelectedWrong = showAnswer && selected === ans.text && !isCorrect;

          return (
            <Radio
              key={idx}
              value={ans.text}
              style={{
                display: 'block',
                marginTop: 8,
                color: isCorrect ? 'green' : isSelectedWrong ? 'red' : undefined,
                fontWeight: isCorrect ? 'bold' : 'normal'
              }}
            >
              {ans.text}
            </Radio>
          );
        })}
      </Radio.Group>

      <Button
      type="primary"
      // disabled={!selected || (showAnswer && correctAnswers.length > 0)}
      style={{ marginTop: 16 }}
      onClick={handleSubmit}
    >
      Submit
    </Button>
    </Card>
  );
}

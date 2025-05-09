import { useParams, useNavigate } from 'react-router';
import { useEffect, useState, useRef } from 'react';
import { Button, Typography, Card, message, Table,Empty,Flex} from 'antd';
import { get ,post} from '../../tools/request';
import {BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid,LineChart, Line, ResponsiveContainer} from 'recharts';

const { Title, Paragraph } = Typography;

export default function SessionPage() {
  const { sessionId } = useParams();
  const navigate = useNavigate();
  const [sessionData, setSessionData] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(-1);
  const [timeLeft, setTimeLeft] = useState(0);
  const timerRef = useRef(null);
  const [showResults, setShowResults] = useState(false);
  const [scoreData, setScoreData] = useState([]);
  const [accuracyData, setAccuracyData] = useState([]);
  const [timeData, setTimeData] = useState([]);
  const [prevIndex, setPrevIndex] = useState(-2);
  const [hasStartedTimer, setHasStartedTimer] = useState(false);


  useEffect(() => {
    let intervalId = null;
  
    const fetchSessionStatus = async () => {
      try {
        const data = await get(`/admin/session/${sessionId}/status`);
        setSessionData(data.results);
        setCurrentIndex(data.results.position);
      } catch (err) {
        message.error('Failed to fetch session data');
      }
    };
  
    // 初次加载立即请求一次
    fetchSessionStatus();
  
    // 开始轮询，每 5 秒一次
    intervalId = setInterval(fetchSessionStatus, 3000);
  
    // 清除定时器
    return () => clearInterval(intervalId);
  }, [sessionId]);
  

  useEffect(() => {
    if (
      sessionData &&
      currentIndex >= 0 &&
      currentIndex < sessionData.questions.length &&
      !hasStartedTimer
    ) {
      setHasStartedTimer(true); //设置为已开始倒计时
      const duration = parseInt(sessionData.questions[currentIndex].duration);
      setTimeLeft(duration);
  
      if (timerRef.current) clearInterval(timerRef.current);
      timerRef.current = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            clearInterval(timerRef.current);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
  
    return () => clearInterval(timerRef.current);
  }, [currentIndex]);
  
  

  const handleNext = async () => {
    if (!sessionData || currentIndex >= sessionData.questions.length - 1) {
      message.info('Game has ended');
      return;
    }
  
    try {
      const gameId = localStorage.getItem(`session_${sessionId}_gameId`);
      if (!gameId) {
        message.error('Game ID not found');
        return;
      }
  
      await post(`/admin/game/${gameId}/mutate`, { mutationType: 'ADVANCE' });
  
      const updatedStatus = await get(`/admin/session/${sessionId}/status`);
      setSessionData(updatedStatus.results);
      setCurrentIndex(updatedStatus.results.position);
      setHasStartedTimer(false); 
    } catch (err) {
      message.error(err?.message || 'Failed to advance to next question');
      console.error(err);
    }
  };
  
  const question = sessionData?.questions?.[currentIndex];

  const handleEndSession = async () => {
    try {
      const gameId = localStorage.getItem(`session_${sessionId}_gameId`);
      if (!gameId) {
        message.error('Game ID not found');
        return;
      }
  
      // 🔥 1. 正式结束游戏
      await post(`/admin/game/${gameId}/mutate`, {
        mutationType: 'END'
      });
  
      // 📊 2. 获取游戏结果
      const result = await get(`/admin/session/${sessionId}/results`);
  
      // 🧠 3. 处理图表与分数数据
      const scoreTable = [];
      const accuracyMap = {};
      const timeMap = {};
  
      result.forEach((player, index) => {
        let score = 0;
        player.answers.forEach((entry, qIndex) => {
          const qKey = `Q${qIndex + 1}`;
          if (entry.correct) score++;
  
          if (!accuracyMap[qKey]) accuracyMap[qKey] = { correct: 0, total: 0 };
          if (entry.correct) accuracyMap[qKey].correct++;
          accuracyMap[qKey].total++;
  
          if (!timeMap[qKey]) timeMap[qKey] = [];
          const start = new Date(entry.questionStartedAt);
          const end = new Date(entry.answeredAt);
          const delta = (end - start) / 1000;
          if (!isNaN(delta)) timeMap[qKey].push(delta);
        });
  
        scoreTable.push({
          key: index,
          name: player.name,
          score
        });
      });
  
      const accuracyData = Object.entries(accuracyMap).map(([q, { correct, total }]) => ({
        question: q,
        accuracy: parseFloat((correct / total).toFixed(2)),
      }));
  
      const timeData = Object.entries(timeMap).map(([q, times]) => ({
        question: q,
        time: parseFloat((times.reduce((a, b) => a + b, 0) / times.length).toFixed(2)),
      }));
  
      const top5 = scoreTable.sort((a, b) => b.score - a.score).slice(0, 5);
  
      // ✅ 更新状态展示结果
      setScoreData(top5);
      setAccuracyData(accuracyData);
      setTimeData(timeData);
      setShowResults(true);
    } catch (err) {
      message.error(err?.error || 'Failed to end session or fetch results');
    }
  };
  
  return (
    <div style={{ padding: 32 }}>
      <Button onClick={() => navigate('/dashboard')} style={{ marginBottom: 16 }}>
        ← Back to Dashboard
      </Button>

      <Title level={2}>Session ID: {sessionId}</Title>

      {sessionData?.active || showResults ? (
        <>
          <Paragraph type="success">Game is currently <strong>Active</strong></Paragraph>
          {question ? (
            <Card title={`Question ${currentIndex + 1} / ${sessionData.questions.length}`}>
              <p><strong>Question Text:</strong> {question.text}</p>
              <p><strong>Type:</strong> {question.type}</p>
              <p><strong>Points:</strong> {question.points}</p>
              <p><strong>Time Left:</strong> {timeLeft}s</p>
            </Card>
          ) : (
            <Paragraph>Click "Next" to begin the game.</Paragraph>
          )}

         <Flex gap={20}>
         <Button type="primary" onClick={handleNext} style={{ marginTop: 16 }}>
            {currentIndex === -1 ? 'Start Game' : 'Next Question'}
          </Button>

          <Button danger onClick={handleEndSession} style={{ marginTop: 16 }}>
            End Session & Show Results
          </Button>
         </Flex>


          {showResults && (
          <div style={{ marginTop: 40 }}>
            <Title level={3}>Session Results</Title>

            {/* score */}
            <Title level={5}>Top 5 Scores</Title>
            <Table
              dataSource={scoreData}
              columns={[
                { title: 'User', dataIndex: 'name', key: 'name' },
                { title: 'Score', dataIndex: 'score', key: 'score' },
              ]}
              pagination={false}
              style={{ maxWidth: 500 }}
            />

            {/* accuracy */}
            <div style={{ marginTop: 40 }}>
              <Title level={5}>Question Accuracy</Title>
              {accuracyData.length === 0 ? (
                <Empty description="No Accuracy Data" />
              ) : (
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={accuracyData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="question" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="accuracy" fill="#8884d8" />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>

            {/* avg time */}
            <div style={{ marginTop: 40 }}>
              <Title level={5}>Average Answer Time (seconds)</Title>
              {timeData.length === 0 ? (
                <Empty description="No Timing Data" />
              ) : (
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={timeData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="question" />
                    <YAxis />
                    <Tooltip />
                    <Line type="monotone" dataKey="time" stroke="#82ca9d" />
                  </LineChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>
        )}

        </>
      ) : (
        <Paragraph type="warning">Game is not currently active.</Paragraph>
      )}
    </div>
  );
}
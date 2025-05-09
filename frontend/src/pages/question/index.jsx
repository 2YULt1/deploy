import { useParams, useNavigate } from 'react-router';
import { Button, Form, Input, Select, Checkbox, Modal, Space, Typography, List, message, } from 'antd';
import { useEffect, useState } from 'react';
import { put } from '../../tools/request';

const { Title } = Typography;
const { Option } = Select;

export default function QuestionEditPage() {
  const { gameId, questionId } = useParams();
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [answerForm] = Form.useForm();
  const [question, setQuestion] = useState({});
  const [answers, setAnswers] = useState([]);
  const [confirmVisible, setConfirmVisible] = useState(false);
  const [isAnswerModalOpen, setIsAnswerModalOpen] = useState(false);
  const [newAnswerText, setNewAnswerText] = useState('');

  useEffect(() => {
    const gameData = JSON.parse(localStorage.getItem('games')) || [];
    const game = gameData.find(g => g.id === Number(gameId));
    const q = game?.questions?.[Number(questionId)];
    if (!q) {
      message.error('Question not found');
      return;
    }
    setQuestion(q);
    setAnswers(q.answers || []);
    form.setFieldsValue(q);
  }, [gameId, questionId]);

  const handleAddAnswer = (values) => {
    setAnswers([...answers, { text: values.text, correct: values.correct || false }]);
    answerForm.resetFields();
  };

  const handleSave = () => {
    setConfirmVisible(true);
  };

  const handleConfirmSave = async () => {
    const values = form.getFieldsValue();

    if (answers.length < 2) {
      message.error("At least 2 answers are required.");
      return;
    }

    if (answers.length > 6) {
      message.error("You can only add up to 6 answers.");
      return;
    }

    const correctCount = answers.filter(a => a.correct).length;
    const type = values.type;

    if (type === 'single' && correctCount !== 1) {
      message.error("Single choice must have exactly one correct answer.");
      return;
    }

    if (type === 'multiple' && correctCount < 1) {
      message.error("Multiple choice must have at least one correct answer.");
      return;
    }

    if (type === 'boolean') {
      if (answers.length !== 2) {
        message.error("Judgement (boolean) must have exactly 2 answers.");
        return;
      }
      if (correctCount !== 1) {
        message.error("Judgement question must have exactly one correct answer.");
        return;
      }
    }

    const correctAnswers = answers.filter(a => a.correct).map(a => a.text);
    const updatedQuestion = { ...values, answers, correctAnswers };
    const games = JSON.parse(localStorage.getItem('games')) || [];
    const gameIndex = games.findIndex(g => g.id === Number(gameId));

    if (gameIndex > -1) {
      games[gameIndex].questions[Number(questionId)] = updatedQuestion;

      try {
        await put('/admin/games', { games });
        localStorage.setItem('games', JSON.stringify(games));
        message.success('Question saved!');
        navigate(`/game/${gameId}`);
      } catch (err) {
        message.error('Failed to save question');
      }
    }

    setConfirmVisible(false);
  };

  return (
    <div style={{ maxWidth: 700, margin: '0 auto', padding: 24 }}>
      <Button onClick={() => navigate(`/game/${gameId}`)}>← Back to Game</Button>
      <Title level={3} style={{ marginTop: 16 }}>Edit Question</Title>

      <Form form={form} layout="vertical">
        <Form.Item name="text" label="Question Text" rules={[{ required: true }]}><Input />
        </Form.Item>
        <Form.Item name="type" label="Question Type" rules={[{ required: true }]}><Select placeholder="Select type">
            <Option value="single">Single Choice</Option>
            <Option value="multiple">Multiple Choice</Option>
            <Option value="boolean">True / False</Option>
          </Select>
        </Form.Item>
        <Form.Item name="duration" label="Time Limit (seconds)" rules={[{ required: true }]}><Input type="number" />
        </Form.Item>
        <Form.Item name="points" label="Points" rules={[{ required: true }]}><Input type="number" />
        </Form.Item>
        <Form.Item name="media" label="YouTube URL or Image Link"><Input placeholder="Optional media (YouTube or image URL)" />
        </Form.Item>
      </Form>

      <Button
        type="dashed"
        style={{ marginTop: 24 }}
        onClick={() => {
          if (answers.length >= 6) {
            message.warning("You can only add up to 6 answers.");
            return;
          }
          setNewAnswerText('');
          setIsAnswerModalOpen(true);
        }}
      >
        + Add Answer
      </Button>

      <List
        header="Answers"
        dataSource={answers}
        bordered
        style={{ marginTop: 16 }}
        renderItem={(a, idx) => (
          <List.Item
            style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
          >
            <span>{a.text}</span>
            <Space>
              <Checkbox
                checked={a.correct}
                onChange={() => {
                  const updated = answers.map((ans, i) =>
                    i === idx ? { ...ans, correct: !ans.correct } : ans
                  );
                  setAnswers(updated);
                }}
              >
                Correct
              </Checkbox>
              <Button
                danger
                size="small"
                onClick={() => {
                  const updated = answers.filter((_, i) => i !== idx);
                  setAnswers(updated);
                }}
              >
                Delete
              </Button>
            </Space>
          </List.Item>
        )}
      />

      <Space style={{ marginTop: 24 }}>
        <Button type="primary" onClick={handleSave}>Save</Button>
        <Button onClick={() => navigate(`/game/${gameId}`)}>Cancel</Button>
      </Space>

      <Modal
        open={confirmVisible}
        onOk={handleConfirmSave}
        onCancel={() => setConfirmVisible(false)}
        title="Confirm Save"
      >
        Are you sure you want to save changes to this question?
      </Modal>

      <Modal
        open={isAnswerModalOpen}
        title="Add Answer"
        okText="Add"
        onCancel={() => setIsAnswerModalOpen(false)}
        onOk={() => {
          if (!newAnswerText.trim()) {
            message.error('Answer text cannot be empty');
            return;
          }
          setAnswers([...answers, { text: newAnswerText.trim(), correct: false }]);
          setIsAnswerModalOpen(false);
        }}
      >
        <Input
          placeholder="Enter answer text"
          value={newAnswerText}
          onChange={(e) => setNewAnswerText(e.target.value)}
        />
      </Modal>
    </div>
  );
}

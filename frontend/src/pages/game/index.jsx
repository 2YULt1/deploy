import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router";
import { get, put } from "../../tools/request";
import { Button,List,Modal,Form,Input,message,Typography,Upload,Select,Popconfirm,Layout,Breadcrumb } from "antd";
import { EditOutlined, ArrowLeftOutlined, PlusOutlined } from '@ant-design/icons';

const { Option } = Select;
const { Title, Paragraph } = Typography;
const { Header, Content, Footer } = Layout;

export default function GamePage() {
  const { gameId } = useParams(); // route param is gameId
  const navigate = useNavigate();
  const [game, setGame] = useState(null);
  const [allGames, setAllGames] = useState([]); // store all games for PUT
  const [form] = Form.useForm();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [confirmLoading, setConfirmLoading] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editForm] = Form.useForm();
  const [editThumbnail, setEditThumbnail] = useState('');
  const handleEditGameInfo = async () => {
    try {
      const values = await editForm.validateFields();
      const updatedGame = {
        ...game,
        name: values.name,
        description: values.description,
        thumbnail: editThumbnail || game.thumbnail, 
      };
  
      const updatedGames = allGames.map((g) =>
        g.id === Number(gameId) ? updatedGame : g
      );
  
      await put('/admin/games', { games: updatedGames });
  
      setGame(updatedGame);
      setAllGames(updatedGames);
      setEditModalOpen(false);
      message.success('Game info updated!');
    } catch (err) {
      message.error('Failed to update game info');
    }
  };
  const formatQuestionType = (type) => {
    switch (type) {
      case 'single':
        return 'Single Choice';
      case 'multiple':
        return 'Multiple Choice';
      case 'boolean':
        return 'True / False';
      default:
        return 'Unknown';
    }
  };
  

  // get game info from all games
  useEffect(() => {
    get(`/admin/games`)
      .then((data) => {
        setAllGames(data.games);
        localStorage.setItem('games', JSON.stringify(data.games));
        const found = data.games.find((g) => g.id === Number(gameId));
        if (!found) {
          message.error("Game not found");
        } else {
          setGame(found);
        }
      })
      .catch(() => message.error("Failed to load game data"));
  }, [gameId]);

  // add new question
  const handleAddQuestion = (values) => {
    const question = {
      text: values.text,
      duration: values.duration,
      type: values.questionType, 
      answers: [], 
      points: values.points, 
    };
  
    const updatedGame = {
      ...game,
      questions: [...game.questions, question],
    };
  
    const updatedGames = allGames.map((g) =>
      g.id === Number(gameId) ? updatedGame : g
    );
  
    setConfirmLoading(true);
    put(`/admin/games`, { games: updatedGames })
      .then(() => {
        setGame(updatedGame);
        setAllGames(updatedGames);
        setIsModalOpen(false);
        setConfirmLoading(false);
        form.resetFields();
        message.success("Question added!");
      })
      .catch(() => {
        setConfirmLoading(false);
        message.error("Failed to add question");
      });
  };

  // delete question
  const handleDelete = (index) => {
    const updatedGame = {
      ...game,
      questions: game.questions.filter((_, i) => i !== index),
    };

    const updatedGames = allGames.map((g) =>
      g.id === Number(gameId) ? updatedGame : g
    );

    put(`/admin/games`, { games: updatedGames })
      .then(() => {
        setGame(updatedGame);
        setAllGames(updatedGames);
        message.success("Question deleted");
      })
      .catch(() => {
        message.error("Failed to delete question");
      });
  };

  return (
    <Layout>
      <Header style={{ display: "flex", alignItems: "center", justifyContent: "space-between",marginBottom: 16, }}>
        <div style={{ color: 'white', fontSize: '20px', fontWeight: 'bold' }}>BigBrain Game Editor</div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <Button icon={<ArrowLeftOutlined />} onClick={() => navigate('/dashboard')}>Back</Button>
          <Button icon={<EditOutlined />} onClick={() => {
            editForm.setFieldsValue({
              name: game?.name,
              description: game?.description,
            });
            setEditModalOpen(true);
          }}>Edit Info</Button>
        </div>
          </Header>
          <Content style={{ padding: '0 48px' }}>
          <Breadcrumb
            style={{ marginBottom: 16 }}
            items={[
              { title: 'Home' },
              { title: 'List' },
              { title: 'App' },
            ]}
          />

        <div style={{ background: '#fff', minHeight: 280, padding: 24, borderRadius: 6 }}>
          <Title level={2}>Game: {game?.name || "Loading..."}</Title>
          <Paragraph>
            <strong>Questions:</strong> {game?.questions?.length || 0}
          </Paragraph>
          <Button type="primary" onClick={() => setIsModalOpen(true)}>
            + Add Question
          </Button>
          <div style={{ height: 16 }} />
          <List
            header="Question List"
            bordered
            dataSource={game?.questions || []}
            renderItem={(q, index) => (
              <List.Item
                actions={[
                  <Button type="link" onClick={() => navigate(`/game/${gameId}/question/${index}`)}>Edit</Button>,
                  <Popconfirm
                    title="Are you sure you want to delete this question?"
                    onConfirm={() => handleDelete(index)}
                    okText="Yes"
                    cancelText="No"
                  >
                    <Button danger type="link">Delete</Button>
                  </Popconfirm>
                ]}
              >
                <div>
                  <strong>Q{index + 1}:</strong> {q.text || "Untitled"} <br />
                  <em>Type:</em> {formatQuestionType(q.type)} <br />
                  <em>Time Limit:</em> {q.duration || 0}s <br />
                  <em>Points:</em> {q.points || 0} <br />
                  <em>Answers:</em> {q.answers?.length || 0}
                </div>
              </List.Item>
            )}
            style={{ marginBottom: 24 }}
          />
        </div>
      </Content>
      <Footer style={{ textAlign: 'center' }}>BigBrain ©{new Date().getFullYear()} Created by Jn-B</Footer>

      {/* Edit game info modal */}
      <Modal
        title="Edit Game Information"
        open={editModalOpen}
        onOk={handleEditGameInfo}
        onCancel={() => setEditModalOpen(false)}
        okText="Save"
      >
      <Form form={editForm} layout="vertical">
        <Form.Item
          label="Game Name"
          name="name"
          rules={[{ required: true, message: 'Please enter game name' }]}
        >
          <Input />
        </Form.Item>
        <Form.Item
          label="Game Description"
          name="description"
          rules={[{ required: true, message: 'Please enter description' }]}
        >
          <Input.TextArea rows={3} />
        </Form.Item>
        <Form.Item label="Thumbnail Image">
          <Upload
            listType="picture-card"
            showUploadList={false}
            beforeUpload={() => false}
            onChange={({ file }) => {
              const reader = new FileReader();
              reader.onload = () => setEditThumbnail(reader.result);
              reader.readAsDataURL(file);
            }}
          >
            {editThumbnail || game?.thumbnail ? (
              <img
                src={editThumbnail || game?.thumbnail}
                alt="thumbnail"
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
            ) : (
              <div>
                <PlusOutlined />
                <div style={{ marginTop: 8 }}>Upload</div>
              </div>
            )}
          </Upload>

          {(editThumbnail || game?.thumbnail) && (
            <Button
              danger
              type="link"
              style={{ marginTop: 8 }}
              onClick={() => setEditThumbnail('')}
            >
              Remove Image
            </Button>
          )}
        </Form.Item>

      </Form>
    </Modal>


      {/* question modal */}
      <Modal
        title="Add New Question"
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        onOk={() => form.submit()}
        confirmLoading={confirmLoading}
        okText="Add"
      >
        <Form form={form} onFinish={handleAddQuestion} layout="vertical">
          <Form.Item
            label="Question Text"
            name="text"
            rules={[{ required: true, message: "Please enter the question text" }]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            label="Question Type"
            name="questionType"
            rules={[{ required: true, message: "Please select a question type" }]}
          >
            <Select placeholder="Select question type">
              <Option value="single">Single Choice</Option>
              <Option value="multiple">Multiple Choice</Option>
              <Option value="boolean">True / False</Option>
            </Select>
          </Form.Item>

          <Form.Item
            label="Time Limit (seconds)"
            name="duration"
            rules={[{ required: true, message: "Please enter the time limit" }]}
          >
            <Input type="number" min={1} />
          </Form.Item>

          <Form.Item
            label="Points"
            name="points"
            rules={[{ required: true, message: "Please enter the score points" }]}
          >
            <Input type="number" min={0} />
          </Form.Item>
        </Form>

      </Modal>

    </Layout>
  );
}
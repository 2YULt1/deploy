import React, { useEffect, useState } from 'react';
import { Layout, Breadcrumb, Button, theme, message, Modal, Input, Form, Empty, Upload, Image, Card, Popover,Flex } from 'antd';
import { useNavigate } from 'react-router';
import { checkLogin } from '../../utils/checkLogin';
import { FireOutlined, PlusOutlined, SettingOutlined, EditOutlined, EllipsisOutlined } from '@ant-design/icons';
import { put, post,get } from '../../utils/request';
import { fileToDataUrl } from '../../utils/Url';

const { Header, Content, Footer } = Layout;
const defaultImageUrl = '/nopicture.png';
const email = localStorage.getItem('email');
const { Meta } = Card;

export default function Dashboard() {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [confirmLoading, setConfirmLoading] = useState(false);
  const [form] = Form.useForm();
  const [thumbnailUrl, setThumbnailUrl] = useState('');
  const [thumbnailFile, setThumbnailFile] = useState(null);
  const [games, setGames] = useState([]);
  const [visibleMap, setVisibleMap] = useState({});
  const [sessionModalVisible, setSessionModalVisible] = useState(false);
  const [sessionId, setSessionId] = useState('');
  const [activeSessions, setActiveSessions] = useState({});
  const [stopModalVisible, setStopModalVisible] = useState(false);
  const [stoppedGameId, setStoppedGameId] = useState(null);

  useEffect(() => {
    const Ylogin = checkLogin();
    if (!Ylogin) {
      message.warning('Please log in first', 1.1, () => {
        navigate('/login');
      });
      return;
    }
  
    get('/admin/games')
      .then(data => {
        const userGames = data.games.filter(game => game.owner === email);
        setGames(userGames);
  
        const activeMap = {};
        userGames.forEach(game => {
          if (game.active) {
            activeMap[game.id] = true;
          }
        });
        setActiveSessions(activeMap);
      })
      .catch(() => {
        message.error('Failed to fetch games');
      });
  }, []);
  
  const {
    token: { colorBgContainer, borderRadiusLG },
  } = theme.useToken();

  const showModal = () => {
    setOpen(true);
  };
  
  const handleOk = async () => {
    try {
      const values = await form.validateFields();
      const imageData = thumbnailUrl || defaultImageUrl;
  
      const newGame = {
        id: Math.floor(Math.random() * 100000000),
        owner: email,
        name: values.name,
        description: values.description,
        thumbnail: imageData,
        CreateTime: new Date().toISOString(),
        questions: [],
      };
  
      // get game list
      const res = await fetch('http://localhost:5005/admin/games', {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });
      const data = await res.json();
      const existingGames = data.games || [];
  
      // update and add
      const updatedGames = [...existingGames, newGame];
      const payload = { games: updatedGames };
  
      setConfirmLoading(true);
      await put('/admin/games', payload);
  
      // update
      setGames(prev => [...prev, newGame]);
  
      message.success('Game created!');
      setOpen(false);
      setConfirmLoading(false);
      form.resetFields();
      setThumbnailUrl('');
      setThumbnailFile(null);
    } catch (err) {
      message.error('Failed to create game.');
      setConfirmLoading(false);
    }
  };

  //cancel create
  const handleCancel = () => {
    setOpen(false);
    form.resetFields();
    setThumbnailUrl('');
    setThumbnailFile(null);
  };

  //logout
  const handleLogout = () => {
    post('/admin/auth/logout', {})
      .then(() => {
        message.success('Logout success');
        localStorage.removeItem('token');
        navigate('/login');
      })
      .catch(err => {
        message.error(`Logout failed: ${err.message}`);
      });
  };

  //delete games
  const handleDeleteGame = async (idToDelete) => {
    try {
      const res = await fetch('http://localhost:5005/admin/games', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        }
      });
      const data = await res.json();
      const updatedGames = data.games.filter(g => g.id !== idToDelete);
      await put('/admin/games', { games: updatedGames });
      setGames(updatedGames);
      message.success('Game deleted');
    } catch (err) {
      message.error('Failed to delete game');
    }
  };

  
  
  return (
    <Layout style={{height:'100%'}}>
      <Flex gap="middle" vertical style={{height:'100%'}}>
      <Header style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: 'white', fontSize: '20px', fontWeight: 'bold' }}>
          <FireOutlined style={{ fontSize: '24px' }} />
          BigBrain
        </div>

        <div style={{ display: 'flex', gap: '12px' }}>
          <Button type="primary" onClick={showModal}>+ Create New Game</Button>
          <Button color="danger" variant="filled" onClick={handleLogout}>Log Out</Button>
        </div>
      </Header>

      <Content style={{ padding: '0 48px' ,flex:'1'}}>
        <Breadcrumb
          style={{ margin: '16px 0' }}
          items={[
            { title: 'Home' },
            { title: 'Dashboard' }
          ]}
        />
        <div
          style={{
            background: colorBgContainer,
            minHeight: 280,
            padding: 24,
            borderRadius: borderRadiusLG,
            display: 'flex',
            flexWrap: 'wrap',
            justifyContent: 'flex-start',
            alignItems: 'flex-start',
            gap: 24,
            
          }}
        >
          {games.length === 0 ? (
            <Empty
              image={Empty.PRESENTED_IMAGE_SIMPLE}
              description="No game available. Please create first."
            />
          ) : (
            <div style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: '24px',
              justifyContent: 'center',
              border:'1px solid #eee',
              borderRadius:'6px',
              overflow:'hidden'
            }}>
              {games.map((game) => {
                const questionCount = game.questions?.length || 0;
                const totalDuration = game.questions?.reduce((sum, q) => sum + (q.duration || 0), 0) || 0;

                return (
                  <Card

                    key={game.id}
                    style={{ width: 230,border:'none'}}
                    cover={
                      <Image
                        alt="thumbnail"
                        src={game.thumbnail || defaultImageUrl}
                        preview={false}
                        style={{
                          maxHeight: 160,              
                          width: '100%',            
                          objectFit: 'cover',       
                        }}
                      />
                    }
                    
                    actions={[
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                        <div style={{ display: 'flex', gap: '8px' }}>
                          <Button
                            type="link"
                            onClick={() => navigate(`/game/${game.id}`)}
                            icon={<EditOutlined />}
                            style={{ padding: 0 }}
                          >
                            Edit
                          </Button>
                          <Popover
                            title="Are you sure to delete?"
                            trigger="click"
                            open={visibleMap[game.id]}
                            onOpenChange={(visible) => {
                              setVisibleMap((prev) => ({ ...prev, [game.id]: visible }));
                            }}
                            content={
                              <div style={{ display: 'flex', gap: '8px' }}>
                                <Button
                                  size="small"
                                  type="primary"
                                  danger
                                  onClick={() => {
                                    handleDeleteGame(game.id);
                                    setVisibleMap((prev) => ({ ...prev, [game.id]: false }));
                                  }}
                                >
                                  Yes
                                </Button>
                                <Button
                                  size="small"
                                  onClick={() => {
                                    message.error('Delete cancelled');
                                    setVisibleMap((prev) => ({ ...prev, [game.id]: false }));
                                  }}
                                >
                                  No
                                </Button>
                              </div>
                            }
                          >
                            <Button type="link" danger icon={<SettingOutlined />} style={{ padding: 0 }}>
                              Delete
                            </Button>
                          </Popover>
                        </div>
                    
                        {/*  Manage Game button */}
                        {activeSessions[game.id] && (
                          <Button
                            type="link"
                            style={{ padding: 0, marginTop: 6 }}
                            onClick={() => navigate(`/session/${game.active?game.active:sessionId}`)}
                          >
                            Manage Game
                          </Button>
                        )}
                      </div>
                    ]}                 
                    
                  >
                    <Meta
                      title={game.name}
                      description={
                        <div>
                          <div><strong>Owner:</strong> {game.owner}</div>
                          <div><strong>Description:</strong> {game.description}</div>
                          <div><strong>Questions:</strong> {questionCount}</div>
                          <div><strong>Created:</strong> {new Date(game.CreateTime).toLocaleString()}</div>
                        </div>
                      }
                    />

                  </Card>
                );
              })}
            </div>
          )}

        </div>
      </Content>

      <Footer style={{ textAlign: 'center' }}>
        BigBrain ©{new Date().getFullYear()} Created by Jn-B
      </Footer>
      </Flex>
      {/* Create Modal */}
      <Modal
        title="Create New Game"
        open={open}
        onOk={handleOk}
        confirmLoading={confirmLoading}
        onCancel={handleCancel}
        okText="Create"
      >
        <Form
          form={form}
          layout="vertical"
          name="create-game-form"
        >
          <Form.Item
            label="Game Name"
            name="name"
            rules={[{ required: true, message: 'Please enter the game name' }]}
          >
            <Input placeholder="Enter game name" />
          </Form.Item>

          <Form.Item
            label="Game Description"
            name="description"
            rules={[{ required: true, message: 'Please enter the game description' }]}
          >
            <Input.TextArea rows={3} placeholder="Enter game description" />
          </Form.Item>

          <Form.Item label="Thumbnail Image">
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <Upload
                listType="picture-card"
                showUploadList={false}
                beforeUpload={() => false}
                onChange={({ file }) => {
                  fileToDataUrl(file).then(dataUrl => {
                    setThumbnailUrl(dataUrl);
                    setThumbnailFile(file);
                  }).catch(err => {
                    message.error(err.message);
                  });
                }}
              >
                {thumbnailUrl ? (
                  <Image
                    src={thumbnailUrl}
                    alt="thumbnail"
                    style={{
                      width: 200,
                      height: 200,
                      objectFit: 'cover',
                      borderRadius: 8,
                      border: '1px solid #ccc'
                    }}
                    preview={false}
                  />
                ) : (
                  <div style={{
                    width: 200,
                    height: 200,
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    alignItems: 'center'
                  }}>
                    <PlusOutlined style={{ fontSize: 24 }} />
                    <div style={{ marginTop: 8 }}>Upload</div>
                  </div>
                )}
              </Upload>

              {thumbnailUrl && (
                <Button
                  danger
                  type="link"
                  style={{ marginTop: 8 }}
                  onClick={() => {
                    setThumbnailUrl('');
                    setThumbnailFile(null);
                  }}
                >
                  Remove Image
                </Button>
              )}
            </div>
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title="Game Session Started"
        open={sessionModalVisible}
        onCancel={() => setSessionModalVisible(false)}
        footer={[
          <Button key="close" onClick={() => setSessionModalVisible(false)}>
            Close
          </Button>,
          <Button
            key="copy"
            type="primary"
            onClick={() => {
              const sessionURL = `${window.location.origin}/play/${sessionId}`;
              navigator.clipboard.writeText(sessionURL)
                .then(() => {
                  message.success('Session link copied!');
                })
                .catch(() => {
                  message.error('Failed to copy link');
                });
            }}
          >
            Copy Link
          </Button>
        ]}
      >
        <p><strong>Session ID:</strong> {sessionId}</p>
        <p>
          You can share this session link:
          <br />
          <a
            href={`${window.location.origin}/play/${sessionId}`}
            target="_blank"
            rel="noopener noreferrer"
          >
            {`${window.location.origin}/play/${sessionId}`}
          </a>
        </p>

      </Modal>
      
      <Modal
        open={stopModalVisible}
        title="Game Ended"
        onCancel={() => setStopModalVisible(false)}
        footer={[
          <Button key="close" onClick={() => setStopModalVisible(false)}>Close</Button>,
          <Button key="view" type="primary" onClick={() => message.info('View results (not implemented yet)')}>
            View Results
          </Button>
        ]}
      >
        <p>The game session has ended. Would you like to view the results?</p>
      </Modal>

    </Layout>
  );
}
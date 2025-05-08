import React from 'react';
import { Form, Input, Button, Typography, message, Card } from 'antd';
import { useNavigate } from 'react-router';
import { post } from '../../utils/request';

const { Title, Text } = Typography;

export default function Register() {
  const navigate = useNavigate();

  const onFinish = (values) => {
    const { email, password, name } = values;
    post('/admin/auth/register', {
      email,
      password,
      name
    }).then(res => {
      console.log(res, 'res');
      if (res && res.token) {
        localStorage.setItem('token', res.token);
        localStorage.setItem('email', values.email);
        message.success('You have successfully registered. Redirecting you to the dashboard.');
        navigate('/dashboard');
      }
    });
  };

  const onFinishFailed = (errorInfo) => {
    console.log('Register failed:', errorInfo);
  };

  return (
    <div
      style={{
        display: 'flex',
        height: '100%',
        justifyContent: 'center',
        alignItems: 'center',
        background: 'linear-gradient(135deg, #89f7fe 0%, #66a6ff 100%)',
      }}
    >
      <Card
        style={{
          width: 540,
          padding: '32px',
          borderRadius: '16px',
          boxShadow: '0 8px 24px rgba(0,0,0,0.2)',
          backgroundColor: '#fff'
        }}
      >
        <Title level={2} style={{ textAlign: 'center', marginBottom: '16px', fontWeight: '700' }}>
          Create Account ✨
        </Title>
        <Text style={{ display: 'block', textAlign: 'center', marginBottom: '24px', color: '#555' }}>
          Please fill in your details
        </Text>

        <Form
          name="register"
          layout="vertical"
          onFinish={onFinish}
          onFinishFailed={onFinishFailed}
        >
          <Form.Item
            label="Email"
            name="email"
            rules={[
              { required: true, message: 'Please input your email!' },
              { type: 'email', message: 'The input is not a valid email!' },
            ]}
          >
            <Input size="large" placeholder="you@example.com" style={{ borderRadius: '8px' }} />
          </Form.Item>

          <Form.Item
            label="Name"
            name="name"
            rules={[{ required: true, message: 'Please input your name!' }]}
          >
            <Input size="large" placeholder="Your name" style={{ borderRadius: '8px' }} />
          </Form.Item>

          <Form.Item
            label="Password"
            name="password"
            rules={[{ required: true, message: 'Please input your password!' }]}
            hasFeedback
          >
            <Input.Password size="large" placeholder="Create a password" style={{ borderRadius: '8px' }} />
          </Form.Item>

          <Form.Item
            label="Confirm Password"
            name="confirm"
            dependencies={['password']}
            hasFeedback
            rules={[
              { required: true, message: 'Please confirm your password!' },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue('password') === value) {
                    return Promise.resolve();
                  }
                  return Promise.reject(new Error('The two passwords do not match!'));
                },
              }),
            ]}
          >
            <Input.Password size="large" placeholder="Repeat your password" style={{ borderRadius: '8px' }} />
          </Form.Item>

          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              block
              size="large"
              style={{
                borderRadius: '8px',
                transition: 'all 0.3s',
              }}
            >
              Register
            </Button>
          </Form.Item>
        </Form>

        <div style={{ textAlign: 'center', marginTop: '8px' }}>
          <Text type="secondary">
            Already have an account?{' '}
            <Button
              type="link"
              onClick={() => navigate('/login')}
              style={{ padding: 0, fontWeight: '600' }}
            >
              Login here
            </Button>
          </Text>
        </div>
      </Card>
    </div>
  );
}

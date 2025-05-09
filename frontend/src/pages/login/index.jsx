import { useNavigate } from "react-router";
import React from 'react';
import { Button, Checkbox, Form, Input, message, Card, Typography } from 'antd';
import { post } from "../../tools/request";

const { Title, Text } = Typography;

export default function Login() {
  const navigate = useNavigate();

  const goRegister = () => {
    navigate('/register');
  };

  const onFinish = (values) => {
    const { email, password } = values;

    post('/admin/auth/login', { email, password })
      .then(res => {
        localStorage.setItem('token', res.token);
        localStorage.setItem('email', values.email);
        message.success('You have successfully logged in. Redirecting you to the dashboard.');
        navigate('/dashboard');
      })
  };

  const onFinishFailed = (errorInfo) => {
    console.log('Failed:', errorInfo);
  };

  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100%',
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
          Welcome Back 👋
        </Title>
        <Text style={{ display: 'block', textAlign: 'center', marginBottom: '24px', color: '#555' }}>
          Please login to your account
        </Text>

        <Form
          name="login"
          layout="vertical"
          initialValues={{ remember: true }}
          onFinish={onFinish}
          onFinishFailed={onFinishFailed}
          autoComplete="off"
        >
          <Form.Item
            label="Email"
            name="email"
            rules={[{ required: true, message: 'Please input your email!' }]}
          >
            <Input
              size="large"
              placeholder="you@example.com"
              style={{ borderRadius: '8px' }}
            />
          </Form.Item>

          <Form.Item
            label="Password"
            name="password"
            rules={[{ required: true, message: 'Please input your password!' }]}
          >
            <Input.Password
              size="large"
              placeholder="Your password"
              style={{ borderRadius: '8px' }}
            />
          </Form.Item>

          <Form.Item name="remember" valuePropName="checked">
            <Checkbox>Remember me</Checkbox>
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
              Log In
            </Button>
          </Form.Item>

          <Form.Item style={{ marginBottom: 0, textAlign: 'center' }}>
            <Text type="secondary">
              Don’t have an account?
            </Text>
            <Button
              type="link"
              onClick={goRegister}
              style={{ padding: 0, fontWeight: '600' }}
            >
              Register here
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
}

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import axios from 'axios';
import LoginPage from '../pages/LoginPage';

jest.mock('axios');

describe('LoginPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
  });

  it('renders login form', () => {
    render(
      <BrowserRouter>
        <LoginPage />
      </BrowserRouter>
    );

    expect(screen.getByPlaceholderText('Email')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Password')).toBeInTheDocument();
    expect(screen.getByText('Login')).toBeInTheDocument();
    expect(screen.getByText('Register here')).toBeInTheDocument();
  });

  it('shows error message when login fails', async () => {
    axios.post.mockRejectedValueOnce({
      response: { data: { error: 'Invalid credentials' } }
    });

    render(
      <BrowserRouter>
        <LoginPage />
      </BrowserRouter>
    );

    fireEvent.change(screen.getByPlaceholderText('Email'), {
      target: { value: 'test@example.com' }
    });
    fireEvent.change(screen.getByPlaceholderText('Password'), {
      target: { value: 'password123' }
    });
    fireEvent.click(screen.getByText('Login'));

    await waitFor(() => {
      expect(screen.getByText('Invalid credentials')).toBeInTheDocument();
    });
  });

  it('successfully logs in and navigates to dashboard', async () => {
    axios.post.mockResolvedValueOnce({
      data: { token: 'test-token' }
    });

    const { container } = render(
      <BrowserRouter>
        <LoginPage />
      </BrowserRouter>
    );

    fireEvent.change(screen.getByPlaceholderText('Email'), {
      target: { value: 'test@example.com' }
    });
    fireEvent.change(screen.getByPlaceholderText('Password'), {
      target: { value: 'password123' }
    });
    fireEvent.click(screen.getByText('Login'));

    await waitFor(() => {
      expect(localStorage.getItem('token')).toBe('test-token');
      expect(window.location.pathname).toBe('/dashboard');
    });
  });

  it('submits form on enter key press', async () => {
    axios.post.mockResolvedValueOnce({
      data: { token: 'test-token' }
    });

    render(
      <BrowserRouter>
        <LoginPage />
      </BrowserRouter>
    );

    const emailInput = screen.getByPlaceholderText('Email');
    const passwordInput = screen.getByPlaceholderText('Password');

    fireEvent.change(emailInput, {
      target: { value: 'test@example.com' }
    });
    fireEvent.change(passwordInput, {
      target: { value: 'password123' }
    });
    fireEvent.keyPress(passwordInput, { key: 'Enter', code: 'Enter' });

    await waitFor(() => {
      expect(axios.post).toHaveBeenCalledWith('/admin/auth/login', {
        email: 'test@example.com',
        password: 'password123'
      });
    });
  });

  it('validates required fields', async () => {
    render(
      <BrowserRouter>
        <LoginPage />
      </BrowserRouter>
    );

    fireEvent.click(screen.getByText('Login'));

    expect(axios.post).not.toHaveBeenCalled();
    expect(screen.getByPlaceholderText('Email')).toBeInvalid();
    expect(screen.getByPlaceholderText('Password')).toBeInvalid();
  });
}); 
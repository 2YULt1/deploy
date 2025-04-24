import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import axios from 'axios';
import QuestionEditPage from '../pages/QuestionEditPage';

jest.mock('axios');

describe('QuestionEditPage', () => {
  const mockGame = {
    id: 1,
    questions: [
      {
        type: 'single',
        stem: 'Test Question',
        options: ['Option 1', 'Option 2'],
        correctAnswers: [0],
        duration: 30,
        points: 10,
        mediaUrl: ''
      }
    ]
  };

  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.setItem('token', 'test-token');
    axios.get.mockResolvedValueOnce({ data: { games: [mockGame] } });
  });

  it('renders question edit form', async () => {
    render(
      <BrowserRouter>
        <Routes>
          <Route path="/game/:gameId/question/:questionId" element={<QuestionEditPage />} />
        </Routes>
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Edit Question 1')).toBeInTheDocument();
      expect(screen.getByLabelText('Question Type')).toBeInTheDocument();
      expect(screen.getByLabelText('Question')).toBeInTheDocument();
      expect(screen.getByLabelText('Duration (seconds)')).toBeInTheDocument();
      expect(screen.getByLabelText('Points')).toBeInTheDocument();
      expect(screen.getByText('Option 1')).toBeInTheDocument();
      expect(screen.getByText('Option 2')).toBeInTheDocument();
    });
  });

  it('updates question type', async () => {
    render(
      <BrowserRouter>
        <Routes>
          <Route path="/game/:gameId/question/:questionId" element={<QuestionEditPage />} />
        </Routes>
      </BrowserRouter>
    );

    await waitFor(() => {
      const typeSelect = screen.getByLabelText('Question Type');
      fireEvent.change(typeSelect, { target: { value: 'multiple' } });
      expect(typeSelect.value).toBe('multiple');
    });
  });

  it('adds and removes options', async () => {
    render(
      <BrowserRouter>
        <Routes>
          <Route path="/game/:gameId/question/:questionId" element={<QuestionEditPage />} />
        </Routes>
      </BrowserRouter>
    );

    await waitFor(() => {
      const addButton = screen.getByText('Add Option');
      fireEvent.click(addButton);
      expect(screen.getByPlaceholderText('Option 3')).toBeInTheDocument();

      const removeButtons = screen.getAllByText('×');
      fireEvent.click(removeButtons[0]);
      expect(screen.queryByText('Option 1')).not.toBeInTheDocument();
    });
  });

  it('saves question changes', async () => {
    axios.put.mockResolvedValueOnce({});
    
    render(
      <BrowserRouter>
        <Routes>
          <Route path="/game/:gameId/question/:questionId" element={<QuestionEditPage />} />
        </Routes>
      </BrowserRouter>
    );

    await waitFor(() => {
      const saveButton = screen.getByText('Save');
      fireEvent.click(saveButton);
      expect(axios.put).toHaveBeenCalledWith(
        '/admin/games',
        expect.any(Object),
        expect.any(Object)
      );
    });
  });

  it('handles media attachment changes', async () => {
    render(
      <BrowserRouter>
        <Routes>
          <Route path="/game/:gameId/question/:questionId" element={<QuestionEditPage />} />
        </Routes>
      </BrowserRouter>
    );

    await waitFor(() => {
      const mediaSelect = screen.getByLabelText('Media Attachment');
      fireEvent.change(mediaSelect, { target: { value: 'youtube' } });
      expect(screen.getByPlaceholderText('YouTube URL')).toBeInTheDocument();

      fireEvent.change(mediaSelect, { target: { value: 'image' } });
      expect(screen.getByPlaceholderText('Image URL')).toBeInTheDocument();
    });
  });

  it('validates required fields', async () => {
    render(
      <BrowserRouter>
        <Routes>
          <Route path="/game/:gameId/question/:questionId" element={<QuestionEditPage />} />
        </Routes>
      </BrowserRouter>
    );

    await waitFor(() => {
      const questionInput = screen.getByLabelText('Question');
      fireEvent.change(questionInput, { target: { value: '' } });
      fireEvent.click(screen.getByText('Save'));
      expect(questionInput).toBeInvalid();
    });
  });

  it('handles API errors', async () => {
    axios.get.mockRejectedValueOnce(new Error('API Error'));
    
    render(
      <BrowserRouter>
        <Routes>
          <Route path="/game/:gameId/question/:questionId" element={<QuestionEditPage />} />
        </Routes>
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Loading...')).toBeInTheDocument();
    });
  });
}); 
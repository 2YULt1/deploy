import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import axios from 'axios';
import PlayQuestionPage from '../pages/PlayQuestionPage';

jest.mock('axios');

describe('PlayQuestionPage', () => {
  const mockQuestion = {
    type: 'single',
    stem: 'Test Question',
    options: ['Option 1', 'Option 2', 'Option 3'],
    correctAnswers: [0],
    duration: 30,
    points: 10,
    mediaUrl: ''
  };

  beforeEach(() => {
    jest.clearAllMocks();
    axios.get.mockResolvedValueOnce({ data: { question: mockQuestion } });
  });

  it('renders question and options', async () => {
    render(
      <BrowserRouter>
        <Routes>
          <Route path="/play/question/:playerId" element={<PlayQuestionPage />} />
        </Routes>
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Test Question')).toBeInTheDocument();
      expect(screen.getByText('Option 1')).toBeInTheDocument();
      expect(screen.getByText('Option 2')).toBeInTheDocument();
      expect(screen.getByText('Option 3')).toBeInTheDocument();
      expect(screen.getByText('Time Left: 30s')).toBeInTheDocument();
      expect(screen.getByText('Points: 10')).toBeInTheDocument();
    });
  });

  it('handles single choice selection', async () => {
    axios.put.mockResolvedValueOnce({});
    
    render(
      <BrowserRouter>
        <Routes>
          <Route path="/play/question/:playerId" element={<PlayQuestionPage />} />
        </Routes>
      </BrowserRouter>
    );

    await waitFor(() => {
      const option1 = screen.getByText('Option 1');
      fireEvent.click(option1);
      expect(axios.put).toHaveBeenCalledWith(
        '/play/1/answer',
        { answers: [0] }
      );
    });
  });

  it('handles multiple choice selection', async () => {
    axios.get.mockResolvedValueOnce({
      data: {
        question: {
          ...mockQuestion,
          type: 'multiple',
          correctAnswers: [0, 1]
        }
      }
    });
    axios.put.mockResolvedValueOnce({});
    
    render(
      <BrowserRouter>
        <Routes>
          <Route path="/play/question/:playerId" element={<PlayQuestionPage />} />
        </Routes>
      </BrowserRouter>
    );

    await waitFor(() => {
      const option1 = screen.getByText('Option 1');
      const option2 = screen.getByText('Option 2');
      
      fireEvent.click(option1);
      fireEvent.click(option2);
      
      expect(axios.put).toHaveBeenCalledWith(
        '/play/1/answer',
        { answers: [0, 1] }
      );
    });
  });

  it('shows results when time is up', async () => {
    axios.get.mockResolvedValueOnce({
      data: {
        question: mockQuestion,
        results: {
          score: 10,
          timeTaken: 15
        }
      }
    });
    
    render(
      <BrowserRouter>
        <Routes>
          <Route path="/play/question/:playerId" element={<PlayQuestionPage />} />
        </Routes>
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Results')).toBeInTheDocument();
      expect(screen.getByText('Your score: 10')).toBeInTheDocument();
      expect(screen.getByText('Time taken: 15s')).toBeInTheDocument();
    });
  });

  it('handles media attachments', async () => {
    axios.get.mockResolvedValueOnce({
      data: {
        question: {
          ...mockQuestion,
          mediaUrl: 'https://www.youtube.com/watch?v=test123'
        }
      }
    });
    
    render(
      <BrowserRouter>
        <Routes>
          <Route path="/play/question/:playerId" element={<PlayQuestionPage />} />
        </Routes>
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByTitle('YouTube video player')).toBeInTheDocument();
    });
  });

  it('disables selection after time is up', async () => {
    axios.get.mockResolvedValueOnce({
      data: {
        question: mockQuestion,
        results: {
          score: 10,
          timeTaken: 15
        }
      }
    });
    
    render(
      <BrowserRouter>
        <Routes>
          <Route path="/play/question/:playerId" element={<PlayQuestionPage />} />
        </Routes>
      </BrowserRouter>
    );

    await waitFor(() => {
      const option1 = screen.getByText('Option 1');
      fireEvent.click(option1);
      expect(axios.put).not.toHaveBeenCalled();
    });
  });

  it('handles API errors', async () => {
    axios.get.mockRejectedValueOnce(new Error('API Error'));
    
    render(
      <BrowserRouter>
        <Routes>
          <Route path="/play/question/:playerId" element={<PlayQuestionPage />} />
        </Routes>
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Loading...')).toBeInTheDocument();
    });
  });
}); 
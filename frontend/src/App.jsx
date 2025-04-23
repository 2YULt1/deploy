// App.jsx
import { Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './pages/LoginPage.jsx';
import RegisterPage from './pages/RegisterPage.jsx';
import DashboardPage from './pages/DashboardPage.jsx';
import GameEditPage from './pages/GameEditPage.jsx';
import QuestionEditPage from './pages/QuestionEditPage.jsx';
import SessionPage from './pages/SessionPage.jsx';
import JoinPage from './pages/JoinPage.jsx';
import PlayQuestionPage from './pages/PlayQuestionPage.jsx';
import PlayResultsPage from './pages/PlayResultsPage.jsx';
import LogoutButton from './components/LogoutButton.jsx';

export default function App() {
  return (
    <>
      <LogoutButton />
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/game/:gameId" element={<GameEditPage />} />
        <Route path="/game/:gameId/question/:questionId" element={<QuestionEditPage />} />
        <Route path="/session/:sessionId" element={<SessionPage />} />
        <Route path="/play/join/:sessionId" element={<JoinPage />} />
        <Route path="/play/question/:playerId" element={<PlayQuestionPage />} />
        <Route path="/play/results/:playerId" element={<PlayResultsPage />} />
      </Routes>
    </>
  );
}

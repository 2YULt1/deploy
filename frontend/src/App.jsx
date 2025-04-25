// App.jsx
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
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
import bgImage from './assets/quiz-bg.jpg';

export default function App() {
  const location = useLocation();
  return (
    <div
      className="min-h-screen bg-cover bg-center"
      style={{ backgroundImage: `url(${bgImage})` }}
    >
      <header className="p-4 bg-black bg-opacity-50 backdrop-blur-md flex justify-between items-center">
        <h1 className="text-3xl font-extrabold text-white tracking-wide">BigBrain Quiz</h1>
        <LogoutButton />
      </header>
      <AnimatePresence mode="wait">
        <motion.div
          key={location.pathname}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.5 }}
          className="p-6"
        >
          <Routes location={location} key={location.pathname}>
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
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
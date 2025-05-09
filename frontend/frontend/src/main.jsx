import { createRoot } from 'react-dom/client'
import { createBrowserRouter, RouterProvider,Navigate } from 'react-router'
import Login from './pages/login'
import Register from './pages/register'
import Dashboard from './pages/dashboard'
import GamePage from './pages/game'
import EditQuestionPage from './pages/question'
import SessionPage from './pages/session'
import PlayerPage from './pages/game/player'
import AnswerPage from './pages/game/answerPage'

const router = createBrowserRouter([
  {
    path:'/',
    element:<Navigate to ="/dashboard" />
  },
  {
    path:'/login',
    element:<Login />
  },
  {
    path:'/register',
    element:<Register />
  },
  {
    path:'/dashboard',
    element:<Dashboard />
  },
  {
    path:'/game/:gameId',
    element:<GamePage />
  },
  {
    path:'/game/:gameId/question/:questionId', 
    element:<EditQuestionPage />
  },
  {
    path:'/session/:sessionId',
    element:< SessionPage/>
  },
  {
    path:'/play/:sessionId',
    element:<PlayerPage/>
  },
  {
    path:'/answer/:sessionId',
    element:<AnswerPage/>
  }
]);

createRoot(document.getElementById('root')).render(
  <>
    <RouterProvider router={router} />
  </>,
)

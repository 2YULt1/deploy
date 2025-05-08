import { createRoot } from 'react-dom/client'
import { createBrowserRouter, RouterProvider,Navigate } from 'react-router'
import Login from './pages/login'
import Register from './pages/register'
import Dashboard from './pages/dashboard'

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
  }
]);

createRoot(document.getElementById('root')).render(
  <>
    <RouterProvider router={router} />
  </>,
)

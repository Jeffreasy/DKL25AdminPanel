import React from 'react'
import ReactDOM from 'react-dom/client'
import { RouterProvider, createBrowserRouter } from 'react-router-dom'
import { QueryClient } from '@tanstack/react-query'
import { RootElement } from './components/RootElement'
import { routes } from './routes'
import './index.css'
import './styles/scrollbars.css'

const queryClient = new QueryClient()

const router = createBrowserRouter([
  {
    path: '/',
    element: <RootElement queryClient={queryClient} />,
    children: routes
  }
])

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>
)

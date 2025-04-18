import React, { useMemo } from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { MantineProvider } from '@mantine/core'
import { AuthProvider } from './contexts/auth/AuthProvider'
import { NavigationHistoryProvider } from './contexts/navigation/NavigationHistoryProvider'
import { FavoritesProvider } from './contexts/FavoritesContext'
import { SidebarProvider } from './contexts/SidebarContext'
import { App } from './App'
import { useTheme } from './hooks/useTheme'
import './index.css'
import './styles/scrollbars.css'
import '@mantine/tiptap/styles.css';
import '@mantine/core/styles.css';

const queryClient = new QueryClient()

function ThemedApp() {
  const { isDarkMode } = useTheme();

  return (
    <AuthProvider>
      <SidebarProvider>
        <FavoritesProvider>
          <NavigationHistoryProvider>
            <App />
          </NavigationHistoryProvider>
        </FavoritesProvider>
      </SidebarProvider>
    </AuthProvider>
  );
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <QueryClientProvider client={queryClient}>
        <MantineProvider>
          <ThemedApp />
        </MantineProvider>
      </QueryClientProvider>
    </BrowserRouter>
  </React.StrictMode>
)

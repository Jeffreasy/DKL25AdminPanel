import React, { useMemo } from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { MantineProvider, createTheme } from '@mantine/core'
import { AuthProvider } from './features/auth'
import { NavigationHistoryProvider } from './features/navigation'
import { FavoritesProvider, SidebarProvider } from './providers'
import { App } from './App'
import { useTheme } from './hooks/useTheme'
import './index.css'
import './styles/scrollbars.css'
import '@mantine/tiptap/styles.css';
import '@mantine/core/styles.css';

const queryClient = new QueryClient()

const theme = createTheme({
  primaryColor: 'indigo',
  defaultRadius: 'md',
  colors: {
    indigo: [
      '#eef2ff',
      '#e0e7ff',
      '#c7d2fe',
      '#a5b4fc',
      '#818cf8',
      '#6366f1',
      '#4f46e5',
      '#4338ca',
      '#3730a3',
      '#312e81',
    ],
  },
});

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
        <MantineProvider theme={theme} defaultColorScheme="dark">
          <ThemedApp />
        </MantineProvider>
      </QueryClientProvider>
    </BrowserRouter>
  </React.StrictMode>
)

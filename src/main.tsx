import React from 'react'
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
import '@mantine/core/styles.css';
import '@mantine/tiptap/styles.css';

const queryClient = new QueryClient()

function ThemedApp() {
  useTheme(); // Keep initializing the hook to manage HTML class

  return (
    // Revert to plain MantineProvider to fix linter errors
    <MantineProvider>
        <AuthProvider>
          <SidebarProvider>
            <FavoritesProvider>
              <NavigationHistoryProvider>
                <App />
              </NavigationHistoryProvider>
            </FavoritesProvider>
          </SidebarProvider>
        </AuthProvider>
    </MantineProvider>
  );
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      <QueryClientProvider client={queryClient}>
         <ThemedApp />
      </QueryClientProvider>
    </BrowserRouter>
  </React.StrictMode>
)

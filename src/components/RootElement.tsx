import { Outlet } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { MantineProvider } from '@mantine/core'
import { AuthProvider } from '../contexts/AuthContext'
import { SidebarProvider } from '../contexts/SidebarContext'
import { NavigationHistoryProvider } from '../contexts/NavigationHistoryContext'
import { FavoritesProvider } from '../contexts/FavoritesContext'
import { ErrorBoundary } from './ErrorBoundary'

interface RootElementProps {
queryClient: QueryClient;
}

export const RootElement = ({ queryClient }: RootElementProps) => (
<ErrorBoundary>
    <QueryClientProvider client={queryClient}>
    <MantineProvider>
    <AuthProvider>
        <SidebarProvider>
            <FavoritesProvider>
            <NavigationHistoryProvider>
                <Outlet />
            </NavigationHistoryProvider>
            </FavoritesProvider>
        </SidebarProvider>
        </AuthProvider>
    </MantineProvider>
    </QueryClientProvider>
</ErrorBoundary>
) 
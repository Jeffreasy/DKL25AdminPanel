import React from 'react';
import { AuthProvider } from '../features/auth';
import { NavigationHistoryProvider } from '../features/navigation';
import { FavoritesProvider } from './FavoritesProvider';
import { SidebarProvider } from './SidebarProvider';
import { ThemeProvider } from './ThemeProvider';

interface AppProvidersProps {
  children: React.ReactNode;
}

export const AppProviders: React.FC<AppProvidersProps> = ({ children }) => {
  return (
    <ThemeProvider>
      <AuthProvider>
        <NavigationHistoryProvider>
          <FavoritesProvider>
            <SidebarProvider>
              {children}
            </SidebarProvider>
          </FavoritesProvider>
        </NavigationHistoryProvider>
      </AuthProvider>
    </ThemeProvider>
  );
};
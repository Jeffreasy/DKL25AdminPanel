import React from 'react'
import { useTheme } from '../hooks/useTheme'

interface ThemeProviderProps {
  children: React.ReactNode
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  // Ensure theme is applied globally
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { isDarkMode } = useTheme()

  return <>{children}</>
}
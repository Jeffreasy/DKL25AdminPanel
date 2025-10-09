import { useState, useEffect, useCallback } from 'react'

export function useTheme() {
  const [isDarkMode, setIsDarkMode] = useState(() => {
    // Initialize state based on system preference and Tailwind class
    if (typeof window !== 'undefined') {
      const storedPreference = localStorage.getItem('theme'); // Optional: Add local storage persistence
      let isDark: boolean;
      if (storedPreference) {
        isDark = storedPreference === 'dark';
      } else {
        isDark = true; // Default to dark mode
      }
      // Always default to dark if no preference or if preference is light
      if (!storedPreference || storedPreference === 'light') {
        isDark = true;
      }
      // Set the class synchronously
      const root = window.document.documentElement
      if (isDark) {
        root.classList.add('dark')
      } else {
        root.classList.remove('dark')
      }
      return isDark
    }
    return false
  })

  // Effect to update HTML class and local storage
  useEffect(() => {
    const root = window.document.documentElement
    if (isDarkMode) {
      root.classList.add('dark')
      localStorage.setItem('theme', 'dark'); // Optional: Persist
    } else {
      root.classList.remove('dark')
      localStorage.setItem('theme', 'light'); // Optional: Persist
    }
  }, [isDarkMode])

  // Effect to listen for system changes
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
    const handleChange = (e: MediaQueryListEvent) => {
       // Only update if no preference is stored
       if (!localStorage.getItem('theme')) {
          setIsDarkMode(e.matches)
       }
    }

    mediaQuery.addEventListener('change', handleChange)
    return () => mediaQuery.removeEventListener('change', handleChange)
  }, [])

  const toggleTheme = useCallback(() => {
    setIsDarkMode(prev => !prev)
  }, [])

  return { isDarkMode, toggleTheme }
} 
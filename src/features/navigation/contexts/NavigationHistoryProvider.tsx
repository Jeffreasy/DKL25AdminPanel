import React, { useState, useCallback } from 'react'
import { NavigationHistoryContext } from './NavigationHistoryContext'

export const NavigationHistoryProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [history, setHistory] = useState<string[]>([])
  const [recentPages, setRecentPages] = useState<Array<{ path: string; title: string }>>([])

  const addToHistory = useCallback((title: string) => {
    const path = window.location.pathname
    setRecentPages(prev => {
      const newPage = { path, title }
      return [newPage, ...prev.filter(p => p.path !== path)].slice(0, 5)
    })
  }, [])

  const clearHistory = useCallback(() => {
    setHistory([])
    setRecentPages([])
  }, [])

  return (
    <NavigationHistoryContext.Provider value={{ history, addToHistory, clearHistory, recentPages }}>
      {children}
    </NavigationHistoryContext.Provider>
  )
} 
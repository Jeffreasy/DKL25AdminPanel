import { createContext, useContext, useState, ReactNode } from 'react'
import { useLocation } from 'react-router-dom'

interface HistoryItem {
  path: string
  title: string
  timestamp: number
}

interface NavigationHistoryContextType {
  recentPages: HistoryItem[]
  addToHistory: (title: string) => void
  clearHistory: () => void
}

const NavigationHistoryContext = createContext<NavigationHistoryContextType | undefined>(undefined)

const MAX_HISTORY_ITEMS = 5

export function NavigationHistoryProvider({ children }: { children: ReactNode }) {
  const [recentPages, setRecentPages] = useState<HistoryItem[]>([])
  const location = useLocation()

  const addToHistory = (title: string) => {
    setRecentPages(prev => {
      // Verwijder bestaande entry met dezelfde path
      const filtered = prev.filter(item => item.path !== location.pathname)
      
      // Voeg nieuwe entry toe aan het begin
      const newItem = {
        path: location.pathname,
        title,
        timestamp: Date.now()
      }
      
      // Behoud maximaal MAX_HISTORY_ITEMS
      return [newItem, ...filtered].slice(0, MAX_HISTORY_ITEMS)
    })
  }

  const clearHistory = () => {
    setRecentPages([])
  }

  return (
    <NavigationHistoryContext.Provider value={{ recentPages, addToHistory, clearHistory }}>
      {children}
    </NavigationHistoryContext.Provider>
  )
}

export function useNavigationHistory() {
  const context = useContext(NavigationHistoryContext)
  if (context === undefined) {
    throw new Error('useNavigationHistory must be used within a NavigationHistoryProvider')
  }
  return context
} 
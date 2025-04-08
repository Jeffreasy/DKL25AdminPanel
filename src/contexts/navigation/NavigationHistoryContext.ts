import { createContext } from 'react'

export interface NavigationHistoryContextType {
  history: string[]
  addToHistory: (path: string) => void
  clearHistory: () => void
  recentPages: Array<{ path: string; title: string }>
}

export const NavigationHistoryContext = createContext<NavigationHistoryContextType>({
  history: [],
  addToHistory: () => {},
  clearHistory: () => {},
  recentPages: []
}) 
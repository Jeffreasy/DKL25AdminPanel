import { createContext } from 'react'

export interface NavigationHistoryContextType {
  history: string[]
  addToHistory: (path: string) => void
  clearHistory: () => void
}

export const NavigationHistoryContext = createContext<NavigationHistoryContextType>({
  history: [],
  addToHistory: () => {},
  clearHistory: () => {}
}) 
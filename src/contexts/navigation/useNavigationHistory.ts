import { useContext } from 'react'
import { NavigationHistoryContext } from './NavigationHistoryContext'

export function useNavigationHistory() {
  const context = useContext(NavigationHistoryContext)
  if (!context) {
    throw new Error('useNavigationHistory must be used within a NavigationHistoryProvider')
  }
  return context
} 
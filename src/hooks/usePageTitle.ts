import { useEffect } from 'react'
import { useNavigationHistory } from '../contexts/NavigationHistoryContext'

export function usePageTitle(title: string) {
  const { addToHistory } = useNavigationHistory()
  
  useEffect(() => {
    document.title = title
    if (addToHistory) {
      addToHistory(title)
    }
  }, [title, addToHistory])
} 
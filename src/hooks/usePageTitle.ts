import { useEffect } from 'react'
import { useNavigationHistory } from '../contexts/navigation/useNavigationHistory'

export function usePageTitle(title: string) {
  const { addToHistory } = useNavigationHistory()
  
  useEffect(() => {
    document.title = title
    if (addToHistory) {
      addToHistory(title)
    }
  }, [title, addToHistory])
} 
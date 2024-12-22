import { useEffect } from 'react'
import { useNavigationHistory } from '../contexts/NavigationHistoryContext'

export function usePageTitle(title: string) {
  const { addToHistory } = useNavigationHistory()
  
  useEffect(() => {
    addToHistory(title)
    document.title = `DKL Admin - ${title}`
  }, [title])
} 
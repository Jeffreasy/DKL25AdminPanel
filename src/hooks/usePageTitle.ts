import { useEffect } from 'react'
import { useNavigationHistory } from '../features/navigation'

export function usePageTitle(title: string) {
  const { addToHistory } = useNavigationHistory()
  
  useEffect(() => {
    document.title = title
    if (addToHistory) {
      addToHistory(title)
    }
  }, [title, addToHistory])
} 
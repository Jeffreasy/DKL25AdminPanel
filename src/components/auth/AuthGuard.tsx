import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../contexts/hooks/useAuth'
import { LoadingSkeleton } from '../LoadingSkeleton'

interface AuthGuardProps {
  children: React.ReactNode
}

export function AuthGuard({ children }: AuthGuardProps) {
  const { isAuthenticated, isLoading } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      navigate('/login')
    }
  }, [isAuthenticated, isLoading, navigate])

  if (isLoading) {
    return <LoadingSkeleton />
  }

  if (!isAuthenticated) {
    return null
  }

  return <>{children}</>
} 
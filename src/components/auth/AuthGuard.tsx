import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../features/auth'
import { LoadingGrid } from '../ui'

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
    return <LoadingGrid variant="compact" count={4} />
  }

  if (!isAuthenticated) {
    return null
  }

  return <>{children}</>
} 
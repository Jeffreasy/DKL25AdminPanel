import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor, mockAuthContext } from '@/test/utils'
import { AuthGuard } from '../AuthGuard'
import { useAuth } from '@/features/auth'
import { useNavigate } from 'react-router-dom'

// Mock dependencies
vi.mock('@/features/auth')
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return {
    ...actual,
    useNavigate: vi.fn(),
  }
})

describe('AuthGuard', () => {
  const mockNavigate = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(useNavigate).mockReturnValue(mockNavigate)
  })

  describe('Loading State', () => {
    it('shows loading grid when loading', () => {
      vi.mocked(useAuth).mockReturnValue(mockAuthContext({
        isLoading: true,
        loading: true,
      }))

      render(
        <AuthGuard>
          <div>Protected Content</div>
        </AuthGuard>
      )

      // Should show loading, not content
      expect(screen.queryByText('Protected Content')).not.toBeInTheDocument()
    })

    it('does not navigate while loading', () => {
      vi.mocked(useAuth).mockReturnValue(mockAuthContext({
        isLoading: true,
        loading: true,
      }))

      render(
        <AuthGuard>
          <div>Protected Content</div>
        </AuthGuard>
      )

      expect(mockNavigate).not.toHaveBeenCalled()
    })
  })

  describe('Authenticated State', () => {
    it('renders children when authenticated', () => {
      vi.mocked(useAuth).mockReturnValue(mockAuthContext({
        isAuthenticated: true,
        user: { id: '1', email: 'test@example.com' } as { id: string; email: string },
      }))

      render(
        <AuthGuard>
          <div>Protected Content</div>
        </AuthGuard>
      )

      expect(screen.getByText('Protected Content')).toBeInTheDocument()
    })

    it('does not navigate when authenticated', () => {
      vi.mocked(useAuth).mockReturnValue(mockAuthContext({
        isAuthenticated: true,
        user: { id: '1', email: 'test@example.com' } as { id: string; email: string },
      }))

      render(
        <AuthGuard>
          <div>Protected Content</div>
        </AuthGuard>
      )

      expect(mockNavigate).not.toHaveBeenCalled()
    })
  })

  describe('Unauthenticated State', () => {
    it('does not render children when not authenticated', () => {
      vi.mocked(useAuth).mockReturnValue(mockAuthContext({
        isAuthenticated: false,
      }))

      render(
        <AuthGuard>
          <div>Protected Content</div>
        </AuthGuard>
      )

      expect(screen.queryByText('Protected Content')).not.toBeInTheDocument()
    })

    it('navigates to login when not authenticated', async () => {
      vi.mocked(useAuth).mockReturnValue(mockAuthContext({
        isAuthenticated: false,
      }))

      render(
        <AuthGuard>
          <div>Protected Content</div>
        </AuthGuard>
      )

      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith('/login')
      })
    })

    it('navigates only once', async () => {
      vi.mocked(useAuth).mockReturnValue(mockAuthContext({
        isAuthenticated: false,
      }))

      render(
        <AuthGuard>
          <div>Protected Content</div>
        </AuthGuard>
      )

      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledTimes(1)
      })
    })
  })

  describe('State Transitions', () => {
    it('handles loading to authenticated transition', async () => {
      const { rerender } = render(
        <AuthGuard>
          <div>Protected Content</div>
        </AuthGuard>
      )

      // Start with loading
      vi.mocked(useAuth).mockReturnValue(mockAuthContext({
        isLoading: true,
        loading: true,
      }))

      rerender(
        <AuthGuard>
          <div>Protected Content</div>
        </AuthGuard>
      )

      // Transition to authenticated
      vi.mocked(useAuth).mockReturnValue(mockAuthContext({
        isAuthenticated: true,
        user: { id: '1', email: 'test@example.com' } as { id: string; email: string },
      }))

      rerender(
        <AuthGuard>
          <div>Protected Content</div>
        </AuthGuard>
      )

      expect(screen.getByText('Protected Content')).toBeInTheDocument()
    })

    it('handles loading to unauthenticated transition', async () => {
      const { rerender } = render(
        <AuthGuard>
          <div>Protected Content</div>
        </AuthGuard>
      )

      // Start with loading
      vi.mocked(useAuth).mockReturnValue(mockAuthContext({
        isLoading: true,
        loading: true,
      }))

      rerender(
        <AuthGuard>
          <div>Protected Content</div>
        </AuthGuard>
      )

      // Transition to unauthenticated
      vi.mocked(useAuth).mockReturnValue(mockAuthContext({
        isAuthenticated: false,
      }))

      rerender(
        <AuthGuard>
          <div>Protected Content</div>
        </AuthGuard>
      )

      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith('/login')
      })
    })
  })
})
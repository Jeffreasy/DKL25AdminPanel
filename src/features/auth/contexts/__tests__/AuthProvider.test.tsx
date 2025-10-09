import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import { useState } from 'react'
import { AuthProvider } from '../AuthProvider'
import { useAuth } from '../../hooks/useAuth'
import { authManager } from '@/api/client/auth'

// Mock dependencies
vi.mock('@/api/client/auth', () => ({
  authManager: {
    setToken: vi.fn(),
  },
}))

// Mock fetch
const mockFetch = vi.fn()
global.fetch = mockFetch

// Test component that uses useAuth
function TestComponent() {
  const auth = useAuth()
  return (
    <div>
      <div data-testid="loading">{auth.loading ? 'loading' : 'not-loading'}</div>
      <div data-testid="authenticated">{auth.isAuthenticated ? 'authenticated' : 'not-authenticated'}</div>
      <div data-testid="user">{auth.user ? auth.user.email : 'no-user'}</div>
      {auth.error && <div data-testid="error">{auth.error.message}</div>}
    </div>
  )
}

describe('AuthProvider', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    localStorage.clear()
    // Mock window.location.href
    delete (window as any).location
    window.location = { href: '' } as any
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  describe('Initial State', () => {
    it('starts with loading state when no token exists', async () => {
      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      )

      await waitFor(() => {
        expect(screen.getByTestId('loading')).toHaveTextContent('not-loading')
      })
      expect(screen.getByTestId('authenticated')).toHaveTextContent('not-authenticated')
      expect(screen.getByTestId('user')).toHaveTextContent('no-user')
    })
  })

  describe('Login', () => {
    it('handles login with valid credentials', async () => {
      mockFetch
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({
            token: 'new-token',
            refresh_token: 'refresh-token',
            user: { id: '1', email: 'test@example.com' },
          }),
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({
            id: '1',
            email: 'test@example.com',
            rol: 'admin',
            naam: 'Test User',
            permissions: [{ resource: 'users', action: 'read' }],
          }),
        })

      const TestLogin = () => {
        const { login } = useAuth()
        const [result, setResult] = useState<any>(null)
        
        return (
          <div>
            <button onClick={async () => {
              const res = await login?.('test@example.com', 'password')
              setResult(res)
            }}>
              Login
            </button>
            {result && <div data-testid="result">{result.success ? 'success' : result.error}</div>}
            <TestComponent />
          </div>
        )
      }

      render(
        <AuthProvider>
          <TestLogin />
        </AuthProvider>
      )

      const loginButton = screen.getByText('Login')
      loginButton.click()

      await waitFor(() => {
        expect(screen.getByTestId('authenticated')).toHaveTextContent('authenticated')
      }, { timeout: 3000 })
    })
  })

  describe('Logout', () => {
    it('clears user data and redirects to login', async () => {
      localStorage.setItem('jwtToken', 'token')
      localStorage.setItem('refreshToken', 'refresh')
      localStorage.setItem('userId', '1')

      // Mock refresh token endpoint to prevent unhandled errors
      mockFetch.mockResolvedValue({
        ok: false,
        status: 401,
        json: async () => ({ error: 'Unauthorized' }),
      })

      const TestLogout = () => {
        const { logout } = useAuth()
        return (
          <div>
            <button onClick={logout}>Logout</button>
            <TestComponent />
          </div>
        )
      }

      render(
        <AuthProvider>
          <TestLogout />
        </AuthProvider>
      )

      // Wait for initial auth check to complete
      await waitFor(() => {
        expect(screen.getByTestId('loading')).toHaveTextContent('not-loading')
      })

      const logoutButton = screen.getByText('Logout')
      logoutButton.click()

      await waitFor(() => {
        expect(localStorage.getItem('jwtToken')).toBeNull()
        expect(localStorage.getItem('refreshToken')).toBeNull()
        expect(localStorage.getItem('userId')).toBeNull()
      })

      expect(window.location.href).toBe('/login')
    })
  })

  describe('SignIn/SignOut Aliases', () => {
    it('signOut calls logout', async () => {
      const TestSignOut = () => {
        const { signOut } = useAuth()
        return (
          <button onClick={signOut}>Sign Out</button>
        )
      }

      render(
        <AuthProvider>
          <TestSignOut />
        </AuthProvider>
      )

      const button = screen.getByText('Sign Out')
      button.click()

      await waitFor(() => {
        expect(window.location.href).toBe('/login')
      })
    })
  })

  describe('Context Values', () => {
    it('provides all required auth methods', () => {
      const TestMethods = () => {
        const auth = useAuth()
        return (
          <div>
            <div data-testid="has-signin">{typeof auth.signIn === 'function' ? 'yes' : 'no'}</div>
            <div data-testid="has-signout">{typeof auth.signOut === 'function' ? 'yes' : 'no'}</div>
            <div data-testid="has-logout">{typeof auth.logout === 'function' ? 'yes' : 'no'}</div>
            <div data-testid="has-login">{typeof auth.login === 'function' ? 'yes' : 'no'}</div>
          </div>
        )
      }

      render(
        <AuthProvider>
          <TestMethods />
        </AuthProvider>
      )

      expect(screen.getByTestId('has-signin')).toHaveTextContent('yes')
      expect(screen.getByTestId('has-signout')).toHaveTextContent('yes')
      expect(screen.getByTestId('has-logout')).toHaveTextContent('yes')
      expect(screen.getByTestId('has-login')).toHaveTextContent('yes')
    })
  })
})
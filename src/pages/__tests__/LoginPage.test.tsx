import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import { LoginPage } from '../LoginPage'

const mockLogin = vi.fn()
const mockNavigate = vi.fn()

vi.mock('../../features/auth', () => ({
  useAuth: vi.fn()
}))

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return {
    ...actual,
    useNavigate: () => mockNavigate
  }
})

import { useAuth } from '../../features/auth'

describe('LoginPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(useAuth).mockReturnValue({
      user: null,
      loading: false,
      error: null,
      isAuthenticated: false,
      isLoading: false,
      signIn: vi.fn(),
      signOut: vi.fn(),
      logout: vi.fn(),
      login: mockLogin
    })
  })

  const renderPage = () => {
    return render(
      <BrowserRouter>
        <LoginPage />
      </BrowserRouter>
    )
  }

  describe('Rendering', () => {
    it('renders login form', () => {
      renderPage()
      
      expect(screen.getByText('Welkom Terug')).toBeInTheDocument()
      expect(screen.getByText('Log in op het DKL25 Admin Panel')).toBeInTheDocument()
    })

    it('renders logo', () => {
      renderPage()
      
      const logo = screen.getByRole('img', { name: 'DKL25 Logo' })
      expect(logo).toBeInTheDocument()
    })

    it('renders email input', () => {
      renderPage()
      
      expect(screen.getByLabelText('Email')).toBeInTheDocument()
    })

    it('renders password input', () => {
      renderPage()
      
      expect(screen.getByLabelText('Wachtwoord')).toBeInTheDocument()
    })

    it('renders submit button', () => {
      renderPage()
      
      expect(screen.getByRole('button', { name: 'Inloggen' })).toBeInTheDocument()
    })

    it('renders help text', () => {
      renderPage()
      
      expect(screen.getByText(/Problemen met inloggen/)).toBeInTheDocument()
    })

    it('renders copyright notice', () => {
      renderPage()
      
      const currentYear = new Date().getFullYear()
      expect(screen.getByText(new RegExp(`© ${currentYear}`))).toBeInTheDocument()
    })
  })

  describe('Login Functionality', () => {
    it('calls login with full email', async () => {
      mockLogin.mockResolvedValue({ success: true })
      
      renderPage()
      
      fireEvent.change(screen.getByLabelText('Email'), {
        target: { value: 'test@example.com' }
      })
      fireEvent.change(screen.getByLabelText('Wachtwoord'), {
        target: { value: 'password123' }
      })
      
      fireEvent.click(screen.getByRole('button', { name: 'Inloggen' }))
      
      await waitFor(() => {
        expect(mockLogin).toHaveBeenCalledWith('test@example.com', 'password123')
      })
    })

    it('adds domain to username-only input', async () => {
      mockLogin.mockResolvedValue({ success: true })
      
      renderPage()
      
      fireEvent.change(screen.getByLabelText('Email'), {
        target: { value: 'admin' }
      })
      fireEvent.change(screen.getByLabelText('Wachtwoord'), {
        target: { value: 'password123' }
      })
      
      fireEvent.click(screen.getByRole('button', { name: 'Inloggen' }))
      
      await waitFor(() => {
        expect(mockLogin).toHaveBeenCalledWith('admin@dekoninklijkeloop.nl', 'password123')
      })
    })

    it('navigates to dashboard on successful login', async () => {
      mockLogin.mockResolvedValue({ success: true })
      
      renderPage()
      
      fireEvent.change(screen.getByLabelText('Email'), {
        target: { value: 'test@example.com' }
      })
      fireEvent.change(screen.getByLabelText('Wachtwoord'), {
        target: { value: 'password123' }
      })
      
      fireEvent.click(screen.getByRole('button', { name: 'Inloggen' }))
      
      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith('/')
      })
    })

    it('shows error on failed login', async () => {
      mockLogin.mockResolvedValue({ success: false, error: 'Invalid credentials' })
      
      renderPage()
      
      fireEvent.change(screen.getByLabelText('Email'), {
        target: { value: 'test@example.com' }
      })
      fireEvent.change(screen.getByLabelText('Wachtwoord'), {
        target: { value: 'wrongpassword' }
      })
      
      fireEvent.click(screen.getByRole('button', { name: 'Inloggen' }))
      
      await waitFor(() => {
        expect(screen.getByText('Invalid credentials')).toBeInTheDocument()
      })
    })
  })

  describe('Password Visibility Toggle', () => {
    it('toggles password visibility', () => {
      renderPage()
      
      const passwordInput = screen.getByLabelText('Wachtwoord') as HTMLInputElement
      expect(passwordInput.type).toBe('password')
      
      const toggleButton = screen.getByRole('button', { name: '' })
      fireEvent.click(toggleButton)
      
      expect(passwordInput.type).toBe('text')
      
      fireEvent.click(toggleButton)
      expect(passwordInput.type).toBe('password')
    })
  })

  describe('Loading State', () => {
    it('disables inputs when loading', () => {
      vi.mocked(useAuth).mockReturnValue({
        user: null,
        loading: false,
        error: null,
        isAuthenticated: false,
        isLoading: true,
        signIn: vi.fn(),
        signOut: vi.fn(),
        logout: vi.fn(),
        login: mockLogin
      })
      
      renderPage()
      
      expect(screen.getByLabelText('Email')).toBeDisabled()
      expect(screen.getByLabelText('Wachtwoord')).toBeDisabled()
    })

    it('shows loading text on submit button', () => {
      vi.mocked(useAuth).mockReturnValue({
        user: null,
        loading: false,
        error: null,
        isAuthenticated: false,
        isLoading: true,
        signIn: vi.fn(),
        signOut: vi.fn(),
        logout: vi.fn(),
        login: mockLogin
      })
      
      renderPage()
      
      expect(screen.getByText('Bezig met inloggen...')).toBeInTheDocument()
    })
  })

  describe('Error Display', () => {
    it('displays auth error from context', () => {
      vi.mocked(useAuth).mockReturnValue({
        user: null,
        loading: false,
        error: new Error('Auth error from context'),
        isAuthenticated: false,
        isLoading: false,
        signIn: vi.fn(),
        signOut: vi.fn(),
        logout: vi.fn(),
        login: mockLogin
      })
      
      renderPage()
      
      expect(screen.getByText('Auth error from context')).toBeInTheDocument()
    })
  })
})
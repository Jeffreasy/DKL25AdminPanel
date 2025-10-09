import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import { UserMenu } from '../UserMenu'
import { useAuth } from '@/features/auth'

vi.mock('@/features/auth')

describe('UserMenu', () => {
  const mockLogout = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
  })

  const renderUserMenu = (user: any = null) => {
    vi.mocked(useAuth).mockReturnValue({
      user,
      logout: mockLogout,
      loading: false,
      error: null,
      signIn: vi.fn(),
      signOut: vi.fn(),
      isAuthenticated: !!user,
      isLoading: false,
      login: vi.fn(),
      loadUserProfile: vi.fn(),
      refreshToken: vi.fn(),
    })

    return render(
      <BrowserRouter>
        <UserMenu />
      </BrowserRouter>
    )
  }

  it('returns null when no user', () => {
    const { container } = renderUserMenu(null)
    expect(container.firstChild).toBeNull()
  })

  it('displays user email when no full name', () => {
    renderUserMenu({
      id: '1',
      email: 'test@example.com',
      role: 'user',
      permissions: [],
    })

    expect(screen.getByText('test')).toBeInTheDocument()
  })

  it('displays full name when available', () => {
    renderUserMenu({
      id: '1',
      email: 'test@example.com',
      role: 'user',
      permissions: [],
      user_metadata: { full_name: 'Test User' },
    })

    expect(screen.getByText('Test User')).toBeInTheDocument()
  })

  it('displays user avatar when available', () => {
    renderUserMenu({
      id: '1',
      email: 'test@example.com',
      role: 'user',
      permissions: [],
      user_metadata: {
        full_name: 'Test User',
        avatar_url: 'https://example.com/avatar.jpg',
      },
    })

    const avatar = screen.getByAltText('Test User')
    expect(avatar).toBeInTheDocument()
    expect(avatar).toHaveAttribute('src', 'https://example.com/avatar.jpg')
  })

  it('shows default icon when no avatar', () => {
    renderUserMenu({
      id: '1',
      email: 'test@example.com',
      role: 'user',
      permissions: [],
    })

    const icon = document.querySelector('svg')
    expect(icon).toBeInTheDocument()
  })

  it('opens menu on button click', () => {
    renderUserMenu({
      id: '1',
      email: 'test@example.com',
      role: 'user',
      permissions: [],
    })

    const button = screen.getByRole('button')
    fireEvent.click(button)

    expect(screen.getByText('Profiel')).toBeInTheDocument()
    expect(screen.getByText('Instellingen')).toBeInTheDocument()
    expect(screen.getByText('Uitloggen')).toBeInTheDocument()
  })

  it('calls logout when logout button clicked', async () => {
    renderUserMenu({
      id: '1',
      email: 'test@example.com',
      role: 'user',
      permissions: [],
    })

    const button = screen.getByRole('button')
    fireEvent.click(button)

    const logoutButton = screen.getByText('Uitloggen')
    fireEvent.click(logoutButton)

    expect(mockLogout).toHaveBeenCalled()
  })

  it('handles logout errors gracefully', async () => {
    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
    mockLogout.mockRejectedValue(new Error('Logout failed'))

    renderUserMenu({
      id: '1',
      email: 'test@example.com',
      role: 'user',
      permissions: [],
    })

    const button = screen.getByRole('button')
    fireEvent.click(button)

    const logoutButton = screen.getByText('Uitloggen')
    fireEvent.click(logoutButton)

    await vi.waitFor(() => {
      expect(consoleErrorSpy).toHaveBeenCalled()
    })

    consoleErrorSpy.mockRestore()
  })

  it('has links to profile and settings', () => {
    renderUserMenu({
      id: '1',
      email: 'test@example.com',
      role: 'user',
      permissions: [],
    })

    const button = screen.getByRole('button')
    fireEvent.click(button)

    const profileLink = screen.getByText('Profiel').closest('a')
    const settingsLink = screen.getByText('Instellingen').closest('a')

    expect(profileLink).toHaveAttribute('href', '/profile')
    expect(settingsLink).toHaveAttribute('href', '/settings')
  })
})
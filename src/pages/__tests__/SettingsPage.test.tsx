import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { SettingsPage } from '../SettingsPage'

// Mock useTheme hook
const mockToggleTheme = vi.fn()
vi.mock('../../hooks/useTheme', () => ({
  useTheme: vi.fn(() => ({
    isDarkMode: false,
    toggleTheme: mockToggleTheme
  }))
}))

import { useTheme } from '../../hooks/useTheme'

describe('SettingsPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(useTheme).mockReturnValue({
      isDarkMode: false,
      toggleTheme: mockToggleTheme
    })
  })

  describe('Rendering', () => {
    it('renders settings page title', () => {
      render(<SettingsPage />)
      
      expect(screen.getByText('Instellingen')).toBeInTheDocument()
    })

    it('renders dark mode toggle', () => {
      render(<SettingsPage />)
      
      expect(screen.getByText('Dark Mode')).toBeInTheDocument()
      expect(screen.getByText('Schakel tussen licht en donker thema')).toBeInTheDocument()
    })

    it('renders notifications section', () => {
      render(<SettingsPage />)
      
      expect(screen.getByText('Notificaties')).toBeInTheDocument()
      expect(screen.getByText('Notificatie instellingen komen binnenkort beschikbaar')).toBeInTheDocument()
    })

    it('renders language section', () => {
      render(<SettingsPage />)
      
      expect(screen.getByText('Taal')).toBeInTheDocument()
      expect(screen.getByText('Taal instellingen komen binnenkort beschikbaar')).toBeInTheDocument()
    })
  })

  describe('Dark Mode Toggle', () => {
    it('shows toggle switch', () => {
      const { container } = render(<SettingsPage />)
      
      const toggle = container.querySelector('[role="switch"]')
      expect(toggle).toBeInTheDocument()
    })

    it('calls toggleTheme when switch is clicked', () => {
      const { container } = render(<SettingsPage />)
      
      const toggle = container.querySelector('[role="switch"]')
      if (toggle) {
        fireEvent.click(toggle)
      }
      
      expect(mockToggleTheme).toHaveBeenCalled()
    })

    it('shows success message after theme change', async () => {
      const { container } = render(<SettingsPage />)
      
      const toggle = container.querySelector('[role="switch"]')
      if (toggle) {
        fireEvent.click(toggle)
      }
      
      await waitFor(() => {
        expect(screen.getByText('Thema succesvol bijgewerkt')).toBeInTheDocument()
      })
    })

    it('reflects dark mode state in toggle', () => {
      vi.mocked(useTheme).mockReturnValue({
        isDarkMode: true,
        toggleTheme: mockToggleTheme
      })
      
      const { container } = render(<SettingsPage />)
      
      const toggle = container.querySelector('[role="switch"]')
      expect(toggle).toHaveAttribute('data-headlessui-state', 'checked')
    })
  })

  describe('Layout', () => {
    it('renders in a card layout', () => {
      const { container } = render(<SettingsPage />)
      
      expect(container.querySelector('.bg-white')).toBeInTheDocument()
      expect(container.querySelector('.shadow')).toBeInTheDocument()
    })

    it('has proper spacing and padding', () => {
      const { container } = render(<SettingsPage />)
      
      const card = container.querySelector('.px-4')
      expect(card).toBeInTheDocument()
    })
  })
})
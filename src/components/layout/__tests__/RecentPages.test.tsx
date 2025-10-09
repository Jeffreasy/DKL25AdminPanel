import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import { RecentPages } from '../RecentPages'

const mockClearHistory = vi.fn()
const mockRecentPages = [
  { path: '/dashboard', title: 'Dashboard' },
  { path: '/photos', title: 'Photos' },
  { path: '/albums', title: 'Albums' },
]

vi.mock('../../../features/navigation', () => ({
  useNavigationHistory: () => ({
    recentPages: mockRecentPages,
    clearHistory: mockClearHistory,
  }),
}))

describe('RecentPages', () => {
  const renderRecentPages = () => {
    return render(
      <BrowserRouter>
        <RecentPages />
      </BrowserRouter>
    )
  }

  describe('Rendering', () => {
    it('renders recent pages section', () => {
      renderRecentPages()
      
      expect(screen.getByText('Recent bezocht')).toBeInTheDocument()
    })

    it('renders all recent pages', () => {
      renderRecentPages()
      
      expect(screen.getByText('Dashboard')).toBeInTheDocument()
      expect(screen.getByText('Photos')).toBeInTheDocument()
      expect(screen.getByText('Albums')).toBeInTheDocument()
    })

    it('shows clock icon', () => {
      renderRecentPages()
      
      const icons = document.querySelectorAll('svg')
      expect(icons.length).toBeGreaterThan(0)
    })

    it('shows clear history button', () => {
      renderRecentPages()
      
      const clearButton = screen.getByLabelText('Geschiedenis wissen')
      expect(clearButton).toBeInTheDocument()
    })
  })

  describe('Navigation', () => {
    it('renders links to recent pages', () => {
      renderRecentPages()
      
      const dashboardLink = screen.getByText('Dashboard').closest('a')
      expect(dashboardLink).toHaveAttribute('href', '/dashboard')
    })

    it('renders correct paths for all pages', () => {
      renderRecentPages()
      
      const photosLink = screen.getByText('Photos').closest('a')
      expect(photosLink).toHaveAttribute('href', '/photos')
      
      const albumsLink = screen.getByText('Albums').closest('a')
      expect(albumsLink).toHaveAttribute('href', '/albums')
    })
  })

  describe('Clear History', () => {
    it('calls clearHistory on button click', () => {
      renderRecentPages()
      
      const clearButton = screen.getByLabelText('Geschiedenis wissen')
      clearButton.click()
      
      expect(mockClearHistory).toHaveBeenCalled()
    })
  })
})
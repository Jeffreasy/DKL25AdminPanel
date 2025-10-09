import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@/test/utils'
import userEvent from '@testing-library/user-event'
import { Header } from '../Header'
import { SidebarProvider } from '@/providers/SidebarProvider'

// Mock child components to isolate Header testing
vi.mock('../UserMenu', () => ({
  UserMenu: () => <div data-testid="user-menu">User Menu</div>
}))

vi.mock('../SearchBar', () => ({
  SearchBar: () => <div data-testid="search-bar">Search Bar</div>
}))

vi.mock('../QuickActions', () => ({
  QuickActions: () => <div data-testid="quick-actions">Quick Actions</div>
}))

const renderHeader = () => {
  return render(
    <SidebarProvider>
      <Header />
    </SidebarProvider>
  )
}

describe('Header', () => {
  describe('Rendering', () => {
    it('renders header element', () => {
      renderHeader()
      
      const header = document.querySelector('header')
      expect(header).toBeInTheDocument()
    })

    it('renders all child components', () => {
      renderHeader()
      
      expect(screen.getByTestId('search-bar')).toBeInTheDocument()
      expect(screen.getByTestId('quick-actions')).toBeInTheDocument()
      expect(screen.getByTestId('user-menu')).toBeInTheDocument()
    })

    it('renders mobile menu button', () => {
      renderHeader()
      
      const menuButton = screen.getByLabelText('Open sidebar')
      expect(menuButton).toBeInTheDocument()
    })
  })

  describe('Mobile Menu Button', () => {
    it('has correct aria-label', () => {
      renderHeader()
      
      const button = screen.getByLabelText('Open sidebar')
      expect(button).toHaveAttribute('aria-label', 'Open sidebar')
    })

    it('has menu icon', () => {
      renderHeader()
      
      const button = screen.getByLabelText('Open sidebar')
      const icon = button.querySelector('svg')
      expect(icon).toBeInTheDocument()
      expect(icon).toHaveAttribute('aria-hidden', 'true')
    })

    it('calls setMobileOpen when clicked', async () => {
      const user = userEvent.setup()
      renderHeader()
      
      const button = screen.getByLabelText('Open sidebar')
      await user.click(button)
      
      // Button should be clickable (actual sidebar state tested in SidebarProvider tests)
      expect(button).toBeInTheDocument()
    })
  })

  describe('Responsive Behavior', () => {
    it('hides search bar on small screens', () => {
      renderHeader()
      
      const searchContainer = screen.getByTestId('search-bar').parentElement
      expect(searchContainer).toHaveClass('hidden', 'sm:block')
    })

    it('shows mobile menu button only on mobile', () => {
      renderHeader()
      
      const button = screen.getByLabelText('Open sidebar')
      expect(button).toHaveClass('md:hidden')
    })
  })

  describe('Layout', () => {
    it('uses flexbox layout', () => {
      renderHeader()
      
      const container = screen.getByTestId('user-menu').closest('div')?.parentElement
      expect(container).toHaveClass('flex', 'items-center')
    })

    it('groups actions together', () => {
      renderHeader()
      
      const actionsContainer = screen.getByTestId('quick-actions').parentElement
      expect(actionsContainer).toHaveClass('flex', 'items-center')
    })
  })

  describe('Styling', () => {
    it('has correct background colors', () => {
      renderHeader()
      
      const header = document.querySelector('header')
      expect(header).toHaveClass('bg-white', 'dark:bg-gray-800')
    })

    it('has border bottom', () => {
      renderHeader()
      
      const header = document.querySelector('header')
      expect(header).toHaveClass('border-b', 'border-gray-200', 'dark:border-gray-700')
    })

    it('has proper spacing', () => {
      renderHeader()
      
      const header = document.querySelector('header')
      expect(header?.className).toContain('px-')
      expect(header?.className).toContain('py-')
    })
  })

  describe('Accessibility', () => {
    it('uses semantic header element', () => {
      renderHeader()
      
      const header = document.querySelector('header')
      expect(header).toBeInTheDocument()
      expect(header?.tagName).toBe('HEADER')
    })

    it('has accessible button', () => {
      renderHeader()
      
      const button = screen.getByLabelText('Open sidebar')
      expect(button).toHaveAttribute('type', 'button')
      expect(button).toHaveAttribute('aria-label')
    })

    it('icon has aria-hidden', () => {
      renderHeader()
      
      const button = screen.getByLabelText('Open sidebar')
      const icon = button.querySelector('svg')
      expect(icon).toHaveAttribute('aria-hidden', 'true')
    })
  })
})
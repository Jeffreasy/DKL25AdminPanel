import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import { AccessDeniedPage } from '../AccessDeniedPage'

const mockNavigate = vi.fn()

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return {
    ...actual,
    useNavigate: () => mockNavigate
  }
})

describe('AccessDeniedPage', () => {
  const renderPage = () => {
    return render(
      <BrowserRouter>
        <AccessDeniedPage />
      </BrowserRouter>
    )
  }

  beforeEach(() => {
    mockNavigate.mockClear()
  })

  describe('Rendering', () => {
    it('renders access denied heading', () => {
      renderPage()
      
      expect(screen.getByText('Geen Toegang')).toBeInTheDocument()
    })

    it('renders error message', () => {
      renderPage()
      
      expect(screen.getByText(/Je hebt geen toestemming/)).toBeInTheDocument()
      expect(screen.getByText(/Neem contact op met een beheerder/)).toBeInTheDocument()
    })

    it('renders warning icon', () => {
      const { container } = renderPage()
      
      const icon = container.querySelector('svg')
      expect(icon).toBeInTheDocument()
      expect(icon).toHaveClass('w-12', 'h-12')
    })

    it('renders go back button', () => {
      renderPage()
      
      expect(screen.getByText('Ga Terug')).toBeInTheDocument()
    })
  })

  describe('Navigation', () => {
    it('navigates back when button is clicked', () => {
      renderPage()
      
      const button = screen.getByText('Ga Terug')
      fireEvent.click(button)
      
      expect(mockNavigate).toHaveBeenCalledWith(-1)
    })
  })

  describe('Layout', () => {
    it('centers content on screen', () => {
      const { container } = renderPage()
      
      const wrapper = container.querySelector('.min-h-screen')
      expect(wrapper).toHaveClass('flex', 'items-center', 'justify-center')
    })

    it('renders in a card layout', () => {
      const { container } = renderPage()
      
      expect(container.querySelector('.bg-white')).toBeInTheDocument()
      expect(container.querySelector('.shadow-lg')).toBeInTheDocument()
      expect(container.querySelector('.rounded-lg')).toBeInTheDocument()
    })

    it('has proper icon styling', () => {
      const { container } = renderPage()
      
      const iconWrapper = container.querySelector('.bg-red-100')
      expect(iconWrapper).toBeInTheDocument()
      expect(iconWrapper).toHaveClass('rounded-full', 'p-4')
    })
  })
})
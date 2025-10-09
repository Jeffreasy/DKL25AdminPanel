import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import { NotFoundPage } from '../NotFoundPage'

describe('NotFoundPage', () => {
  const renderPage = () => {
    return render(
      <BrowserRouter>
        <NotFoundPage />
      </BrowserRouter>
    )
  }

  describe('Rendering', () => {
    it('renders 404 heading', () => {
      renderPage()
      
      expect(screen.getByText('404')).toBeInTheDocument()
    })

    it('renders error message', () => {
      renderPage()
      
      expect(screen.getByText('Pagina niet gevonden')).toBeInTheDocument()
    })

    it('renders link to dashboard', () => {
      renderPage()
      
      const link = screen.getByText('Terug naar Dashboard')
      expect(link).toBeInTheDocument()
      expect(link).toHaveAttribute('href', '/')
    })
  })

  describe('Layout', () => {
    it('centers content on screen', () => {
      const { container } = renderPage()
      
      const wrapper = container.querySelector('.min-h-screen')
      expect(wrapper).toHaveClass('flex', 'items-center', 'justify-center')
    })

    it('has proper styling', () => {
      const { container } = renderPage()
      
      expect(container.querySelector('.text-6xl')).toBeInTheDocument()
      expect(container.querySelector('.font-bold')).toBeInTheDocument()
    })
  })
})
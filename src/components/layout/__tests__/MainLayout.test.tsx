import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import { MainLayout } from '../MainLayout'

// Mock child components
vi.mock('../Sidebar', () => ({
  Sidebar: () => <div data-testid="sidebar">Sidebar</div>,
}))

vi.mock('../Header', () => ({
  Header: () => <div data-testid="header">Header</div>,
}))

vi.mock('../../../features/chat/components/ChatLayout', () => ({
  ChatLayout: ({ isOpen, onClose }: any) => (
    isOpen ? (
      <div data-testid="chat-layout">
        <button onClick={onClose}>Close Chat</button>
      </div>
    ) : null
  ),
}))

describe('MainLayout', () => {
  const renderMainLayout = () => {
    return render(
      <BrowserRouter>
        <MainLayout />
      </BrowserRouter>
    )
  }

  describe('Rendering', () => {
    it('renders main layout structure', () => {
      renderMainLayout()
      
      expect(screen.getByTestId('sidebar')).toBeInTheDocument()
      expect(screen.getByTestId('header')).toBeInTheDocument()
    })

    it('renders main content area', () => {
      const { container } = renderMainLayout()
      
      const main = container.querySelector('main')
      expect(main).toBeInTheDocument()
    })

    it('renders chat button', () => {
      renderMainLayout()
      
      const chatButton = screen.getByLabelText('Open Team Chat')
      expect(chatButton).toBeInTheDocument()
    })

    it('shows chat icon', () => {
      renderMainLayout()
      
      const icons = document.querySelectorAll('svg')
      expect(icons.length).toBeGreaterThan(0)
    })

    it('renders modal root', () => {
      const { container } = renderMainLayout()
      
      const modalRoot = container.querySelector('#mantine-modal-root')
      expect(modalRoot).toBeInTheDocument()
    })
  })

  describe('Chat Functionality', () => {
    it('opens chat on button click', () => {
      renderMainLayout()
      
      const chatButton = screen.getByLabelText('Open Team Chat')
      fireEvent.click(chatButton)
      
      expect(screen.getByTestId('chat-layout')).toBeInTheDocument()
    })

    it('closes chat on close button click', () => {
      renderMainLayout()
      
      const chatButton = screen.getByLabelText('Open Team Chat')
      fireEvent.click(chatButton)
      
      expect(screen.getByTestId('chat-layout')).toBeInTheDocument()
      
      const closeButton = screen.getByText('Close Chat')
      fireEvent.click(closeButton)
      
      expect(screen.queryByTestId('chat-layout')).not.toBeInTheDocument()
    })

    it('toggles chat multiple times', () => {
      renderMainLayout()
      
      const chatButton = screen.getByLabelText('Open Team Chat')
      
      // Open
      fireEvent.click(chatButton)
      expect(screen.getByTestId('chat-layout')).toBeInTheDocument()
      
      // Close
      const closeButton = screen.getByText('Close Chat')
      fireEvent.click(closeButton)
      expect(screen.queryByTestId('chat-layout')).not.toBeInTheDocument()
      
      // Open again
      fireEvent.click(chatButton)
      expect(screen.getByTestId('chat-layout')).toBeInTheDocument()
    })
  })

  describe('Layout Structure', () => {
    it('has correct flex layout', () => {
      const { container } = renderMainLayout()
      
      const flexContainer = container.querySelector('.flex')
      expect(flexContainer).toBeInTheDocument()
    })

    it('applies dark mode classes', () => {
      const { container } = renderMainLayout()
      
      const root = container.querySelector('.dark\\:bg-gray-900')
      expect(root).toBeInTheDocument()
    })
  })
})
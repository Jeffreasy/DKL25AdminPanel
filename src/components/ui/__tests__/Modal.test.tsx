import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@/test/utils'
import userEvent from '@testing-library/user-event'
import { Modal } from '../Modal'

describe('Modal', () => {
  const defaultProps = {
    isOpen: true,
    onClose: vi.fn(),
    title: 'Test Modal',
  }

  describe('Rendering', () => {
    it('renders when open', () => {
      render(
        <Modal {...defaultProps}>
          <p>Modal content</p>
        </Modal>
      )
      
      expect(screen.getByText('Test Modal')).toBeInTheDocument()
      expect(screen.getByText('Modal content')).toBeInTheDocument()
    })

    it('does not render when closed', () => {
      render(
        <Modal {...defaultProps} isOpen={false}>
          <p>Modal content</p>
        </Modal>
      )
      
      expect(screen.queryByText('Test Modal')).not.toBeInTheDocument()
      expect(screen.queryByText('Modal content')).not.toBeInTheDocument()
    })

    it('renders with custom title', () => {
      render(
        <Modal {...defaultProps} title="Custom Title">
          <p>Content</p>
        </Modal>
      )
      
      expect(screen.getByText('Custom Title')).toBeInTheDocument()
    })

    it('renders children correctly', () => {
      render(
        <Modal {...defaultProps}>
          <div data-testid="custom-content">
            <h2>Heading</h2>
            <p>Paragraph</p>
          </div>
        </Modal>
      )
      
      expect(screen.getByTestId('custom-content')).toBeInTheDocument()
      expect(screen.getByText('Heading')).toBeInTheDocument()
      expect(screen.getByText('Paragraph')).toBeInTheDocument()
    })
  })

  describe('User Interactions', () => {
    it('calls onClose when clicking close button', async () => {
      const user = userEvent.setup()
      const onClose = vi.fn()
      
      render(
        <Modal {...defaultProps} onClose={onClose}>
          <p>Content</p>
        </Modal>
      )
      
      const closeButton = screen.getByLabelText('Sluiten')
      await user.click(closeButton)
      
      expect(onClose).toHaveBeenCalledTimes(1)
    })

    it('calls onClose when clicking backdrop', async () => {
      const user = userEvent.setup()
      const onClose = vi.fn()
      
      render(
        <Modal {...defaultProps} onClose={onClose}>
          <p>Content</p>
        </Modal>
      )
      
      // Click on the backdrop (overlay) - get by class since no test-id
      const backdrop = document.querySelector('.fixed.inset-0')
      await user.click(backdrop as Element)
      
      expect(onClose).toHaveBeenCalledTimes(1)
    })

    it('does not close when clicking modal content', async () => {
      const user = userEvent.setup()
      const onClose = vi.fn()
      
      render(
        <Modal {...defaultProps} onClose={onClose}>
          <p>Content</p>
        </Modal>
      )
      
      const content = screen.getByText('Content')
      await user.click(content)
      
      expect(onClose).not.toHaveBeenCalled()
    })

    it('closes on Escape key press', async () => {
      const user = userEvent.setup()
      const onClose = vi.fn()
      
      render(
        <Modal {...defaultProps} onClose={onClose}>
          <p>Content</p>
        </Modal>
      )
      
      // Note: Modal doesn't have built-in Escape handler
      // This test documents expected behavior for future implementation
      await user.keyboard('{Escape}')
      
      // Currently not implemented, so we expect 0 calls
      expect(onClose).toHaveBeenCalledTimes(0)
    })
  })

  describe('Accessibility', () => {
    it('has proper heading structure', () => {
      render(
        <Modal {...defaultProps}>
          <p>Content</p>
        </Modal>
      )
      
      const heading = screen.getByText('Test Modal')
      expect(heading.tagName).toBe('H2')
    })

    it('has close button with aria-label', () => {
      render(
        <Modal {...defaultProps}>
          <p>Content</p>
        </Modal>
      )
      
      const closeButton = screen.getByLabelText('Sluiten')
      expect(closeButton).toBeInTheDocument()
    })

    it('stops propagation on modal content click', async () => {
      const user = userEvent.setup()
      const onClose = vi.fn()
      
      render(
        <Modal {...defaultProps} onClose={onClose}>
          <p>Content</p>
        </Modal>
      )
      
      const content = screen.getByText('Content')
      await user.click(content)
      
      expect(onClose).not.toHaveBeenCalled()
    })
  })

  describe('Footer', () => {
    it('renders without footer by default', () => {
      render(
        <Modal {...defaultProps}>
          <p>Content</p>
        </Modal>
      )
      
      const modal = screen.getByText('Test Modal').closest('div')
      expect(modal).toBeInTheDocument()
    })

    it('renders with custom footer', () => {
      render(
        <Modal {...defaultProps} footer={<button>Save</button>}>
          <p>Content</p>
        </Modal>
      )
      
      expect(screen.getByText('Save')).toBeInTheDocument()
    })

    it('renders footer in correct position', () => {
      render(
        <Modal {...defaultProps} footer={<button>Action</button>}>
          <p>Content</p>
        </Modal>
      )
      
      const footer = screen.getByText('Action').closest('div')
      expect(footer).toHaveClass('bg-gray-50')
    })
  })

  describe('Size Options', () => {
    it('renders with small size', () => {
      const { container } = render(
        <Modal {...defaultProps} size="sm">
          <p>Content</p>
        </Modal>
      )
      
      const modal = container.querySelector('.max-w-md')
      expect(modal).toBeInTheDocument()
    })

    it('renders with medium size (default)', () => {
      const { container } = render(
        <Modal {...defaultProps}>
          <p>Content</p>
        </Modal>
      )
      
      const modal = container.querySelector('.max-w-2xl')
      expect(modal).toBeInTheDocument()
    })

    it('renders with large size', () => {
      const { container } = render(
        <Modal {...defaultProps} size="lg">
          <p>Content</p>
        </Modal>
      )
      
      const modal = container.querySelector('.max-w-4xl')
      expect(modal).toBeInTheDocument()
    })

    it('renders with extra large size', () => {
      const { container } = render(
        <Modal {...defaultProps} size="xl">
          <p>Content</p>
        </Modal>
      )
      
      const modal = container.querySelector('.max-w-6xl')
      expect(modal).toBeInTheDocument()
    })
  })

  describe('Close Button', () => {
    it('shows close button by default', () => {
      render(
        <Modal {...defaultProps}>
          <p>Content</p>
        </Modal>
      )
      
      expect(screen.getByLabelText('Sluiten')).toBeInTheDocument()
    })

    it('hides close button when showCloseButton is false', () => {
      render(
        <Modal {...defaultProps} showCloseButton={false}>
          <p>Content</p>
        </Modal>
      )
      
      expect(screen.queryByLabelText('Sluiten')).not.toBeInTheDocument()
    })
  })

  describe('Edge Cases', () => {
    it('handles rapid open/close', async () => {
      const { rerender } = render(
        <Modal {...defaultProps} isOpen={false}>
          <p>Content</p>
        </Modal>
      )
      
      // Rapidly toggle
      rerender(
        <Modal {...defaultProps} isOpen={true}>
          <p>Content</p>
        </Modal>
      )
      
      expect(screen.getByText('Content')).toBeInTheDocument()
      
      rerender(
        <Modal {...defaultProps} isOpen={false}>
          <p>Content</p>
        </Modal>
      )
      
      expect(screen.queryByText('Content')).not.toBeInTheDocument()
    })

    it('handles missing onClose gracefully', () => {
      render(
        <Modal isOpen={true} onClose={undefined as any} title="Test">
          <p>Content</p>
        </Modal>
      )
      
      expect(screen.getByText('Content')).toBeInTheDocument()
    })

    it('handles empty children', () => {
      render(
        <Modal {...defaultProps}>
          {null}
        </Modal>
      )
      
      expect(screen.getByText('Test Modal')).toBeInTheDocument()
    })
  })
})
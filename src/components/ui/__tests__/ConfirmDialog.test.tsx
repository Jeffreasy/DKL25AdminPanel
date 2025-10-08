import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '../../../test/utils'
import { ConfirmDialog } from '../ConfirmDialog'

describe('ConfirmDialog', () => {
  it('renders when open is true', () => {
    render(
      <ConfirmDialog
        open={true}
        onClose={vi.fn()}
        onConfirm={vi.fn()}
        title="Test Title"
        message="Test Message"
      />
    )

    expect(screen.getByText('Test Title')).toBeInTheDocument()
    expect(screen.getByText('Test Message')).toBeInTheDocument()
  })

  it('does not render when open is false', () => {
    render(
      <ConfirmDialog
        open={false}
        onClose={vi.fn()}
        onConfirm={vi.fn()}
        title="Test Title"
        message="Test Message"
      />
    )

    expect(screen.queryByText('Test Title')).not.toBeInTheDocument()
  })

  it('calls onConfirm when confirm button is clicked', async () => {
    const onConfirm = vi.fn()
    render(
      <ConfirmDialog
        open={true}
        onClose={vi.fn()}
        onConfirm={onConfirm}
        title="Test Title"
        message="Test Message"
        confirmText="Confirm"
      />
    )

    const confirmButton = screen.getByText('Confirm')
    fireEvent.click(confirmButton)

    expect(onConfirm).toHaveBeenCalledTimes(1)
  })

  it('calls onClose when cancel button is clicked', () => {
    const onClose = vi.fn()
    render(
      <ConfirmDialog
        open={true}
        onClose={onClose}
        onConfirm={vi.fn()}
        title="Test Title"
        message="Test Message"
        cancelText="Cancel"
      />
    )

    const cancelButton = screen.getByText('Cancel')
    fireEvent.click(cancelButton)

    expect(onClose).toHaveBeenCalledTimes(1)
  })

  it('renders with danger variant', () => {
    render(
      <ConfirmDialog
        open={true}
        onClose={vi.fn()}
        onConfirm={vi.fn()}
        title="Delete Item"
        message="Are you sure?"
        variant="danger"
      />
    )

    expect(screen.getByText('Delete Item')).toBeInTheDocument()
  })

  it('shows loading state when isProcessing is true', () => {
    render(
      <ConfirmDialog
        open={true}
        onClose={vi.fn()}
        onConfirm={vi.fn()}
        title="Test"
        message="Test"
        isProcessing={true}
      />
    )

    expect(screen.getByText('Bezig...')).toBeInTheDocument()
  })
})
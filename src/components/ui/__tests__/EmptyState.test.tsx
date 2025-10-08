import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '../../../test/utils'
import { EmptyState } from '../EmptyState'

describe('EmptyState', () => {
  it('renders title and description', () => {
    render(
      <EmptyState
        title="No Items"
        description="Add your first item to get started"
      />
    )

    expect(screen.getByText('No Items')).toBeInTheDocument()
    expect(screen.getByText('Add your first item to get started')).toBeInTheDocument()
  })

  it('renders with custom icon', () => {
    render(
      <EmptyState
        title="No Photos"
        icon={<svg data-testid="custom-icon" />}
      />
    )

    expect(screen.getByTestId('custom-icon')).toBeInTheDocument()
  })

  it('renders action button when provided', () => {
    const onClick = vi.fn()
    render(
      <EmptyState
        title="No Items"
        action={{
          label: 'Add Item',
          onClick
        }}
      />
    )

    const button = screen.getByText('Add Item')
    expect(button).toBeInTheDocument()
  })

  it('calls action onClick when button is clicked', () => {
    const onClick = vi.fn()
    render(
      <EmptyState
        title="No Items"
        action={{
          label: 'Add Item',
          onClick
        }}
      />
    )

    const button = screen.getByText('Add Item')
    button.click()

    expect(onClick).toHaveBeenCalledTimes(1)
  })
})
import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import EmailItem from '../components/EmailItem'
import type { Email } from '../types'

const mockEmail: Email = {
  id: '1',
  message_id: 'msg-1',
  sender: 'sender@example.com',
  to: 'recipient@example.com',
  subject: 'Test Subject',
  html: '<p>Test content</p>',
  content_type: 'text/html',
  received_at: '2024-01-01T12:00:00Z',
  uid: 'uid-1',
  account_type: 'info',
  read: false,
  processed_at: null,
  created_at: '2024-01-01T12:00:00Z',
  updated_at: '2024-01-01T12:00:00Z'
}

describe('EmailItem', () => {
  it('should render email information correctly', () => {
    render(
      <EmailItem
        email={mockEmail}
        isSelected={false}
        onClick={vi.fn()}
        formattedDate="2 uur geleden"
      />
    )

    expect(screen.getByText('sender@example.com')).toBeInTheDocument()
    expect(screen.getByText('Test Subject')).toBeInTheDocument()
    expect(screen.getByText('2 uur geleden')).toBeInTheDocument()
  })

  it('should call onClick when clicked', async () => {
    const user = userEvent.setup()
    const handleClick = vi.fn()

    render(
      <EmailItem
        email={mockEmail}
        isSelected={false}
        onClick={handleClick}
        formattedDate="2 uur geleden"
      />
    )

    await user.click(screen.getByText('Test Subject'))
    expect(handleClick).toHaveBeenCalledTimes(1)
  })

  it('should apply selected styles when isSelected is true', () => {
    const { container } = render(
      <EmailItem
        email={mockEmail}
        isSelected={true}
        onClick={vi.fn()}
        formattedDate="2 uur geleden"
      />
    )

    const emailDiv = container.firstChild as HTMLElement
    expect(emailDiv).toHaveClass('bg-blue-100')
  })

  it('should apply unread styles when email is unread', () => {
    const { container } = render(
      <EmailItem
        email={mockEmail}
        isSelected={false}
        onClick={vi.fn()}
        formattedDate="2 uur geleden"
      />
    )

    const emailDiv = container.firstChild as HTMLElement
    expect(emailDiv).toHaveClass('bg-gray-100')
  })

  it('should apply read styles when email is read', () => {
    const readEmail = { ...mockEmail, read: true }
    const { container } = render(
      <EmailItem
        email={readEmail}
        isSelected={false}
        onClick={vi.fn()}
        formattedDate="2 uur geleden"
      />
    )

    const emailDiv = container.firstChild as HTMLElement
    expect(emailDiv).toHaveClass('bg-white')
  })

  it('should apply different font weights based on read status', () => {
    const { rerender } = render(
      <EmailItem
        email={mockEmail}
        isSelected={false}
        onClick={vi.fn()}
        formattedDate="2 uur geleden"
      />
    )

    let senderElement = screen.getByText('sender@example.com')
    expect(senderElement).toHaveClass('font-semibold')

    const readEmail = { ...mockEmail, read: true }
    rerender(
      <EmailItem
        email={readEmail}
        isSelected={false}
        onClick={vi.fn()}
        formattedDate="2 uur geleden"
      />
    )

    senderElement = screen.getByText('sender@example.com')
    expect(senderElement).toHaveClass('font-normal')
  })
})
import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import EmailDetail from '../components/EmailDetail'
import type { Email } from '../types'
import DOMPurify from 'dompurify'

// Mock DOMPurify
vi.mock('dompurify', () => ({
  default: {
    sanitize: vi.fn((html) => html)
  }
}))

const mockEmail: Email = {
  id: '1',
  message_id: 'msg-1',
  sender: 'sender@example.com',
  to: 'recipient@example.com',
  subject: 'Test Subject',
  html: '<p>Test content with <script>alert("xss")</script></p>',
  content_type: 'text/html',
  received_at: '2024-01-01T12:00:00Z',
  uid: 'uid-1',
  account_type: 'info',
  read: false,
  processed_at: null,
  created_at: '2024-01-01T12:00:00Z',
  updated_at: '2024-01-01T12:00:00Z'
}

describe('EmailDetail', () => {
  it('should render email details correctly', () => {
    render(<EmailDetail email={mockEmail} />)

    expect(screen.getByText('Test Subject')).toBeInTheDocument()
    expect(screen.getByText('sender@example.com')).toBeInTheDocument()
    expect(screen.getByText('recipient@example.com')).toBeInTheDocument()
  })

  it('should sanitize HTML content using DOMPurify', () => {
    render(<EmailDetail email={mockEmail} />)

    expect(DOMPurify.sanitize).toHaveBeenCalledWith(
      mockEmail.html,
      expect.objectContaining({
        ALLOWED_TAGS: expect.any(Array),
        ALLOWED_ATTR: expect.any(Array)
      })
    )
  })

  it('should display formatted date correctly', () => {
    render(<EmailDetail email={mockEmail} />)

    // Check that date is formatted (exact format depends on locale)
    expect(screen.getByText(/01 januari 2024/i)).toBeInTheDocument()
  })

  it('should show content type when available', () => {
    render(<EmailDetail email={mockEmail} />)

    expect(screen.getByText('text/html')).toBeInTheDocument()
  })

  it('should show "Geen inhoud beschikbaar" when html is empty', () => {
    const emptyEmail = { ...mockEmail, html: '' }
    
    // Mock DOMPurify to return empty string
    vi.mocked(DOMPurify.sanitize).mockReturnValue('')
    
    render(<EmailDetail email={emptyEmail} />)

    expect(screen.getByText('Geen inhoud beschikbaar')).toBeInTheDocument()
  })

  it('should render reply button when onReply is provided', () => {
    const handleReply = vi.fn()
    render(<EmailDetail email={mockEmail} onReply={handleReply} />)

    const replyButton = screen.getByTitle('Beantwoorden')
    expect(replyButton).toBeInTheDocument()
    expect(replyButton).toHaveTextContent('Beantwoorden')
  })

  it('should render forward button when onForward is provided', () => {
    const handleForward = vi.fn()
    render(<EmailDetail email={mockEmail} onForward={handleForward} />)

    const forwardButton = screen.getByTitle('Doorsturen')
    expect(forwardButton).toBeInTheDocument()
    expect(forwardButton).toHaveTextContent('Doorsturen')
  })

  it('should call onReply when reply button is clicked', async () => {
    const user = userEvent.setup()
    const handleReply = vi.fn()
    render(<EmailDetail email={mockEmail} onReply={handleReply} />)

    const replyButton = screen.getByTitle('Beantwoorden')
    await user.click(replyButton)

    expect(handleReply).toHaveBeenCalledWith(mockEmail)
  })

  it('should call onForward when forward button is clicked', async () => {
    const user = userEvent.setup()
    const handleForward = vi.fn()
    render(<EmailDetail email={mockEmail} onForward={handleForward} />)

    const forwardButton = screen.getByTitle('Doorsturen')
    await user.click(forwardButton)

    expect(handleForward).toHaveBeenCalledWith(mockEmail)
  })

  it('should not render reply/forward buttons when handlers are not provided', () => {
    render(<EmailDetail email={mockEmail} />)

    expect(screen.queryByTitle('Beantwoorden')).not.toBeInTheDocument()
    expect(screen.queryByTitle('Doorsturen')).not.toBeInTheDocument()
  })

  it('should render both reply and forward buttons when both handlers provided', () => {
    const handleReply = vi.fn()
    const handleForward = vi.fn()
    
    render(
      <EmailDetail 
        email={mockEmail} 
        onReply={handleReply}
        onForward={handleForward}
      />
    )

    expect(screen.getByTitle('Beantwoorden')).toBeInTheDocument()
    expect(screen.getByTitle('Doorsturen')).toBeInTheDocument()
  })

  it('should handle missing "to" field gracefully', () => {
    const emailWithoutTo = { ...mockEmail, to: '' }
    render(<EmailDetail email={emailWithoutTo} />)

    // Should not crash, subject should still be visible
    expect(screen.getByText('Test Subject')).toBeInTheDocument()
  })
})
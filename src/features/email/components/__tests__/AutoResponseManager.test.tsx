import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen, waitFor, fireEvent } from '@testing-library/react'
import { AutoResponseManager } from '../AutoResponseManager'
import { emailClient } from '../../../../api/client/emailClient'

// Mock dependencies
vi.mock('../../../../api/client/emailClient')
vi.mock('react-hot-toast', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn()
  }
}))

describe('AutoResponseManager', () => {
  const mockAutoResponses = [
    {
      id: '1',
      name: 'Contact Template',
      subject: 'RE: Contact',
      body: '<p>Thank you for contacting us</p>',
      trigger_event: 'contact' as const,
      is_active: true,
      template_variables: {},
      created_at: '2025-11-08T00:00:00Z',
      updated_at: '2025-11-08T00:00:00Z'
    },
    {
      id: '2',
      name: 'Registration Template',
      subject: 'RE: Registration',
      body: '<p>Thank you for registering</p>',
      trigger_event: 'registration' as const,
      is_active: false,
      template_variables: {},
      created_at: '2025-11-08T00:00:00Z',
      updated_at: '2025-11-08T00:00:00Z'
    }
  ]

  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(emailClient.getAutoResponses).mockResolvedValue(mockAutoResponses)
  })

  it('should render loading state initially', () => {
    vi.mocked(emailClient.getAutoResponses).mockImplementation(() => 
      new Promise(() => {}) // Never resolves
    )

    render(<AutoResponseManager />)

    expect(screen.getByText(/AutoResponse Templates/i)).toBeInTheDocument()
  })

  it('should load and display autoresponses', async () => {
    render(<AutoResponseManager />)

    await waitFor(() => {
      expect(emailClient.getAutoResponses).toHaveBeenCalled()
    })

    expect(screen.getByText('Contact Template')).toBeInTheDocument()
    expect(screen.getByText('Registration Template')).toBeInTheDocument()
  })

  it('should display active/inactive badges correctly', async () => {
    render(<AutoResponseManager />)

    await waitFor(() => {
      expect(screen.getByText('Contact Template')).toBeInTheDocument()
    })

    const activeElements = screen.getAllByText('Actief')
    const inactiveElements = screen.getAllByText('Inactief')

    expect(activeElements.length).toBeGreaterThan(0)
    expect(inactiveElements.length).toBeGreaterThan(0)
  })

  it('should open create modal when clicking new button', async () => {
    render(<AutoResponseManager />)

    await waitFor(() => {
      expect(screen.getByText('Contact Template')).toBeInTheDocument()
    })

    const newButton = screen.getByRole('button', { name: /Nieuwe Template/i })
    fireEvent.click(newButton)

    await waitFor(() => {
      expect(screen.getByText('Nieuwe AutoResponse')).toBeInTheDocument()
    })
  })

  it('should open edit modal when clicking edit button', async () => {
    render(<AutoResponseManager />)

    await waitFor(() => {
      expect(screen.getByText('Contact Template')).toBeInTheDocument()
    })

    const editButtons = screen.getAllByTitle('Bewerken')
    fireEvent.click(editButtons[0])

    await waitFor(() => {
      expect(screen.getByText('AutoResponse Bewerken')).toBeInTheDocument()
    })
  })

  it('should show empty state when no autoresponses', async () => {
    vi.mocked(emailClient.getAutoResponses).mockResolvedValue([])

    render(<AutoResponseManager />)

    await waitFor(() => {
      expect(screen.getByText('Geen autoresponse templates')).toBeInTheDocument()
    })
  })

  it('should toggle active status', async () => {
    vi.mocked(emailClient.updateAutoResponse).mockResolvedValue({
      ...mockAutoResponses[0],
      is_active: false
    })

    render(<AutoResponseManager />)

    await waitFor(() => {
      expect(screen.getByText('Contact Template')).toBeInTheDocument()
    })

    const toggleButtons = screen.getAllByTitle(/Deactiveren|Activeren/)
    fireEvent.click(toggleButtons[0])

    await waitFor(() => {
      expect(emailClient.updateAutoResponse).toHaveBeenCalledWith('1', {
        is_active: false
      })
    })
  })

  it('should show delete confirmation dialog', async () => {
    render(<AutoResponseManager />)

    await waitFor(() => {
      expect(screen.getByText('Contact Template')).toBeInTheDocument()
    })

    const deleteButtons = screen.getAllByTitle('Verwijderen')
    fireEvent.click(deleteButtons[0])

    await waitFor(() => {
      expect(screen.getByText('AutoResponse Verwijderen')).toBeInTheDocument()
    })
  })
})
import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { vi } from 'vitest'
import { UserSelect } from '../UserSelect'
import { userClient } from '@/api/client'

// Mock the userClient
vi.mock('@/api/client', () => ({
  userClient: {
    searchUsers: vi.fn(),
    getUserById: vi.fn()
  }
}))

const mockedUserClient = vi.mocked(userClient)

const mockUsers = [
  {
    id: '1',
    naam: 'John Doe',
    email: 'john@example.com',
    avatar_url: 'https://example.com/avatar1.jpg',
    role: 'admin',
    is_active: true,
    created_at: '2023-01-01T00:00:00Z',
    updated_at: '2023-01-01T00:00:00Z'
  },
  {
    id: '2',
    naam: 'Jane Smith',
    email: 'jane@example.com',
    avatar_url: undefined,
    role: 'user',
    is_active: true,
    created_at: '2023-01-01T00:00:00Z',
    updated_at: '2023-01-01T00:00:00Z'
  }
]

describe('UserSelect', () => {
  const defaultProps = {
    selectedUsers: [],
    onChange: vi.fn(),
    placeholder: 'Select users...',
    multiple: true
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders with placeholder when no users selected', () => {
    render(<UserSelect {...defaultProps} />)

    expect(screen.getByText('Select users...')).toBeInTheDocument()
  })

  it('renders selected user count for multiple selection', () => {
    render(<UserSelect {...defaultProps} selectedUsers={['1', '2']} />)

    expect(screen.getByText('2 gebruikers geselecteerd')).toBeInTheDocument()
  })

  it('renders selected user name for single selection', async () => {
    mockedUserClient.getUserById.mockResolvedValue(mockUsers[0])

    render(<UserSelect {...defaultProps} selectedUsers={['1']} multiple={false} />)

    await waitFor(() => {
      expect(screen.getAllByText('John Doe')).toHaveLength(2)
    })
  })

  it('renders selected user name for multiple selection', async () => {
    mockedUserClient.getUserById.mockResolvedValue(mockUsers[0])

    render(<UserSelect {...defaultProps} selectedUsers={['1']} multiple={true} />)

    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument()
    })
  })

  it('selects user in multiple mode', async () => {
    mockedUserClient.searchUsers.mockResolvedValue([mockUsers[0]])
    const mockOnChange = vi.fn()

    render(<UserSelect {...defaultProps} onChange={mockOnChange} />)

    const trigger = screen.getByRole('button')
    fireEvent.click(trigger)

    const searchInput = screen.getByPlaceholderText('Zoek gebruikers...')
    fireEvent.change(searchInput, { target: { value: 'john' } })

    await waitFor(() => {
      const userButton = screen.getByText('John Doe')
      fireEvent.click(userButton)
    })

    expect(mockOnChange).toHaveBeenCalledWith(['1'])
  })

  it('opens dropdown when clicked', () => {
    render(<UserSelect {...defaultProps} />)

    const trigger = screen.getByRole('button')
    fireEvent.click(trigger)

    expect(screen.getByPlaceholderText('Zoek gebruikers...')).toBeInTheDocument()
  })

  it('searches users with debounced query', async () => {
    mockedUserClient.searchUsers.mockResolvedValue([mockUsers[0]])

    render(<UserSelect {...defaultProps} />)

    const trigger = screen.getByRole('button')
    fireEvent.click(trigger)

    const searchInput = screen.getByPlaceholderText('Zoek gebruikers...')
    fireEvent.change(searchInput, { target: { value: 'john' } })

    await waitFor(() => {
      expect(mockedUserClient.searchUsers).toHaveBeenCalledWith('john', 10)
    }, { timeout: 400 })
  })

  it('displays search results', async () => {
    mockedUserClient.searchUsers.mockResolvedValue(mockUsers)

    render(<UserSelect {...defaultProps} />)

    const trigger = screen.getByRole('button')
    fireEvent.click(trigger)

    const searchInput = screen.getByPlaceholderText('Zoek gebruikers...')
    fireEvent.change(searchInput, { target: { value: 'test' } })

    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument()
      expect(screen.getByText('john@example.com')).toBeInTheDocument()
      expect(screen.getByText('Jane Smith')).toBeInTheDocument()
      expect(screen.getByText('jane@example.com')).toBeInTheDocument()
    })
  })

  it('deselects user in multiple mode', async () => {
    mockedUserClient.getUserById.mockResolvedValue(mockUsers[0])
    const mockOnChange = vi.fn()

    render(<UserSelect {...defaultProps} selectedUsers={['1']} onChange={mockOnChange} />)

    await waitFor(() => {
      const userSpan = screen.getByText('John Doe').closest('span')
      const removeButton = userSpan?.querySelector('button')
      if (removeButton) {
        fireEvent.click(removeButton)
      }
    })

    expect(mockOnChange).toHaveBeenCalledWith([])
  })

  it('selects user in single mode and closes dropdown', async () => {
    mockedUserClient.searchUsers.mockResolvedValue([mockUsers[0]])
    const mockOnChange = vi.fn()

    render(<UserSelect {...defaultProps} onChange={mockOnChange} multiple={false} />)

    const trigger = screen.getByRole('button')
    fireEvent.click(trigger)

    const searchInput = screen.getByPlaceholderText('Zoek gebruikers...')
    fireEvent.change(searchInput, { target: { value: 'john' } })

    await waitFor(() => {
      const userButton = screen.getByText('John Doe')
      fireEvent.click(userButton)
    })

    expect(mockOnChange).toHaveBeenCalledWith(['1'])
    // Dropdown should be closed in single mode
    expect(screen.queryByPlaceholderText('Zoek gebruikers...')).not.toBeInTheDocument()
  })

  it('removes selected user', async () => {
    mockedUserClient.getUserById.mockResolvedValue(mockUsers[0])
    const mockOnChange = vi.fn()

    render(<UserSelect {...defaultProps} selectedUsers={['1']} onChange={mockOnChange} />)

    await waitFor(() => {
      const removeButton = screen.getByRole('button', { name: '' })
      fireEvent.click(removeButton)
    })

    expect(mockOnChange).toHaveBeenCalledWith([])
  })

  it('shows loading state during search', async () => {
    mockedUserClient.searchUsers.mockImplementation(() => new Promise(resolve => setTimeout(() => resolve([]), 100)))

    render(<UserSelect {...defaultProps} />)

    const trigger = screen.getByRole('button')
    fireEvent.click(trigger)

    const searchInput = screen.getByPlaceholderText('Zoek gebruikers...')
    fireEvent.change(searchInput, { target: { value: 'test' } })

    await waitFor(() => {
      expect(screen.getByText('Zoeken...')).toBeInTheDocument()
    })

    await waitFor(() => {
      expect(screen.queryByText('Zoeken...')).not.toBeInTheDocument()
    })
  })

  it('shows no results message', async () => {
    mockedUserClient.searchUsers.mockResolvedValue([])

    render(<UserSelect {...defaultProps} />)

    const trigger = screen.getByRole('button')
    fireEvent.click(trigger)

    const searchInput = screen.getByPlaceholderText('Zoek gebruikers...')
    fireEvent.change(searchInput, { target: { value: 'nonexistent' } })

    await waitFor(() => {
      expect(screen.getByText('Geen gebruikers gevonden')).toBeInTheDocument()
    })
  })

  it('closes dropdown when clicking outside', () => {
    render(<UserSelect {...defaultProps} />)

    const trigger = screen.getByRole('button')
    fireEvent.click(trigger)

    expect(screen.getByPlaceholderText('Zoek gebruikers...')).toBeInTheDocument()

    fireEvent.mouseDown(document.body)

    expect(screen.queryByPlaceholderText('Zoek gebruikers...')).not.toBeInTheDocument()
  })

  it('disables component when disabled prop is true', () => {
    render(<UserSelect {...defaultProps} disabled={true} />)

    const trigger = screen.getByRole('button')
    expect(trigger).toBeDisabled()
  })

  it('loads selected user details on mount', async () => {
    mockedUserClient.getUserById.mockResolvedValue(mockUsers[0])

    render(<UserSelect {...defaultProps} selectedUsers={['1']} />)

    await waitFor(() => {
      expect(mockedUserClient.getUserById).toHaveBeenCalledWith('1')
      expect(screen.getByText('John Doe')).toBeInTheDocument()
    })
  })

  it('handles user detail loading errors gracefully', async () => {
    mockedUserClient.getUserById.mockRejectedValue(new Error('Failed to load'))

    render(<UserSelect {...defaultProps} selectedUsers={['1']} />)

    // Should not crash and should not show user details
    await waitFor(() => {
      expect(mockedUserClient.getUserById).toHaveBeenCalledWith('1')
    })

    // Component should still render with count when users fail to load
    expect(screen.getByText('1 gebruiker geselecteerd')).toBeInTheDocument()
  })
})
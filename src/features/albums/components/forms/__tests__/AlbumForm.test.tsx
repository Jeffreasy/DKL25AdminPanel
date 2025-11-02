import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { AlbumForm } from '../AlbumForm'
import type { AlbumWithDetails } from '../../../types'
import { supabase } from '../../../../../api/client/supabase'

// Mock dependencies
vi.mock('../../../../../api/client/supabase', () => ({
  supabase: {
    from: vi.fn()
  }
}))

const mockUser = {
  id: 'user-1',
  email: 'test@example.com',
  role: 'admin',
  roles: [{ id: 'admin-role', name: 'admin', description: 'Administrator' }]
}

vi.mock('../../../../auth/hooks/useAuth', () => ({
  useAuth: vi.fn()
}))

import { useAuth } from '../../../../auth/hooks/useAuth'

describe('AlbumForm', () => {
  const mockOnComplete = vi.fn()
  const mockOnCancel = vi.fn()

  const mockAlbum: AlbumWithDetails = {
    id: 'album-1',
    title: 'Test Album',
    description: 'Test Description',
    visible: true,
    order_number: 1,
    photos_count: [{ count: 0 }],
    created_at: '2024-01-01',
    updated_at: '2024-01-01'
  }

  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(useAuth).mockReturnValue({
      user: mockUser,
      loading: false,
      error: null,
      isAuthenticated: true,
      isLoading: false,
      signIn: vi.fn(),
      signOut: vi.fn(),
      logout: vi.fn()
    })
  })

  describe('Rendering', () => {
    it('renders form with title for new album', () => {
      render(
        <AlbumForm
          onComplete={mockOnComplete}
          onCancel={mockOnCancel}
        />
      )

      expect(screen.getByText('Nieuw album aanmaken')).toBeInTheDocument()
    })

    it('renders form with title for editing album', () => {
      render(
        <AlbumForm
          album={mockAlbum}
          onComplete={mockOnComplete}
          onCancel={mockOnCancel}
        />
      )

      expect(screen.getByText('Album bewerken')).toBeInTheDocument()
    })

    it('renders all form fields', () => {
      render(
        <AlbumForm
          onComplete={mockOnComplete}
          onCancel={mockOnCancel}
        />
      )

      expect(screen.getByLabelText(/Titel/)).toBeInTheDocument()
      expect(screen.getByLabelText(/Beschrijving/)).toBeInTheDocument()
      expect(screen.getByLabelText(/Volgorde/)).toBeInTheDocument()
      expect(screen.getByLabelText(/Zichtbaar op website/)).toBeInTheDocument()
    })

    it('populates form with album data when editing', () => {
      render(
        <AlbumForm
          album={mockAlbum}
          onComplete={mockOnComplete}
          onCancel={mockOnCancel}
        />
      )

      expect(screen.getByDisplayValue('Test Album')).toBeInTheDocument()
      expect(screen.getByDisplayValue('Test Description')).toBeInTheDocument()
      expect(screen.getByDisplayValue('1')).toBeInTheDocument()
    })

    it('shows required indicator for title field', () => {
      render(
        <AlbumForm
          onComplete={mockOnComplete}
          onCancel={mockOnCancel}
        />
      )

      const titleLabel = screen.getByText(/Titel/)
      expect(titleLabel.querySelector('.text-red-500')).toBeInTheDocument()
    })
  })

  describe('Form Validation', () => {
    it('shows error when title is empty', async () => {
      render(
        <AlbumForm
          onComplete={mockOnComplete}
          onCancel={mockOnCancel}
        />
      )

      const titleInput = screen.getByLabelText(/Titel/)
      const submitButton = screen.getByText('Toevoegen')

      fireEvent.change(titleInput, { target: { value: '' } })
      fireEvent.blur(titleInput)
      fireEvent.click(submitButton)

      await waitFor(() => {
        expect(screen.getByText('Titel is verplicht')).toBeInTheDocument()
      })
    })

    it('does not show error for valid title', async () => {
      render(
        <AlbumForm
          onComplete={mockOnComplete}
          onCancel={mockOnCancel}
        />
      )

      const titleInput = screen.getByLabelText(/Titel/)
      fireEvent.change(titleInput, { target: { value: 'Valid Title' } })
      fireEvent.blur(titleInput)

      await waitFor(() => {
        expect(screen.queryByText('Titel is verplicht')).not.toBeInTheDocument()
      })
    })
  })

  describe('Form Submission', () => {
    it('creates new album successfully', async () => {
      const mockInsert = vi.fn(() => Promise.resolve({ error: null }))
      
      vi.mocked(supabase.from).mockReturnValue({
        insert: mockInsert
      } as any)

      render(
        <AlbumForm
          onComplete={mockOnComplete}
          onCancel={mockOnCancel}
        />
      )

      fireEvent.change(screen.getByLabelText(/Titel/), {
        target: { value: 'New Album' }
      })
      fireEvent.change(screen.getByLabelText(/Beschrijving/), {
        target: { value: 'New Description' }
      })

      fireEvent.click(screen.getByText('Toevoegen'))

      await waitFor(() => {
        expect(mockInsert).toHaveBeenCalled()
        expect(mockOnComplete).toHaveBeenCalled()
      })
    })

    it('updates existing album successfully', async () => {
      const mockUpdate = vi.fn(() => ({
        eq: vi.fn(() => Promise.resolve({ error: null }))
      }))
      
      vi.mocked(supabase.from).mockReturnValue({
        update: mockUpdate
      } as any)

      render(
        <AlbumForm
          album={mockAlbum}
          onComplete={mockOnComplete}
          onCancel={mockOnCancel}
        />
      )

      fireEvent.change(screen.getByLabelText(/Titel/), {
        target: { value: 'Updated Album' }
      })

      fireEvent.click(screen.getByText('Opslaan'))

      await waitFor(() => {
        expect(mockUpdate).toHaveBeenCalled()
        expect(mockOnComplete).toHaveBeenCalled()
      })
    })

    it('handles submission error gracefully', async () => {
      const mockInsert = vi.fn(() => Promise.resolve({
        error: new Error('Database error')
      }))
      
      vi.mocked(supabase.from).mockReturnValue({
        insert: mockInsert
      } as any)

      render(
        <AlbumForm
          onComplete={mockOnComplete}
          onCancel={mockOnCancel}
        />
      )

      fireEvent.change(screen.getByLabelText(/Titel/), {
        target: { value: 'New Album' }
      })

      fireEvent.click(screen.getByText('Toevoegen'))

      await waitFor(() => {
        expect(screen.getByText(/Database error/)).toBeInTheDocument()
      })
    })
  })

  describe('User Interactions', () => {
    it('calls onCancel when cancel button is clicked', () => {
      render(
        <AlbumForm
          onComplete={mockOnComplete}
          onCancel={mockOnCancel}
        />
      )

      fireEvent.click(screen.getByText('Annuleren'))
      expect(mockOnCancel).toHaveBeenCalled()
    })

    it('updates form values on input change', () => {
      render(
        <AlbumForm
          onComplete={mockOnComplete}
          onCancel={mockOnCancel}
        />
      )

      const titleInput = screen.getByLabelText(/Titel/) as HTMLInputElement
      fireEvent.change(titleInput, { target: { value: 'New Title' } })

      expect(titleInput.value).toBe('New Title')
    })

    it('toggles visibility checkbox', () => {
      render(
        <AlbumForm
          onComplete={mockOnComplete}
          onCancel={mockOnCancel}
        />
      )

      const visibilityCheckbox = screen.getByLabelText(/Zichtbaar op website/) as HTMLInputElement
      expect(visibilityCheckbox.checked).toBe(true)

      fireEvent.click(visibilityCheckbox)
      expect(visibilityCheckbox.checked).toBe(false)
    })

    it('updates order number', () => {
      render(
        <AlbumForm
          onComplete={mockOnComplete}
          onCancel={mockOnCancel}
        />
      )

      const orderInput = screen.getByLabelText(/Volgorde/) as HTMLInputElement
      fireEvent.change(orderInput, { target: { value: '5' } })

      expect(orderInput.value).toBe('5')
    })
  })

  describe('Error Handling', () => {
    it('shows authentication error when user is not logged in', () => {
      vi.mocked(useAuth).mockReturnValue({
        user: null,
        loading: false,
        error: null,
        isAuthenticated: false,
        isLoading: false,
        signIn: vi.fn(),
        signOut: vi.fn(),
        logout: vi.fn()
      })

      render(
        <AlbumForm
          onComplete={mockOnComplete}
          onCancel={mockOnCancel}
        />
      )

      expect(screen.getByText('Authenticatie vereist.')).toBeInTheDocument()
    })

    it('clears submit error when form is resubmitted', async () => {
      const mockInsert = vi.fn()
        .mockResolvedValueOnce({ error: new Error('First error') })
        .mockResolvedValueOnce({ error: null })
      
      vi.mocked(supabase.from).mockReturnValue({
        insert: mockInsert
      } as any)

      render(
        <AlbumForm
          onComplete={mockOnComplete}
          onCancel={mockOnCancel}
        />
      )

      fireEvent.change(screen.getByLabelText(/Titel/), {
        target: { value: 'Test' }
      })

      // First submission - should show error
      fireEvent.click(screen.getByText('Toevoegen'))

      await waitFor(() => {
        expect(screen.getByText(/First error/)).toBeInTheDocument()
      })

      // Second submission - error should be cleared
      fireEvent.click(screen.getByText('Toevoegen'))

      await waitFor(() => {
        expect(screen.queryByText(/First error/)).not.toBeInTheDocument()
      })
    })
  })

  describe('Modal Integration', () => {
    it('renders within a modal', () => {
      render(
        <AlbumForm
          onComplete={mockOnComplete}
          onCancel={mockOnCancel}
        />
      )

      // Modal should be present - check for modal title
      expect(screen.getByText('Nieuw album aanmaken')).toBeInTheDocument()
      expect(screen.getByText('Annuleren')).toBeInTheDocument()
    })

    it('shows correct button text for create mode', () => {
      render(
        <AlbumForm
          onComplete={mockOnComplete}
          onCancel={mockOnCancel}
        />
      )

      expect(screen.getByText('Toevoegen')).toBeInTheDocument()
    })

    it('shows correct button text for edit mode', () => {
      render(
        <AlbumForm
          album={mockAlbum}
          onComplete={mockOnComplete}
          onCancel={mockOnCancel}
        />
      )

      expect(screen.getByText('Opslaan')).toBeInTheDocument()
    })
  })
})
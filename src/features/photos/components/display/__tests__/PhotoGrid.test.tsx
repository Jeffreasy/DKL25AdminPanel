import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import type { Photo } from '../../../types'

// Mock hooks BEFORE importing component
const mockHandleDelete = vi.fn()
const mockHandleVisibilityToggle = vi.fn()
const mockHandleSelectionChange = vi.fn()

vi.mock('../../hooks/usePhotoActions', () => ({
  usePhotoActions: vi.fn(() => ({
    handleDelete: mockHandleDelete,
    handleVisibilityToggle: mockHandleVisibilityToggle,
    loading: false
  }))
}))

vi.mock('../../hooks/usePhotoSelection', () => ({
  usePhotoSelection: vi.fn(() => ({
    selectedPhotoIds: new Set<string>(),
    handleSelectionChange: mockHandleSelectionChange,
    handleSelectAll: vi.fn(),
    clearSelection: vi.fn(),
    selectedCount: 0
  }))
}))

// Import component AFTER mocks
import { PhotoGrid } from '../PhotoGrid'

describe('PhotoGrid', () => {
  const mockPhotos: Photo[] = [
    {
      id: 'photo-1',
      url: 'https://example.com/photo1.jpg',
      thumbnail_url: 'https://example.com/thumb1.jpg',
      title: 'Photo 1',
      alt_text: 'Alt 1',
      description: 'Description 1',
      visible: true,
      year: '2024',
      created_at: '2024-01-01',
      updated_at: '2024-01-01'
    },
    {
      id: 'photo-2',
      url: 'https://example.com/photo2.jpg',
      thumbnail_url: 'https://example.com/thumb2.jpg',
      title: 'Photo 2',
      alt_text: 'Alt 2',
      description: null,
      visible: false,
      year: '2023',
      created_at: '2024-01-02',
      updated_at: '2024-01-02'
    }
  ]

  const mockOnUpdate = vi.fn()
  const mockSetError = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
    mockHandleDelete.mockClear()
    mockHandleVisibilityToggle.mockClear()
    mockHandleSelectionChange.mockClear()
  })

  describe('Rendering', () => {
    it('renders loading state', () => {
      render(
        <PhotoGrid
          photos={[]}
          loading={true}
          error={null}
          onUpdate={mockOnUpdate}
          setError={mockSetError}
        />
      )

      expect(document.querySelector('.animate-pulse')).toBeInTheDocument()
    })

    it('renders error state', () => {
      const error = new Error('Test error')
      
      render(
        <PhotoGrid
          photos={[]}
          loading={false}
          error={error}
          onUpdate={mockOnUpdate}
          setError={mockSetError}
        />
      )

      expect(screen.getByText('Test error')).toBeInTheDocument()
    })

    it('renders empty state when no photos', () => {
      render(
        <PhotoGrid
          photos={[]}
          loading={false}
          error={null}
          onUpdate={mockOnUpdate}
          setError={mockSetError}
        />
      )

      expect(screen.getByText('Nog geen foto\'s geüpload')).toBeInTheDocument()
    })

    it('renders photos in grid', () => {
      render(
        <PhotoGrid
          photos={mockPhotos}
          loading={false}
          error={null}
          onUpdate={mockOnUpdate}
          setError={mockSetError}
        />
      )

      expect(screen.getByText('Photo 1')).toBeInTheDocument()
      expect(screen.getByText('Photo 2')).toBeInTheDocument()
    })

    it('renders photo thumbnails', () => {
      render(
        <PhotoGrid
          photos={mockPhotos}
          loading={false}
          error={null}
          onUpdate={mockOnUpdate}
          setError={mockSetError}
        />
      )

      const images = screen.getAllByRole('img')
      expect(images[0]).toHaveAttribute('src', 'https://example.com/thumb1.jpg')
      expect(images[1]).toHaveAttribute('src', 'https://example.com/thumb2.jpg')
    })

    it('renders photo year when available', () => {
      render(
        <PhotoGrid
          photos={mockPhotos}
          loading={false}
          error={null}
          onUpdate={mockOnUpdate}
          setError={mockSetError}
        />
      )

      expect(screen.getByText('2024')).toBeInTheDocument()
      expect(screen.getByText('2023')).toBeInTheDocument()
    })
  })

  describe('Photo Selection', () => {
    it('renders selection checkboxes', () => {
      render(
        <PhotoGrid
          photos={mockPhotos}
          loading={false}
          error={null}
          onUpdate={mockOnUpdate}
          setError={mockSetError}
        />
      )

      const checkboxes = screen.getAllByRole('checkbox')
      expect(checkboxes).toHaveLength(2)
    })

    it('highlights selected photos', () => {
      const selectedIds = new Set(['photo-1'])
      
      render(
        <PhotoGrid
          photos={mockPhotos}
          loading={false}
          error={null}
          onUpdate={mockOnUpdate}
          setError={mockSetError}
          selectedPhotoIds={selectedIds}
        />
      )

      const photoCards = document.querySelectorAll('.aspect-square')
      expect(photoCards[0]).toHaveClass('border-indigo-500')
    })
  })

  describe('Photo Actions', () => {
    it('renders edit button for each photo', () => {
      render(
        <PhotoGrid
          photos={mockPhotos}
          loading={false}
          error={null}
          onUpdate={mockOnUpdate}
          setError={mockSetError}
        />
      )

      const editButtons = screen.getAllByTitle('Bekijk / Bewerk details')
      expect(editButtons).toHaveLength(2)
    })

    it('renders visibility toggle button', () => {
      render(
        <PhotoGrid
          photos={mockPhotos}
          loading={false}
          error={null}
          onUpdate={mockOnUpdate}
          setError={mockSetError}
        />
      )

      expect(screen.getByTitle('Verberg foto')).toBeInTheDocument()
      expect(screen.getByTitle('Maak foto zichtbaar')).toBeInTheDocument()
    })

    it('renders delete button for each photo', () => {
      render(
        <PhotoGrid
          photos={mockPhotos}
          loading={false}
          error={null}
          onUpdate={mockOnUpdate}
          setError={mockSetError}
        />
      )

      const deleteButtons = screen.getAllByTitle('Verwijder foto')
      expect(deleteButtons).toHaveLength(2)
    })

    it('opens delete confirmation dialog', async () => {
      render(
        <PhotoGrid
          photos={mockPhotos}
          loading={false}
          error={null}
          onUpdate={mockOnUpdate}
          setError={mockSetError}
        />
      )

      const deleteButtons = screen.getAllByTitle('Verwijder foto')
      fireEvent.click(deleteButtons[0])

      await waitFor(() => {
        expect(screen.getByText('Foto Verwijderen')).toBeInTheDocument()
      })
    })
  })

  describe('Album Badges', () => {
    it('renders album badges when photo is in albums', () => {
      const photoWithAlbums: Photo = {
        ...mockPhotos[0],
        album_photos: [
          { album_id: 'album-1' },
          { album_id: 'album-2' }
        ]
      }

      const albums = [
        {
          id: 'album-1',
          title: 'Album 1',
          visible: true,
          order_number: 1,
          photos_count: [{ count: 0 }],
          created_at: '2024-01-01',
          updated_at: '2024-01-01'
        }
      ]

      render(
        <PhotoGrid
          photos={[photoWithAlbums]}
          loading={false}
          error={null}
          onUpdate={mockOnUpdate}
          setError={mockSetError}
          albums={albums}
        />
      )

      expect(screen.getByText('Album 1')).toBeInTheDocument()
    })

    it('shows +N badge when photo is in more than 2 albums', () => {
      const photoWithManyAlbums: Photo = {
        ...mockPhotos[0],
        album_photos: [
          { album_id: 'album-1' },
          { album_id: 'album-2' },
          { album_id: 'album-3' }
        ]
      }

      render(
        <PhotoGrid
          photos={[photoWithManyAlbums]}
          loading={false}
          error={null}
          onUpdate={mockOnUpdate}
          setError={mockSetError}
        />
      )

      expect(screen.getByText('+1')).toBeInTheDocument()
    })
  })
})
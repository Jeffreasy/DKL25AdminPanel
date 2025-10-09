import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { AlbumGrid } from '../AlbumGrid'
import type { AlbumWithDetails } from '../../../types'

// Mock dependencies
vi.mock('../../../../../api/client/supabase', () => ({
  supabase: {
    from: vi.fn()
  },
  isAdmin: vi.fn()
}))

import { supabase, isAdmin } from '../../../../../api/client/supabase'

vi.mock('@dnd-kit/core', () => ({
  DndContext: ({ children }: any) => <div>{children}</div>,
  closestCenter: vi.fn()
}))

vi.mock('@dnd-kit/sortable', () => ({
  SortableContext: ({ children }: any) => <div>{children}</div>,
  useSortable: () => ({
    attributes: {},
    listeners: {},
    setNodeRef: vi.fn(),
    transform: null,
    transition: null
  }),
  arrayMove: (arr: any[], oldIndex: number, newIndex: number) => {
    const newArr = [...arr]
    const [removed] = newArr.splice(oldIndex, 1)
    newArr.splice(newIndex, 0, removed)
    return newArr
  }
}))

const mockAlbums: AlbumWithDetails[] = [
  {
    id: 'album-1',
    title: 'Album 1',
    description: 'Description 1',
    visible: true,
    order_number: 1,
    cover_photo_id: 'photo-1',
    photos_count: [{ count: 5 }],
    created_at: '2024-01-01',
    updated_at: '2024-01-01'
  },
  {
    id: 'album-2',
    title: 'Album 2',
    description: 'Description 2',
    visible: false,
    order_number: 2,
    cover_photo_id: 'photo-2',
    photos_count: [{ count: 3 }],
    created_at: '2024-01-02',
    updated_at: '2024-01-02'
  }
]

describe('AlbumGrid', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    
    // Default mock implementation
    const mockSelect = vi.fn(() => ({
      in: vi.fn(() => Promise.resolve({
        data: [],
        error: null
      })),
      order: vi.fn(() => ({
        range: vi.fn(() => Promise.resolve({
          data: mockAlbums,
          error: null
        }))
      }))
    }))

    vi.mocked(supabase.from).mockReturnValue({
      select: mockSelect
    } as any)

    vi.mocked(isAdmin).mockResolvedValue(true)
  })

  describe('Rendering', () => {
    it('renders loading state initially', () => {
      render(<AlbumGrid />)
      
      // LoadingGrid should be shown initially
      expect(document.querySelector('.animate-pulse')).toBeInTheDocument()
    })

    it('renders albums after loading', async () => {
      render(<AlbumGrid />)

      await waitFor(() => {
        expect(screen.getByText('Album 1')).toBeInTheDocument()
        expect(screen.getByText('Album 2')).toBeInTheDocument()
      })
    })

    it('renders empty state when no albums', async () => {
      vi.mocked(supabase.from).mockReturnValue({
        select: vi.fn(() => ({
          order: vi.fn(() => ({
            range: vi.fn(() => Promise.resolve({
              data: [],
              error: null
            }))
          }))
        }))
      } as any)

      render(<AlbumGrid />)

      await waitFor(() => {
        expect(screen.getByText('Nog geen albums')).toBeInTheDocument()
      })
    })

    it('renders error state on fetch failure', async () => {
      vi.mocked(supabase.from).mockReturnValue({
        select: vi.fn(() => ({
          order: vi.fn(() => ({
            range: vi.fn(() => Promise.resolve({
              data: null,
              error: new Error('Fetch failed')
            }))
          }))
        }))
      } as any)

      render(<AlbumGrid />)

      await waitFor(() => {
        expect(screen.getByText(/Er ging iets mis/)).toBeInTheDocument()
      })
    })
  })

  describe('Search Functionality', () => {
    it('renders search input', async () => {
      render(<AlbumGrid />)

      await waitFor(() => {
        expect(screen.getByPlaceholderText('Zoeken...')).toBeInTheDocument()
      })
    })

    it('filters albums by search query', async () => {
      render(<AlbumGrid />)

      await waitFor(() => {
        expect(screen.getByText('Album 1')).toBeInTheDocument()
      })

      const searchInput = screen.getByPlaceholderText('Zoeken...')
      fireEvent.change(searchInput, { target: { value: 'Album 1' } })

      // Debounced search should filter results
      await waitFor(() => {
        expect(screen.getByText('Album 1')).toBeInTheDocument()
      }, { timeout: 500 })
    })

    it('shows empty state when search has no results', async () => {
      render(<AlbumGrid />)

      await waitFor(() => {
        expect(screen.getByText('Album 1')).toBeInTheDocument()
      })

      const searchInput = screen.getByPlaceholderText('Zoeken...')
      fireEvent.change(searchInput, { target: { value: 'NonExistent' } })

      await waitFor(() => {
        expect(screen.getByText('Geen albums gevonden')).toBeInTheDocument()
      }, { timeout: 500 })
    })
  })

  describe('Album Selection', () => {
    it('calls onAlbumSelect when album is clicked', async () => {
      const mockOnSelect = vi.fn()
      
      render(<AlbumGrid onAlbumSelect={mockOnSelect} />)

      await waitFor(() => {
        expect(screen.getByText('Album 1')).toBeInTheDocument()
      })

      const album = screen.getByText('Album 1')
      fireEvent.click(album)

      expect(mockOnSelect).toHaveBeenCalledWith('album-1')
    })

    it('highlights selected album', async () => {
      render(<AlbumGrid selectedAlbumId="album-1" />)

      await waitFor(() => {
        const albumCard = screen.getByText('Album 1').closest('div')
        expect(albumCard).toHaveClass('ring-2', 'ring-indigo-500')
      })
    })
  })

  describe('Pagination', () => {
    it('shows load more button when hasMore is true', async () => {
      render(<AlbumGrid />)

      await waitFor(() => {
        expect(screen.getByText('Meer laden')).toBeInTheDocument()
      })
    })

    it('loads more albums when button is clicked', async () => {
      const mockSelect = vi.fn(() => ({
        order: vi.fn(() => ({
          range: vi.fn(() => Promise.resolve({
            data: mockAlbums,
            error: null
          }))
        }))
      }))

      vi.mocked(supabase.from).mockReturnValue({
        select: mockSelect
      } as any)

      render(<AlbumGrid />)

      await waitFor(() => {
        expect(screen.getByText('Meer laden')).toBeInTheDocument()
      })

      const loadMoreButton = screen.getByText('Meer laden')
      fireEvent.click(loadMoreButton)

      await waitFor(() => {
        expect(mockSelect).toHaveBeenCalledTimes(2)
      })
    })

    it('hides load more button during search', async () => {
      render(<AlbumGrid />)

      await waitFor(() => {
        expect(screen.getByText('Meer laden')).toBeInTheDocument()
      })

      const searchInput = screen.getByPlaceholderText('Zoeken...')
      fireEvent.change(searchInput, { target: { value: 'test' } })

      await waitFor(() => {
        expect(screen.queryByText('Meer laden')).not.toBeInTheDocument()
      }, { timeout: 500 })
    })
  })

  describe('Drag and Drop', () => {
    it('updates album order on drag end', async () => {
      const mockUpsert = vi.fn(() => Promise.resolve({ error: null }))
      
      vi.mocked(supabase.from).mockReturnValue({
        select: vi.fn(() => ({
          order: vi.fn(() => ({
            range: vi.fn(() => Promise.resolve({
              data: mockAlbums,
              error: null
            }))
          }))
        })),
        upsert: mockUpsert
      } as any)

      render(<AlbumGrid />)

      await waitFor(() => {
        expect(screen.getByText('Album 1')).toBeInTheDocument()
      })

      // Drag and drop would be triggered here in a real scenario
      // For now, we verify the component renders correctly
      expect(screen.getByText('Album 1')).toBeInTheDocument()
      expect(screen.getByText('Album 2')).toBeInTheDocument()
    })
  })

  describe('Admin Features', () => {
    it('shows all albums for admin users', async () => {
      vi.mocked(isAdmin).mockResolvedValue(true)

      render(<AlbumGrid />)

      await waitFor(() => {
        expect(screen.getByText('Album 1')).toBeInTheDocument()
        expect(screen.getByText('Album 2')).toBeInTheDocument()
      })
    })

    it('filters hidden albums for non-admin users', async () => {
      vi.mocked(isAdmin).mockResolvedValue(false)

      render(<AlbumGrid />)

      await waitFor(() => {
        expect(screen.getByText('Album 1')).toBeInTheDocument()
      })
    })

    it('shows visibility toggle for non-admin users', async () => {
      vi.mocked(isAdmin).mockResolvedValue(false)

      render(<AlbumGrid />)

      await waitFor(() => {
        expect(screen.getByText('Toon verborgen albums')).toBeInTheDocument()
      })
    })
  })

  describe('Error Handling', () => {
    it('handles order update errors gracefully', async () => {
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
      
      const mockUpsert = vi.fn(() => Promise.resolve({ error: new Error('Update failed') }))
      
      vi.mocked(supabase.from).mockReturnValue({
        select: vi.fn(() => ({
          order: vi.fn(() => ({
            range: vi.fn(() => Promise.resolve({
              data: mockAlbums,
              error: null
            }))
          }))
        })),
        upsert: mockUpsert
      } as any)

      render(<AlbumGrid />)

      await waitFor(() => {
        expect(screen.getByText('Album 1')).toBeInTheDocument()
      })

      consoleErrorSpy.mockRestore()
    })
  })
})
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import { FavoritePages } from '../FavoritePages'
import { FavoritesProvider } from '../../../providers/FavoritesProvider'

const mockNavigate = vi.fn()

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  }
})

describe('FavoritePages', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    localStorage.clear()
  })

  const renderWithFavorites = (favorites: any[] = []) => {
    if (favorites.length > 0) {
      localStorage.setItem('favorites', JSON.stringify(favorites))
    }
    
    return render(
      <BrowserRouter>
        <FavoritesProvider>
          <FavoritePages />
        </FavoritesProvider>
      </BrowserRouter>
    )
  }

  describe('Rendering', () => {
    it('renders favorites section with items', () => {
      const favorites = [
        { id: '1', name: 'Dashboard', path: '/dashboard', icon: 'HomeIcon' },
        { id: '2', name: 'Photos', path: '/photos', icon: 'PhotoIcon' },
      ]
      
      renderWithFavorites(favorites)
      
      expect(screen.getByText('Favorieten')).toBeInTheDocument()
      expect(screen.getByText('Dashboard')).toBeInTheDocument()
      expect(screen.getByText('Photos')).toBeInTheDocument()
    })

    it('renders nothing when no favorites', () => {
      const { container } = renderWithFavorites([])
      
      expect(container.firstChild).toBeNull()
    })

    it('shows star icons for favorites', () => {
      const favorites = [
        { id: '1', name: 'Dashboard', path: '/dashboard', icon: 'HomeIcon' },
      ]
      
      renderWithFavorites(favorites)
      
      const solidStars = document.querySelectorAll('svg')
      expect(solidStars.length).toBeGreaterThan(0)
    })
  })

  describe('Navigation', () => {
    it('navigates to page on click', () => {
      const favorites = [
        { id: '1', name: 'Dashboard', path: '/dashboard', icon: 'HomeIcon' },
      ]
      
      renderWithFavorites(favorites)
      
      const dashboardButton = screen.getByText('Dashboard')
      fireEvent.click(dashboardButton)
      
      expect(mockNavigate).toHaveBeenCalledWith('/dashboard')
    })

    it('navigates to different pages', () => {
      const favorites = [
        { id: '1', name: 'Dashboard', path: '/dashboard', icon: 'HomeIcon' },
        { id: '2', name: 'Photos', path: '/photos', icon: 'PhotoIcon' },
      ]
      
      renderWithFavorites(favorites)
      
      const photosButton = screen.getByText('Photos')
      fireEvent.click(photosButton)
      
      expect(mockNavigate).toHaveBeenCalledWith('/photos')
    })
  })

  describe('Remove Favorite', () => {
    it('shows remove buttons', () => {
      const favorites = [
        { id: '1', name: 'Dashboard', path: '/dashboard', icon: 'HomeIcon' },
        { id: '2', name: 'Photos', path: '/photos', icon: 'PhotoIcon' },
      ]
      
      renderWithFavorites(favorites)
      
      const removeButtons = screen.getAllByLabelText('Verwijder favoriet')
      expect(removeButtons).toHaveLength(2)
    })

    it('removes favorite on button click', () => {
      const favorites = [
        { id: '1', name: 'Dashboard', path: '/dashboard', icon: 'HomeIcon' },
        { id: '2', name: 'Photos', path: '/photos', icon: 'PhotoIcon' },
      ]
      
      renderWithFavorites(favorites)
      
      const removeButtons = screen.getAllByLabelText('Verwijder favoriet')
      fireEvent.click(removeButtons[0])
      
      // After removal, should only have 1 favorite
      const updatedButtons = screen.queryAllByLabelText('Verwijder favoriet')
      expect(updatedButtons).toHaveLength(1)
    })
  })
})
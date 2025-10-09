import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import { QuickActions } from '../QuickActions'

const mockNavigate = vi.fn()
const mockHasPermission = vi.fn()

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  }
})

vi.mock('../../../hooks/usePermissions', () => ({
  usePermissions: () => ({
    hasPermission: mockHasPermission,
  }),
}))

// Mock lazy-loaded components
vi.mock('../../../features/sponsors/components/SponsorForm', () => ({
  SponsorForm: ({ onComplete, onCancel }: any) => (
    <div data-testid="sponsor-form">
      <button onClick={onComplete}>Complete</button>
      <button onClick={onCancel}>Cancel</button>
    </div>
  ),
}))

vi.mock('../../../features/photos/components/forms/PhotoForm', () => ({
  PhotoForm: ({ onComplete, onCancel }: any) => (
    <div data-testid="photo-form">
      <button onClick={onComplete}>Complete</button>
      <button onClick={onCancel}>Cancel</button>
    </div>
  ),
}))

vi.mock('../../../features/albums/components/forms/AlbumForm', () => ({
  AlbumForm: ({ onComplete, onCancel }: any) => (
    <div data-testid="album-form">
      <button onClick={onComplete}>Complete</button>
      <button onClick={onCancel}>Cancel</button>
    </div>
  ),
}))

vi.mock('../../../features/partners/components/PartnerForm', () => ({
  PartnerForm: ({ onComplete, onCancel }: any) => (
    <div data-testid="partner-form">
      <button onClick={onComplete}>Complete</button>
      <button onClick={onCancel}>Cancel</button>
    </div>
  ),
}))

describe('QuickActions', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockHasPermission.mockReturnValue(true)
  })

  const renderQuickActions = () => {
    return render(
      <BrowserRouter>
        <QuickActions />
      </BrowserRouter>
    )
  }

  describe('Rendering', () => {
    it('renders quick actions button', () => {
      renderQuickActions()
      
      const button = screen.getByRole('button', { name: /open snelle acties/i })
      expect(button).toBeInTheDocument()
    })

    it('shows plus icon', () => {
      renderQuickActions()
      
      const icon = document.querySelector('svg')
      expect(icon).toBeInTheDocument()
    })
  })

  describe('Menu Interaction', () => {
    it('opens menu on button click', async () => {
      renderQuickActions()
      
      const button = screen.getByRole('button', { name: /open snelle acties/i })
      fireEvent.click(button)
      
      await waitFor(() => {
        expect(screen.getByText('Snelle acties')).toBeInTheDocument()
      })
    })

    it('shows menu description', async () => {
      renderQuickActions()
      
      const button = screen.getByRole('button', { name: /open snelle acties/i })
      fireEvent.click(button)
      
      await waitFor(() => {
        expect(screen.getByText('Voer snel taken uit')).toBeInTheDocument()
      })
    })

    it('displays all permitted actions', async () => {
      renderQuickActions()
      
      const button = screen.getByRole('button', { name: /open snelle acties/i })
      fireEvent.click(button)
      
      await waitFor(() => {
        expect(screen.getByText("Foto's toevoegen")).toBeInTheDocument()
        expect(screen.getByText('Album maken')).toBeInTheDocument()
        expect(screen.getByText('Partner toevoegen')).toBeInTheDocument()
        expect(screen.getByText('Sponsor toevoegen')).toBeInTheDocument()
        expect(screen.getByText('Instellingen')).toBeInTheDocument()
      })
    })
  })

  describe('Permission Filtering', () => {
    it('filters actions based on permissions', async () => {
      mockHasPermission.mockImplementation((resource: string) => {
        return resource === 'photo' // Only photo permission
      })

      renderQuickActions()
      
      const button = screen.getByRole('button', { name: /open snelle acties/i })
      fireEvent.click(button)
      
      await waitFor(() => {
        expect(screen.getByText("Foto's toevoegen")).toBeInTheDocument()
        expect(screen.queryByText('Album maken')).not.toBeInTheDocument()
        expect(screen.queryByText('Partner toevoegen')).not.toBeInTheDocument()
        expect(screen.queryByText('Sponsor toevoegen')).not.toBeInTheDocument()
      })
    })

    it('shows settings action without permission check', async () => {
      mockHasPermission.mockReturnValue(false)

      renderQuickActions()
      
      const button = screen.getByRole('button', { name: /open snelle acties/i })
      fireEvent.click(button)
      
      await waitFor(() => {
        expect(screen.getByText('Instellingen')).toBeInTheDocument()
      })
    })
  })

  describe('Navigation Actions', () => {
    it('navigates to settings on settings click', async () => {
      renderQuickActions()
      
      const button = screen.getByRole('button', { name: /open snelle acties/i })
      fireEvent.click(button)
      
      await waitFor(() => {
        const settingsButton = screen.getByText('Instellingen')
        fireEvent.click(settingsButton)
      })
      
      expect(mockNavigate).toHaveBeenCalledWith('/settings')
    })
  })

  describe('Modal Actions', () => {
    it('opens photo form modal', async () => {
      renderQuickActions()
      
      const button = screen.getByRole('button', { name: /open snelle acties/i })
      fireEvent.click(button)
      
      await waitFor(() => {
        const photoButton = screen.getByText("Foto's toevoegen")
        fireEvent.click(photoButton)
      })
      
      await waitFor(() => {
        expect(screen.getByTestId('photo-form')).toBeInTheDocument()
      })
    })

    it('opens album form modal', async () => {
      renderQuickActions()
      
      const button = screen.getByRole('button', { name: /open snelle acties/i })
      fireEvent.click(button)
      
      await waitFor(() => {
        const albumButton = screen.getByText('Album maken')
        fireEvent.click(albumButton)
      })
      
      await waitFor(() => {
        expect(screen.getByTestId('album-form')).toBeInTheDocument()
      })
    })

    it('opens sponsor form modal', async () => {
      renderQuickActions()
      
      const button = screen.getByRole('button', { name: /open snelle acties/i })
      fireEvent.click(button)
      
      await waitFor(() => {
        const sponsorButton = screen.getByText('Sponsor toevoegen')
        fireEvent.click(sponsorButton)
      })
      
      await waitFor(() => {
        expect(screen.getByTestId('sponsor-form')).toBeInTheDocument()
      })
    })

    it('opens partner form modal', async () => {
      renderQuickActions()
      
      const button = screen.getByRole('button', { name: /open snelle acties/i })
      fireEvent.click(button)
      
      await waitFor(() => {
        const partnerButton = screen.getByText('Partner toevoegen')
        fireEvent.click(partnerButton)
      })
      
      await waitFor(() => {
        expect(screen.getByTestId('partner-form')).toBeInTheDocument()
      })
    })

    it('closes modal on complete', async () => {
      renderQuickActions()
      
      const button = screen.getByRole('button', { name: /open snelle acties/i })
      fireEvent.click(button)
      
      await waitFor(() => {
        const photoButton = screen.getByText("Foto's toevoegen")
        fireEvent.click(photoButton)
      })
      
      await waitFor(() => {
        const completeButton = screen.getByText('Complete')
        fireEvent.click(completeButton)
      })
      
      await waitFor(() => {
        expect(screen.queryByTestId('photo-form')).not.toBeInTheDocument()
      })
    })

    it('closes modal on cancel', async () => {
      renderQuickActions()
      
      const button = screen.getByRole('button', { name: /open snelle acties/i })
      fireEvent.click(button)
      
      await waitFor(() => {
        const albumButton = screen.getByText('Album maken')
        fireEvent.click(albumButton)
      })
      
      await waitFor(() => {
        const cancelButton = screen.getByText('Cancel')
        fireEvent.click(cancelButton)
      })
      
      await waitFor(() => {
        expect(screen.queryByTestId('album-form')).not.toBeInTheDocument()
      })
    })
  })
})
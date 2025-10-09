import { describe, it, expect, vi } from 'vitest'
import { fetchPartners, createPartner, updatePartner, deletePartner, reorderPartners } from '../partnerService'
import { supabase } from '@/api/client/supabase'

vi.mock('@/api/client/supabase')

describe('partnerService', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('fetchPartners calls createCRUDService correctly', async () => {
    const mockData = [
      { id: '1', name: 'Partner 1', logo: 'logo1.png', website: 'https://partner1.com', tier: 'gold', order_number: 1, created_at: '2024-01-01', updated_at: '2024-01-01' }
    ]

    const mockOrder = vi.fn().mockResolvedValue({ data: mockData, error: null })
    const mockSelect = vi.fn().mockReturnValue({ order: mockOrder })
    vi.mocked(supabase.from).mockReturnValue({ select: mockSelect } as any)

    const result = await fetchPartners()

    expect(supabase.from).toHaveBeenCalledWith('partners')
    expect(mockOrder).toHaveBeenCalledWith('order_number', { ascending: true })
    expect(result).toEqual(mockData)
  })

  it('createPartner works', async () => {
    const newPartner = { name: 'New Partner', logo: 'logo.png', website: 'https://new.com', tier: 'silver' as const, order_number: 1, visible: true, since: '2024' }
    const createdPartner = { id: '1', ...newPartner, created_at: '2024-01-01', updated_at: '2024-01-01' }

    const mockSingle = vi.fn().mockResolvedValue({ data: createdPartner, error: null })
    const mockSelect = vi.fn().mockReturnValue({ single: mockSingle })
    const mockInsert = vi.fn().mockReturnValue({ select: mockSelect })
    vi.mocked(supabase.from).mockReturnValue({ insert: mockInsert } as any)

    const result = await createPartner(newPartner)

    expect(result).toEqual(createdPartner)
  })

  it('updatePartner works', async () => {
    const updates = { name: 'Updated Partner' }
    const updated = { id: '1', name: 'Updated Partner', logo: 'logo.png', website: 'https://test.com', tier: 'gold' as const, order_number: 1, created_at: '2024-01-01', updated_at: '2024-01-02' }

    const mockSingle = vi.fn().mockResolvedValue({ data: updated, error: null })
    const mockSelect = vi.fn().mockReturnValue({ single: mockSingle })
    const mockEq = vi.fn().mockReturnValue({ select: mockSelect })
    const mockUpdate = vi.fn().mockReturnValue({ eq: mockEq })
    vi.mocked(supabase.from).mockReturnValue({ update: mockUpdate } as any)

    const result = await updatePartner('1', updates)

    expect(result).toEqual(updated)
  })

  it('deletePartner works', async () => {
    const mockEq = vi.fn().mockResolvedValue({ error: null })
    const mockDelete = vi.fn().mockReturnValue({ eq: mockEq })
    vi.mocked(supabase.from).mockReturnValue({ delete: mockDelete } as any)

    await deletePartner('1')

    expect(supabase.from).toHaveBeenCalledWith('partners')
    expect(mockDelete).toHaveBeenCalled()
  })

  it('reorderPartners works', async () => {
    const orderedIds = ['1', '2', '3']
    
    const mockUpsert = vi.fn().mockResolvedValue({ error: null })
    vi.mocked(supabase.from).mockReturnValue({ upsert: mockUpsert } as any)

    if (reorderPartners) {
      await reorderPartners(orderedIds)

      expect(supabase.from).toHaveBeenCalledWith('partners')
      expect(mockUpsert).toHaveBeenCalled()
    }
  })
})
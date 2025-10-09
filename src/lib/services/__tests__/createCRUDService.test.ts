import { describe, it, expect, vi, beforeEach } from 'vitest'
import { createCRUDService } from '../createCRUDService'
import { supabase } from '@/api/client/supabase'

vi.mock('@/api/client/supabase', () => ({
  supabase: {
    from: vi.fn(),
  },
}))

interface TestEntity {
  id: string
  name: string
  created_at: string
  updated_at: string
}

describe('createCRUDService', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Service Creation', () => {
    it('creates service with required config', () => {
      const service = createCRUDService<TestEntity>({
        tableName: 'test_table',
      })

      expect(service).toBeDefined()
      expect(service.fetchAll).toBeDefined()
      expect(service.fetchById).toBeDefined()
      expect(service.create).toBeDefined()
      expect(service.update).toBeDefined()
      expect(service.delete).toBeDefined()
    })

    it('creates service with custom order config', () => {
      const service = createCRUDService<TestEntity>({
        tableName: 'test_table',
        orderBy: 'name',
        orderDirection: 'asc',
      })

      expect(service).toBeDefined()
    })
  })

  describe('fetchAll', () => {
    it('fetches all items successfully', async () => {
      const mockData: TestEntity[] = [
        { id: '1', name: 'Item 1', created_at: '2024-01-01', updated_at: '2024-01-01' },
        { id: '2', name: 'Item 2', created_at: '2024-01-02', updated_at: '2024-01-02' },
      ]

      const mockOrder = vi.fn().mockResolvedValue({ data: mockData, error: null })
      const mockSelect = vi.fn().mockReturnValue({ order: mockOrder })
      vi.mocked(supabase.from).mockReturnValue({
        select: mockSelect,
      } as any)

      const service = createCRUDService<TestEntity>({
        tableName: 'test_table',
        orderBy: 'created_at',
      })

      const result = await service.fetchAll()

      expect(supabase.from).toHaveBeenCalledWith('test_table')
      expect(result).toEqual(mockData)
    })

    it('handles fetch error', async () => {
      const mockError = new Error('Database error')
      const mockOrder = vi.fn().mockResolvedValue({ data: null, error: mockError })
      const mockSelect = vi.fn().mockReturnValue({ order: mockOrder })
      vi.mocked(supabase.from).mockReturnValue({
        select: mockSelect,
      } as any)

      const service = createCRUDService<TestEntity>({
        tableName: 'test_table',
      })

      await expect(service.fetchAll()).rejects.toThrow('Kon test_table niet ophalen')
    })

    it('uses custom order configuration', async () => {
      const mockData: TestEntity[] = []
      const mockOrder = vi.fn().mockResolvedValue({ data: mockData, error: null })
      const mockSelect = vi.fn().mockReturnValue({ order: mockOrder })
      vi.mocked(supabase.from).mockReturnValue({
        select: mockSelect,
      } as any)

      const service = createCRUDService<TestEntity>({
        tableName: 'test_table',
        orderBy: 'name',
        orderDirection: 'asc',
      })

      await service.fetchAll()

      expect(mockOrder).toHaveBeenCalledWith('name', { ascending: true })
    })

    it('defaults to ascending order', async () => {
      const mockData: TestEntity[] = []
      const mockOrder = vi.fn().mockResolvedValue({ data: mockData, error: null })
      const mockSelect = vi.fn().mockReturnValue({ order: mockOrder })
      vi.mocked(supabase.from).mockReturnValue({
        select: mockSelect,
      } as any)

      const service = createCRUDService<TestEntity>({
        tableName: 'test_table',
        orderBy: 'created_at',
      })

      await service.fetchAll()

      expect(mockOrder).toHaveBeenCalledWith('created_at', { ascending: true })
    })
  })

  describe('fetchById', () => {
    it('fetches single item by id', async () => {
      const mockItem: TestEntity = {
        id: '1',
        name: 'Item 1',
        created_at: '2024-01-01',
        updated_at: '2024-01-01',
      }

      const mockSingle = vi.fn().mockResolvedValue({ data: mockItem, error: null })
      const mockEq = vi.fn().mockReturnValue({ single: mockSingle })
      vi.mocked(supabase.from).mockReturnValue({
        select: vi.fn().mockReturnValue({ eq: mockEq }),
      } as any)

      const service = createCRUDService<TestEntity>({
        tableName: 'test_table',
      })

      const result = await service.fetchById('1')

      expect(supabase.from).toHaveBeenCalledWith('test_table')
      expect(mockEq).toHaveBeenCalledWith('id', '1')
      expect(result).toEqual(mockItem)
    })

    it('handles not found error', async () => {
      const mockError = new Error('Not found')
      const mockSingle = vi.fn().mockResolvedValue({ data: null, error: mockError })
      const mockEq = vi.fn().mockReturnValue({ single: mockSingle })
      vi.mocked(supabase.from).mockReturnValue({
        select: vi.fn().mockReturnValue({ eq: mockEq }),
      } as any)

      const service = createCRUDService<TestEntity>({
        tableName: 'test_table',
      })

      await expect(service.fetchById('999')).rejects.toThrow('Kon test_table niet ophalen')
    })
  })

  describe('create', () => {
    it('creates new item successfully', async () => {
      const newItem = { name: 'New Item' }
      const createdItem: TestEntity = {
        id: '1',
        name: 'New Item',
        created_at: '2024-01-01',
        updated_at: '2024-01-01',
      }

      const mockSingle = vi.fn().mockResolvedValue({ data: createdItem, error: null })
      const mockSelect = vi.fn().mockReturnValue({ single: mockSingle })
      const mockInsert = vi.fn().mockReturnValue({ select: mockSelect })
      vi.mocked(supabase.from).mockReturnValue({
        insert: mockInsert,
      } as any)

      const service = createCRUDService<TestEntity>({
        tableName: 'test_table',
      })

      const result = await service.create(newItem)

      expect(supabase.from).toHaveBeenCalledWith('test_table')
      expect(mockInsert).toHaveBeenCalledWith([newItem])
      expect(result).toEqual(createdItem)
    })

    it('handles create error', async () => {
      const mockError = new Error('Validation error')
      const mockSingle = vi.fn().mockResolvedValue({ data: null, error: mockError })
      const mockSelect = vi.fn().mockReturnValue({ single: mockSingle })
      const mockInsert = vi.fn().mockReturnValue({ select: mockSelect })
      vi.mocked(supabase.from).mockReturnValue({
        insert: mockInsert,
      } as any)

      const service = createCRUDService<TestEntity>({
        tableName: 'test_table',
      })

      await expect(service.create({ name: 'Test' })).rejects.toThrow('Kon test_table niet aanmaken')
    })

    it('handles unique constraint violation', async () => {
      const mockError = { code: '23505', message: 'Duplicate key' }
      const mockSingle = vi.fn().mockResolvedValue({ data: null, error: mockError })
      const mockSelect = vi.fn().mockReturnValue({ single: mockSingle })
      const mockInsert = vi.fn().mockReturnValue({ select: mockSelect })
      vi.mocked(supabase.from).mockReturnValue({
        insert: mockInsert,
      } as any)

      const service = createCRUDService<TestEntity>({
        tableName: 'test_table',
      })

      await expect(service.create({ name: 'Duplicate' })).rejects.toThrow()
    })
  })

  describe('update', () => {
    it('updates item successfully', async () => {
      const updates = { name: 'Updated Name' }
      const updatedItem: TestEntity = {
        id: '1',
        name: 'Updated Name',
        created_at: '2024-01-01',
        updated_at: '2024-01-02',
      }

      const mockSingle = vi.fn().mockResolvedValue({ data: updatedItem, error: null })
      const mockSelect = vi.fn().mockReturnValue({ single: mockSingle })
      const mockEq = vi.fn().mockReturnValue({ select: mockSelect })
      const mockUpdate = vi.fn().mockReturnValue({ eq: mockEq })
      vi.mocked(supabase.from).mockReturnValue({
        update: mockUpdate,
      } as any)

      const service = createCRUDService<TestEntity>({
        tableName: 'test_table',
      })

      const result = await service.update('1', updates)

      expect(supabase.from).toHaveBeenCalledWith('test_table')
      expect(mockEq).toHaveBeenCalledWith('id', '1')
      expect(result).toEqual(updatedItem)
    })

    it('handles update error', async () => {
      const mockError = new Error('Update failed')
      const mockSingle = vi.fn().mockResolvedValue({ data: null, error: mockError })
      const mockSelect = vi.fn().mockReturnValue({ single: mockSingle })
      const mockEq = vi.fn().mockReturnValue({ select: mockSelect })
      const mockUpdate = vi.fn().mockReturnValue({ eq: mockEq })
      vi.mocked(supabase.from).mockReturnValue({
        update: mockUpdate,
      } as any)

      const service = createCRUDService<TestEntity>({
        tableName: 'test_table',
      })

      await expect(service.update('1', { name: 'Test' })).rejects.toThrow('Kon test_table niet bijwerken')
    })

    it('handles partial updates', async () => {
      const partialUpdate = { name: 'Only Name' }
      const updatedItem: TestEntity = {
        id: '1',
        name: 'Only Name',
        created_at: '2024-01-01',
        updated_at: '2024-01-02',
      }

      const mockSingle = vi.fn().mockResolvedValue({ data: updatedItem, error: null })
      const mockSelect = vi.fn().mockReturnValue({ single: mockSingle })
      const mockEq = vi.fn().mockReturnValue({ select: mockSelect })
      const mockUpdate = vi.fn().mockReturnValue({ eq: mockEq })
      vi.mocked(supabase.from).mockReturnValue({
        update: mockUpdate,
      } as any)

      const service = createCRUDService<TestEntity>({
        tableName: 'test_table',
      })

      const result = await service.update('1', partialUpdate)

      expect(result).toEqual(updatedItem)
    })
  })

  describe('delete', () => {
    it('deletes item successfully', async () => {
      const mockEq = vi.fn().mockResolvedValue({ error: null })
      const mockDelete = vi.fn().mockReturnValue({ eq: mockEq })
      vi.mocked(supabase.from).mockReturnValue({
        delete: mockDelete,
      } as any)

      const service = createCRUDService<TestEntity>({
        tableName: 'test_table',
      })

      await service.delete('1')

      expect(supabase.from).toHaveBeenCalledWith('test_table')
      expect(mockDelete).toHaveBeenCalled()
      expect(mockEq).toHaveBeenCalledWith('id', '1')
    })

    it('handles delete error', async () => {
      const mockError = new Error('Delete failed')
      const mockEq = vi.fn().mockResolvedValue({ error: mockError })
      const mockDelete = vi.fn().mockReturnValue({ eq: mockEq })
      vi.mocked(supabase.from).mockReturnValue({
        delete: mockDelete,
      } as any)

      const service = createCRUDService<TestEntity>({
        tableName: 'test_table',
      })

      await expect(service.delete('1')).rejects.toThrow('Kon test_table niet verwijderen')
    })

    it('handles foreign key constraint', async () => {
      const mockError = { code: '23503', message: 'Foreign key violation' }
      const mockEq = vi.fn().mockResolvedValue({ error: mockError })
      const mockDelete = vi.fn().mockReturnValue({ eq: mockEq })
      vi.mocked(supabase.from).mockReturnValue({
        delete: mockDelete,
      } as any)

      const service = createCRUDService<TestEntity>({
        tableName: 'test_table',
      })

      await expect(service.delete('1')).rejects.toThrow()
    })
  })

  describe('Multiple Services', () => {
    it('creates independent services for different tables', async () => {
      const service1 = createCRUDService<TestEntity>({ tableName: 'table1' })
      const service2 = createCRUDService<TestEntity>({ tableName: 'table2' })

      const mockData: TestEntity[] = []
      const mockSelect = vi.fn().mockResolvedValue({ data: mockData, error: null })
      const mockOrder = vi.fn().mockReturnValue({ select: mockSelect })
      vi.mocked(supabase.from).mockReturnValue({
        select: vi.fn().mockReturnValue({ order: mockOrder }),
      } as any)

      await service1.fetchAll()
      expect(supabase.from).toHaveBeenCalledWith('table1')

      await service2.fetchAll()
      expect(supabase.from).toHaveBeenCalledWith('table2')
    })

    it('maintains separate configurations', async () => {
      const service1 = createCRUDService<TestEntity>({
        tableName: 'table1',
        orderBy: 'name',
        orderDirection: 'asc',
      })

      const service2 = createCRUDService<TestEntity>({
        tableName: 'table2',
        orderBy: 'created_at',
        orderDirection: 'desc',
      })

      const mockData: TestEntity[] = []
      const mockSelect = vi.fn().mockResolvedValue({ data: mockData, error: null })
      const mockOrder = vi.fn().mockReturnValue({ select: mockSelect })
      vi.mocked(supabase.from).mockReturnValue({
        select: vi.fn().mockReturnValue({ order: mockOrder }),
      } as any)

      await service1.fetchAll()
      expect(mockOrder).toHaveBeenCalledWith('name', { ascending: true })

      vi.clearAllMocks()
      vi.mocked(supabase.from).mockReturnValue({
        select: vi.fn().mockReturnValue({ order: mockOrder }),
      } as any)

      await service2.fetchAll()
      expect(mockOrder).toHaveBeenCalledWith('created_at', { ascending: false })
    })
  })

  describe('Edge Cases', () => {
    it('handles empty result set', async () => {
      const mockData: TestEntity[] = []
      const mockSelect = vi.fn().mockResolvedValue({ data: mockData, error: null })
      const mockOrder = vi.fn().mockReturnValue({ select: mockSelect })
      vi.mocked(supabase.from).mockReturnValue({
        select: vi.fn().mockReturnValue({ order: mockOrder }),
      } as any)

      const service = createCRUDService<TestEntity>({
        tableName: 'test_table',
      })

      const result = await service.fetchAll()
      expect(result).toEqual([])
    })

    it('handles null data response', async () => {
      const mockSelect = vi.fn().mockResolvedValue({ data: null, error: null })
      const mockOrder = vi.fn().mockReturnValue({ select: mockSelect })
      vi.mocked(supabase.from).mockReturnValue({
        select: vi.fn().mockReturnValue({ order: mockOrder }),
      } as any)

      const service = createCRUDService<TestEntity>({
        tableName: 'test_table',
      })

      const result = await service.fetchAll()
      expect(result).toEqual([])
    })

    it('handles special characters in table name', async () => {
      const mockData: TestEntity[] = []
      const mockSelect = vi.fn().mockResolvedValue({ data: mockData, error: null })
      const mockOrder = vi.fn().mockReturnValue({ select: mockSelect })
      vi.mocked(supabase.from).mockReturnValue({
        select: vi.fn().mockReturnValue({ order: mockOrder }),
      } as any)

      const service = createCRUDService<TestEntity>({
        tableName: 'test_table_with_underscores',
      })

      await service.fetchAll()
      expect(supabase.from).toHaveBeenCalledWith('test_table_with_underscores')
    })
  })
})
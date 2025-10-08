import { supabase } from '../../api/client/supabase'
import type { BaseEntity } from '../../types/base'

/**
 * Configuration for CRUD service
 */
export interface CRUDServiceConfig<T extends BaseEntity> {
  tableName: string
  orderBy?: keyof T
  orderDirection?: 'asc' | 'desc'
  selectQuery?: string
  mapFromDB?: (data: any) => T
  mapToDB?: (data: Partial<T>) => any
}

/**
 * Generic CRUD service interface
 */
export interface CRUDService<T extends BaseEntity> {
  fetchAll: () => Promise<T[]>
  fetchById: (id: string) => Promise<T | null>
  create: (data: Omit<T, 'id' | 'created_at' | 'updated_at'>) => Promise<T>
  update: (id: string, data: Partial<Omit<T, 'id' | 'created_at' | 'updated_at'>>) => Promise<T>
  delete: (id: string) => Promise<void>
  reorder?: (orderedIds: string[]) => Promise<void>
}

/**
 * Creates a generic CRUD service for any entity type
 * Reduces code duplication across service files
 * 
 * @example
 * const partnerService = createCRUDService<Partner>({
 *   tableName: 'partners',
 *   orderBy: 'order_number'
 * })
 */
export function createCRUDService<T extends BaseEntity>(
  config: CRUDServiceConfig<T>
): CRUDService<T> {
  const {
    tableName,
    orderBy = 'created_at' as keyof T,
    orderDirection = 'asc',
    selectQuery = '*',
    mapFromDB = (data: any) => data as T,
    mapToDB = (data: any) => data
  } = config

  return {
    /**
     * Fetch all records
     */
    fetchAll: async (): Promise<T[]> => {
      const { data, error } = await supabase
        .from(tableName)
        .select(selectQuery)
        .order(orderBy as string, { ascending: orderDirection === 'asc' })

      if (error) {
        console.error(`Error fetching ${tableName}:`, error)
        throw new Error(`Kon ${tableName} niet ophalen`)
      }

      return (data || []).map(mapFromDB)
    },

    /**
     * Fetch a single record by ID
     */
    fetchById: async (id: string): Promise<T | null> => {
      const { data, error } = await supabase
        .from(tableName)
        .select(selectQuery)
        .eq('id', id)
        .single()

      if (error) {
        if (error.code === 'PGRST116') {
          return null // Not found
        }
        console.error(`Error fetching ${tableName} by id:`, error)
        throw new Error(`Kon ${tableName} niet ophalen`)
      }

      return data ? mapFromDB(data) : null
    },

    /**
     * Create a new record
     */
    create: async (data: Omit<T, 'id' | 'created_at' | 'updated_at'>): Promise<T> => {
      const mappedData = mapToDB(data as any)
      
      const { data: result, error } = await supabase
        .from(tableName)
        .insert([mappedData])
        .select()
        .single()

      if (error) {
        console.error(`Error creating ${tableName}:`, error)
        throw new Error(`Kon ${tableName} niet aanmaken`)
      }

      return mapFromDB(result)
    },

    /**
     * Update an existing record
     */
    update: async (
      id: string,
      updates: Partial<Omit<T, 'id' | 'created_at' | 'updated_at'>>
    ): Promise<T> => {
      const mappedUpdates = mapToDB({
        ...updates,
        updated_at: new Date().toISOString()
      } as any)

      const { data, error } = await supabase
        .from(tableName)
        .update(mappedUpdates)
        .eq('id', id)
        .select()
        .single()

      if (error) {
        console.error(`Error updating ${tableName}:`, error)
        throw new Error(`Kon ${tableName} niet bijwerken`)
      }

      return mapFromDB(data)
    },

    /**
     * Delete a record
     */
    delete: async (id: string): Promise<void> => {
      const { error } = await supabase
        .from(tableName)
        .delete()
        .eq('id', id)

      if (error) {
        console.error(`Error deleting ${tableName}:`, error)
        throw new Error(`Kon ${tableName} niet verwijderen`)
      }
    },

    /**
     * Reorder records (only available if entity has order_number field)
     */
    reorder: async (orderedIds: string[]): Promise<void> => {
      const updates = orderedIds.map((id, index) => ({
        id,
        order_number: index,
        updated_at: new Date().toISOString()
      }))

      const { error } = await supabase
        .from(tableName)
        .upsert(updates)

      if (error) {
        console.error(`Error reordering ${tableName}:`, error)
        throw new Error(`Kon ${tableName} niet herordenen`)
      }
    }
  }
}

/**
 * Helper to create a service with error wrapping
 */
export function withErrorHandling<T>(
  fn: () => Promise<T>,
  errorMessage?: string
): Promise<T> {
  return fn().catch((error) => {
    console.error(errorMessage || 'Service error:', error)
    throw error
  })
}
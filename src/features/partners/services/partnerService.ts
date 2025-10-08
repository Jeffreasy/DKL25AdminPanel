import { createCRUDService } from '../../../lib/services/createCRUDService'
import type { Partner } from '../types'

/**
 * Partner service using generic CRUD factory
 * Significantly reduces code duplication
 */
const baseService = createCRUDService<Partner>({
  tableName: 'partners',
  orderBy: 'order_number',
  orderDirection: 'asc'
})

// Export all CRUD operations
export const {
  fetchAll: fetchPartners,
  fetchById: fetchPartnerById,
  create: createPartner,
  update: updatePartner,
  delete: deletePartner,
  reorder: reorderPartners
} = baseService
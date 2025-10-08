import type { LogoEntity, FormData, UpdateData } from '../../types/base'

/**
 * Partner entity extending base LogoEntity
 * Reduces redundancy by using shared base types
 */
export interface Partner extends LogoEntity {
  tier: 'bronze' | 'silver' | 'gold'
  since: string
}

/**
 * Form data for creating/editing partners
 */
export type PartnerFormData = FormData<Partner>

/**
 * Data for creating a new partner
 */
export type CreatePartnerData = PartnerFormData

/**
 * Data for updating an existing partner
 */
export type UpdatePartnerData = UpdateData<Partner>
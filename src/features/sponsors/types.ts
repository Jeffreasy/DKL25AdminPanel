import type { OrderedEntity, FormData, UpdateData } from '../../types/base'

/**
 * Sponsor entity with camelCase naming convention
 * Note: Does not extend base types due to naming convention differences
 */
export interface Sponsor {
  id: string
  name: string
  description: string
  logoUrl: string
  websiteUrl?: string
  visible: boolean
  order: number
  isActive: boolean
  created_at: string
  updated_at: string
  createdAt: string
  updatedAt: string
}

/**
 * Form data for creating/editing sponsors
 */
export interface SponsorFormData {
  name: string
  description: string
  logoUrl: string
  websiteUrl?: string
  order: number
  isActive: boolean
  visible: boolean
}

/**
 * Data for updating an existing sponsor
 */
export type UpdateSponsorData = Partial<SponsorFormData>
import type { Database } from './supabase'

type PartnerRow = Database['public']['Tables']['partners']['Row']
type PartnerTier = PartnerRow['tier']

export type { PartnerRow, PartnerTier } 
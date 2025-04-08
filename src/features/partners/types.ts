export interface Partner {
  id: string
  name: string
  logo?: string
  website?: string
  description?: string
  tier: 'bronze' | 'silver' | 'gold'
  since: string
  visible: boolean
  order_number: number
  created_at: string
  updated_at: string
}

export interface CreatePartnerData {
  name: string
  logo?: string
  website?: string
  description?: string
  tier: Partner['tier']
  since: string
  visible: boolean
  order_number: number
}

export interface UpdatePartnerData extends Partial<CreatePartnerData> {
  updated_at?: string
} 
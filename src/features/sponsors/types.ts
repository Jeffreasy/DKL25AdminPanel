export interface Sponsor {
  id: string
  name: string
  description: string
  logoUrl: string
  websiteUrl?: string
  visible: boolean
  order: number
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export interface SponsorFormData {
  name: string
  description: string
  logoUrl: string
  websiteUrl?: string
  order: number
  isActive: boolean
  visible: boolean
} 
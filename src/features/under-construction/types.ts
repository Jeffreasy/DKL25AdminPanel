export interface UnderConstruction {
  id: number
  isActive: boolean
  title: string
  message: string
  footerText: string
  logoUrl: string
  expectedDate: string
  socialLinks: SocialLink[]
  progressPercentage: number
  contactEmail: string
  newsletterEnabled: boolean
  createdAt: string
  updatedAt: string
}

export interface SocialLink {
  platform: string
  url: string
}

export interface UnderConstructionFormData {
  isActive: boolean
  title: string
  message: string
  footerText: string
  logoUrl: string
  expectedDate: string | null
  socialLinks: SocialLink[]
  progressPercentage: number
  contactEmail: string
  newsletterEnabled: boolean
}
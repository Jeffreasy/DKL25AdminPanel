export interface UnderConstruction {
  id: number
  is_active: boolean
  title: string
  message: string
  footer_text: string
  logo_url: string
  expected_date: string | null
  social_links: string // JSON string
  progress_percentage: number
  contact_email: string
  newsletter_enabled: boolean
  created_at: string
  updated_at: string
}

export interface SocialLink {
  platform: string
  url: string
}

// Helper type for API responses (camelCase)
export interface UnderConstructionResponse {
  id: number
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
  createdAt: string
  updatedAt: string
}

export interface UnderConstructionFormData {
  is_active: boolean
  title: string
  message: string
  footer_text: string
  logo_url: string
  expected_date: string | null
  social_links: SocialLink[]
  progress_percentage: number
  contact_email: string
  newsletter_enabled: boolean
}
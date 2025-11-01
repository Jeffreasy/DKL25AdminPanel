export interface SocialLink {
  platform: string
  url: string
}

// Backend API response format (snake_case)
export interface UnderConstruction {
  id: number
  is_active: boolean
  title: string
  message: string
  footer_text: string | null
  logo_url: string | null
  expected_date: string | null
  social_links: SocialLink[] | null
  progress_percentage: number | null
  contact_email: string | null
  newsletter_enabled: boolean
  created_at: string
  updated_at: string
}

// Frontend format (camelCase)
export interface UnderConstructionResponse {
  id: number
  isActive: boolean
  title: string
  message: string
  footerText: string | null
  logoUrl: string | null
  expectedDate: string | null
  socialLinks: SocialLink[] | null
  progressPercentage: number | null
  contactEmail: string | null
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
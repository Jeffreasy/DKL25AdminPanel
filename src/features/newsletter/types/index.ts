import type { BaseEntity } from '../../../types/base'

export interface Newsletter extends BaseEntity {
  subject: string
  content: string
  sent_at?: string
  batch_id?: string
}

export interface CreateNewsletterData {
  subject: string
  content: string
}

export interface UpdateNewsletterData extends Partial<CreateNewsletterData> {
  sent_at?: string
}

export interface NewsletterSendResponse {
  success: boolean
  message: string
  sent_count?: number
}

// Helper function to get newsletter status
export function getNewsletterStatus(newsletter: Newsletter): 'draft' | 'sent' {
  return newsletter.sent_at ? 'sent' : 'draft'
}
/**
 * Email API Client
 *
 * Provides structured API calls for email management functionality.
 * Integrates with the Go backend email service documented in 04EMAIL_DOC.md
 *
 * @see 04EMAIL_DOC.md - Complete Email System Documentation
 * @see src/features/email/ - Email feature components and services
 */

import { apiClient } from '@/services/api.client'
import type { 
  Email, 
  PaginatedEmailResponse, 
  EmailFetchResponse,
  AutoResponse,
  ParticipantEmailsResponse 
} from '../../features/email/types'

export interface SendEmailParams {
  to: string | string[]
  subject: string
  body?: string
  html?: string
  from?: string
  replyTo?: string
  template?: string
  templateVariables?: Record<string, string>
}

export interface EmailEventData {
  event_type: string
  from_email: string
  to_email: string
  subject: string
  email_id: string
  timestamp?: string
}

/**
 * Email Management API Client
 * All endpoints require JWT authentication
 */
export const emailClient = {
  /**
   * Get paginated list of all emails (both inboxes)
   * GET /api/mail?limit=:limit&offset=:offset
   */
  async getAllEmails(limit: number = 10, offset: number = 0): Promise<PaginatedEmailResponse> {
    const response = await apiClient.get<PaginatedEmailResponse>(
      `/mail?limit=${limit}&offset=${offset}`
    )
    return response.data
  },

  /**
   * Get emails by account type (info or inschrijving)
   * GET /api/mail/account/:type?limit=:limit&offset=:offset
   */
  async getEmailsByAccount(
    accountType: 'info' | 'inschrijving',
    limit: number = 50,
    offset: number = 0
  ): Promise<PaginatedEmailResponse> {
    const response = await apiClient.get<PaginatedEmailResponse>(
      `/mail/account/${accountType}?limit=${limit}&offset=${offset}`
    )
    return response.data
  },

  /**
   * Get specific email details by ID
   * GET /api/mail/:id
   */
  async getEmailById(id: string): Promise<Email> {
    const response = await apiClient.get<Email>(`/mail/${id}`)
    return response.data
  },

  /**
   * Get all unprocessed (unread) emails
   * GET /api/mail/unprocessed
   */
  async getUnprocessedEmails(): Promise<Email[]> {
    const response = await apiClient.get<Email[]>('/mail/unprocessed')
    return response.data
  },

  /**
   * Mark email as processed/read
   * PUT /api/mail/:id/processed
   */
  async markAsProcessed(id: string): Promise<{ message: string }> {
    const response = await apiClient.put<{ message: string }>(`/mail/${id}/processed`)
    return response.data
  },

  /**
   * Delete email permanently
   * DELETE /api/mail/:id
   */
  async deleteEmail(id: string): Promise<{ success: boolean; message: string }> {
    const response = await apiClient.delete<{ success: boolean; message: string }>(`/mail/${id}`)
    return response.data
  },

  /**
   * Manually fetch new emails from mail server
   * POST /api/mail/fetch
   */
  async fetchNewEmails(): Promise<EmailFetchResponse> {
    const response = await apiClient.post<EmailFetchResponse>('/mail/fetch')
    return response.data
  },

  /**
   * Send email
   * POST /api/mail/send
   */
  async sendEmail(params: SendEmailParams): Promise<{ success: boolean; id?: string }> {
    const response = await apiClient.post<{ success: boolean; id?: string }>('/mail/send', params)
    return response.data
  },

  /**
   * Get all autoresponse templates
   * GET /api/mail/autoresponse
   */
  async getAutoResponses(): Promise<AutoResponse[]> {
    const response = await apiClient.get<AutoResponse[]>('/mail/autoresponse')
    return response.data
  },

  /**
   * Get autoresponses filtered by trigger event
   * GET /api/mail/autoresponse?trigger=:event&active=true
   */
  async getAutoResponseByTrigger(trigger: string, activeOnly: boolean = true): Promise<AutoResponse[]> {
    const params = new URLSearchParams({ trigger })
    if (activeOnly) params.append('active', 'true')
    const response = await apiClient.get<AutoResponse[]>(`/mail/autoresponse?${params.toString()}`)
    return response.data
  },

  /**
   * Create new autoresponse template
   * POST /api/mail/autoresponse
   */
  async createAutoResponse(
    data: Omit<AutoResponse, 'id' | 'created_at' | 'updated_at'>
  ): Promise<AutoResponse> {
    const response = await apiClient.post<AutoResponse>('/mail/autoresponse', data)
    return response.data
  },

  /**
   * Update autoresponse template
   * PUT /api/mail/autoresponse/:id
   */
  async updateAutoResponse(id: string, data: Partial<AutoResponse>): Promise<AutoResponse> {
    const response = await apiClient.put<AutoResponse>(`/mail/autoresponse/${id}`, data)
    return response.data
  },

  /**
   * Delete autoresponse template
   * DELETE /api/mail/autoresponse/:id
   */
  async deleteAutoResponse(id: string): Promise<void> {
    await apiClient.delete(`/mail/autoresponse/${id}`)
  },

  /**
   * Log email events
   * POST /api/mail/events
   */
  async logEmailEvent(event: EmailEventData): Promise<void> {
    await apiClient.post('/mail/events', {
      ...event,
      timestamp: event.timestamp || new Date().toISOString(),
      metadata: {}
    })
  },

  /**
   * Reprocess all emails with improved decoder
   * POST /api/admin/mail/reprocess
   * Requires admin permissions
   */
  async reprocessEmails(): Promise<{
    success: boolean
    message: string
    processed: number
    failed: number
  }> {
    const response = await apiClient.post<{
      success: boolean
      message: string
      processed: number
      failed: number
    }>('/admin/mail/reprocess')
    return response.data
  },

  /**
   * Get participant emails (for email suggestions)
   * GET /api/participant/emails
   */
  async getParticipantEmails(): Promise<ParticipantEmailsResponse> {
    const response = await apiClient.get<ParticipantEmailsResponse>('/participant/emails')
    return response.data
  },

  /**
   * Get unique emails from aanmeldingen (legacy support)
   * @deprecated Use getParticipantEmails() for full response
   */
  async getAanmeldingenEmails(): Promise<string[]> {
    const response = await this.getParticipantEmails()
    return response.all_emails || []
  },

  /**
   * Send confirmation email for registration
   * POST /api/email/send-confirmation
   */
  async sendConfirmationEmail(data: {
    to: string
    naam: string
    rol: string
    afstand: string
    ondersteuning: string
    bijzonderheden?: string
  }): Promise<{ success: boolean; message?: string }> {
    const response = await apiClient.post<{ success: boolean; message?: string }>(
      '/email/send-confirmation',
      data
    )
    return response.data
  }
}

export default emailClient
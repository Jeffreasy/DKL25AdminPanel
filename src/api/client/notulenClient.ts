import { apiClient } from '@/services/api.client'
import type {
  Notulen,
  NotulenCreateRequest,
  NotulenUpdateRequest,
  NotulenFinalizeRequest,
  NotulenVersie
} from '@/types/notulen'

export interface NotulenFilters {
  status?: 'draft' | 'finalized' | 'archived'
  dateFrom?: string
  dateTo?: string
  limit?: number
  offset?: number
}

export interface NotulenSearchParams extends NotulenFilters {
  q: string
}

class NotulenClient {
  // Helper methods for data transformation
  private transformToApiRequest(request: NotulenCreateRequest | NotulenUpdateRequest) {
    const transformed: Record<string, unknown> = {
      ...request,
    }

    // Handle JSONB fields - always send flat arrays as per document specification
    if (request.agenda_items && request.agenda_items.length > 0) {
      transformed.agenda_items = request.agenda_items
    } else {
      delete transformed.agenda_items
    }

    if (request.besluiten && request.besluiten.length > 0) {
      transformed.besluiten = request.besluiten
    } else {
      delete transformed.besluiten
    }

    if (request.actiepunten && request.actiepunten.length > 0) {
      // Strip completion tracking fields for API requests - these are managed via separate endpoints
      const cleanActiepunten = request.actiepunten.map((actie) => {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { voltooid, voltooid_door, voltooid_op, voltooid_opmerking, ...cleanActie } = actie
        return cleanActie
      })

      transformed.actiepunten = cleanActiepunten
    } else {
      delete transformed.actiepunten
    }

    // Remove metadata fields that are managed by backend
    delete transformed.created_by
    delete transformed.created_by_name
    delete transformed.updated_by_name
    delete transformed.finalized_by
    delete transformed.finalized_by_name
    delete transformed.versie
    delete transformed.status
    delete transformed.created_at
    delete transformed.updated_at
    delete transformed.finalized_at

    return transformed
  }

  private transformFromApiResponse(notulen: Record<string, unknown>): Notulen {
    const transformed = {
      ...notulen,
      vergaderingDatum: notulen.vergadering_datum, // Add camelCase for backward compatibility
      aanwezigen: Array.isArray(notulen.aanwezigen) ? notulen.aanwezigen : [], // Ensure it's an array
      afwezigen: Array.isArray(notulen.afwezigen) ? notulen.afwezigen : [], // Ensure it's an array
      // Flat arrays as per document specification - no wrapper extraction needed
      agendaItems: Array.isArray(notulen.agenda_items) ? notulen.agenda_items : [], // Direct access to flat array
      besluitenList: Array.isArray(notulen.besluiten) ? notulen.besluiten : [], // Direct access to flat array
      actiepuntenList: Array.isArray(notulen.actiepunten) ? notulen.actiepunten : [], // Direct access to flat array
      createdAt: notulen.created_at,
      updatedAt: notulen.updated_at,
      finalizedAt: notulen.finalized_at,
      finalizedBy: notulen.finalized_by,
      // Handle resolved user names
      created_by_name: notulen.created_by_name,
      updated_by: notulen.updated_by,
      updated_by_name: notulen.updated_by_name,
      finalized_by_name: notulen.finalized_by_name
    }

    return transformed as unknown as Notulen
  }

  async getNotulen(filters: NotulenFilters = {}): Promise<{ notulen: Notulen[]; total: number; limit: number; offset: number }> {
    const params = new URLSearchParams()

    if (filters.status) params.append('status', filters.status)
    if (filters.dateFrom) params.append('date_from', filters.dateFrom)
    if (filters.dateTo) params.append('date_to', filters.dateTo)
    if (filters.limit) params.append('limit', filters.limit.toString())
    if (filters.offset) params.append('offset', filters.offset.toString())

    const url = `/notulen${params.toString() ? '?' + params.toString() : ''}`
    const response = await apiClient.get(url)
    return {
      ...response.data,
      notulen: response.data.notulen.map((n: Record<string, unknown>) => this.transformFromApiResponse(n))
    }
  }

  async getPublicNotulen(filters: NotulenFilters = {}): Promise<{ notulen: Notulen[]; total: number; limit: number; offset: number }> {
    const params = new URLSearchParams()

    if (filters.dateFrom) params.append('date_from', filters.dateFrom)
    if (filters.dateTo) params.append('date_to', filters.dateTo)
    if (filters.limit) params.append('limit', filters.limit.toString())
    if (filters.offset) params.append('offset', filters.offset.toString())

    const url = `/notulen/public${params.toString() ? '?' + params.toString() : ''}`
    const response = await apiClient.get(url)
    return {
      ...response.data,
      notulen: response.data.notulen.map((n: Record<string, unknown>) => this.transformFromApiResponse(n))
    }
  }

  async searchNotulen(params: NotulenSearchParams): Promise<{ notulen: Notulen[]; total: number; limit: number; offset: number }> {
    const queryParams = new URLSearchParams({
      q: params.q,
      ...(params.status && { status: params.status }),
      ...(params.dateFrom && { date_from: params.dateFrom }),
      ...(params.dateTo && { date_to: params.dateTo }),
      ...(params.limit && { limit: params.limit.toString() }),
      ...(params.offset && { offset: params.offset.toString() })
    })

    const response = await apiClient.get(`/notulen/search?${queryParams}`)
    return {
      ...response.data,
      notulen: response.data.notulen.map((n: Record<string, unknown>) => this.transformFromApiResponse(n))
    }
  }

  async getNotulenById(id: string, format?: 'markdown'): Promise<Notulen> {
    const params = format ? `?format=${format}` : ''
    const response = await apiClient.get(`/notulen/${id}${params}`)

    // For markdown format, return the raw text response
    if (format === 'markdown') {
      return response.data as unknown as Notulen
    }

    return this.transformFromApiResponse(response.data)
  }

  async exportNotulenAsMarkdown(id: string): Promise<string> {
    const response = await apiClient.get(`/notulen/${id}?format=markdown`)
    return response.data as string
  }

  async createNotulen(request: NotulenCreateRequest): Promise<Notulen> {
    const apiRequest = this.transformToApiRequest(request)
    const response = await apiClient.post('/notulen', apiRequest)
    return this.transformFromApiResponse(response.data)
  }

  async updateNotulen(id: string, request: NotulenUpdateRequest): Promise<Notulen> {
    const apiRequest = this.transformToApiRequest(request)
    console.log('=== UPDATE REQUEST DEBUG ===')
    console.log('Request ID:', id)
    console.log('Original request:', request)
    console.log('Transformed request:', apiRequest)
    console.log('Fields being sent:', Object.keys(apiRequest))
    console.log('===========================')
    
    try {
      const response = await apiClient.put(`/notulen/${id}`, apiRequest)
      return this.transformFromApiResponse(response.data)
    } catch (error) {
      console.error('Update failed:', (error as { response?: { data?: unknown }; message?: string })?.response?.data || (error as { message?: string })?.message)
      throw error
    }
  }

  async deleteNotulen(id: string): Promise<void> {
    await apiClient.delete(`/notulen/${id}`)
  }

  async finalizeNotulen(id: string, request: NotulenFinalizeRequest = {}): Promise<{ success: boolean; message: string }> {
    const response = await apiClient.post(`/notulen/${id}/finalize`, request)
    return response.data
  }

  async archiveNotulen(id: string): Promise<{ success: boolean; message: string }> {
    const response = await apiClient.post(`/notulen/${id}/archive`)
    return response.data
  }

  async getNotulenVersions(id: string): Promise<{ versions: NotulenVersie[] }> {
    const response = await apiClient.get(`/notulen/${id}/versions`)
    return {
      versions: response.data.versions.map((v: Record<string, unknown>) => ({
        ...v,
        vergaderingDatum: v.vergadering_datum,
        agendaItems: Array.isArray(v.agenda_items) ? v.agenda_items : [], // Direct access to flat array
        besluiten: Array.isArray(v.besluiten) ? v.besluiten : [], // Direct access to flat array
        actiepunten: Array.isArray(v.actiepunten) ? v.actiepunten : [], // Direct access to flat array
        gewijzigdDoor: v.gewijzigd_door,
        gewijzigdOp: v.gewijzigd_op,
        wijzigingReden: v.wijziging_reden
      })) as NotulenVersie[]
    }
  }

  async getNotulenVersion(id: string, version: number): Promise<NotulenVersie> {
    const response = await apiClient.get(`/notulen/${id}/versions/${version}`)
    const versie = response.data
    return {
      ...versie,
      vergaderingDatum: versie.vergadering_datum,
      agendaItems: Array.isArray(versie.agenda_items) ? versie.agenda_items : [], // Direct access to flat array
      besluiten: Array.isArray(versie.besluiten) ? versie.besluiten : [], // Direct access to flat array
      actiepunten: Array.isArray(versie.actiepunten) ? versie.actiepunten : [], // Direct access to flat array
      gewijzigdDoor: versie.gewijzigd_door,
      gewijzigdOp: versie.gewijzigd_op,
      wijzigingReden: versie.wijziging_reden
    }
  }

  async completeActiepunt(
    notulenId: string,
    actieIndex: number,
    completionData: {
      voltooid_opmerking?: string
    } = {}
  ): Promise<Notulen> {
    const response = await apiClient.post(`/notulen/${notulenId}/actiepunten/${actieIndex}/complete`, completionData)
    return this.transformFromApiResponse(response.data)
  }

  async uncompleteActiepunt(notulenId: string, actieIndex: number): Promise<Notulen> {
    const response = await apiClient.post(`/notulen/${notulenId}/actiepunten/${actieIndex}/uncomplete`)
    return this.transformFromApiResponse(response.data)
  }

  async rollbackNotulen(id: string, version: number, reason?: string): Promise<Notulen> {
    const response = await apiClient.post(`/notulen/${id}/rollback/${version}`, { wijziging_reden: reason })
    return this.transformFromApiResponse(response.data)
  }
}

export const notulenClient = new NotulenClient()

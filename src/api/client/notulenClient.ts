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
      vergadering_datum: (request as Record<string, unknown>).vergadering_datum || (request as Record<string, unknown>).vergaderingDatum,
    }

    if (request.agenda_items) {
      transformed.agenda_items = { items: request.agenda_items }
    }
    if (request.besluiten) {
      transformed.besluiten = { besluiten: request.besluiten }
    }
    if (request.actiepunten) {
      transformed.actiepunten = { acties: request.actiepunten }
    }

    return transformed
  }

  private transformFromApiResponse(notulen: Record<string, unknown>): Notulen {
    const transformed = {
      ...notulen,
      vergaderingDatum: notulen.vergadering_datum, // Add camelCase for backward compatibility
      aanwezigen: Array.isArray(notulen.aanwezigen) ? notulen.aanwezigen : [], // Ensure it's an array
      afwezigen: Array.isArray(notulen.afwezigen) ? notulen.afwezigen : [], // Ensure it's an array
      agendaItems: (notulen.agenda_items as Record<string, unknown>)?.items || [], // Extract from wrapper
      besluitenList: (notulen.besluiten as Record<string, unknown>)?.besluiten || [], // Extract from wrapper
      actiepuntenList: (notulen.actiepunten as Record<string, unknown>)?.acties || [], // Extract from wrapper
      createdAt: notulen.created_at,
      updatedAt: notulen.updated_at,
      finalizedAt: notulen.finalized_at,
      finalizedBy: notulen.finalized_by
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
    return this.transformFromApiResponse(response.data)
  }

  async createNotulen(request: NotulenCreateRequest): Promise<Notulen> {
    const apiRequest = this.transformToApiRequest(request)
    const response = await apiClient.post('/notulen', apiRequest)
    return this.transformFromApiResponse(response.data)
  }

  async updateNotulen(id: string, request: NotulenUpdateRequest): Promise<Notulen> {
    const apiRequest = this.transformToApiRequest(request)
    const response = await apiClient.put(`/notulen/${id}`, apiRequest)
    return this.transformFromApiResponse(response.data)
  }

  async deleteNotulen(id: string): Promise<void> {
    await apiClient.delete(`/notulen/${id}`)
  }

  async finalizeNotulen(id: string, request: NotulenFinalizeRequest = {}): Promise<Notulen> {
    const response = await apiClient.post(`/notulen/${id}/finalize`, request)
    return this.transformFromApiResponse(response.data)
  }

  async archiveNotulen(id: string): Promise<Notulen> {
    const response = await apiClient.post(`/notulen/${id}/archive`)
    return this.transformFromApiResponse(response.data)
  }

  async getNotulenVersions(id: string): Promise<{ versions: NotulenVersie[] }> {
    const response = await apiClient.get(`/notulen/${id}/versions`)
    return {
      versions: response.data.versions.map((v: Record<string, unknown>) => ({
        ...v,
        vergaderingDatum: v.vergadering_datum,
        agendaItems: (v.agenda_items as Record<string, unknown>)?.items || [],
        besluiten: (v.besluiten as Record<string, unknown>)?.besluiten || [],
        actiepunten: (v.actiepunten as Record<string, unknown>)?.acties || [],
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
      agendaItems: versie.agenda_items?.items || [],
      besluiten: versie.besluiten?.besluiten || [],
      actiepunten: versie.actiepunten?.acties || [],
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
}

export const notulenClient = new NotulenClient()

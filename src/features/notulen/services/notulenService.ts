import { notulenClient } from '@/api/client'
import type { Notulen, NotulenCreateRequest, NotulenUpdateRequest, NotulenVersion, NotulenFilters, NotulenSearchParams } from '../types'

export class NotulenService {
  async getNotulen(filters: NotulenFilters = {}): Promise<{ notulen: Notulen[]; total: number }> {
    return notulenClient.getNotulen(filters)
  }

  async getPublicNotulen(filters: NotulenFilters = {}): Promise<{ notulen: Notulen[]; total: number }> {
    return notulenClient.getPublicNotulen(filters)
  }

  async searchNotulen(params: NotulenSearchParams): Promise<{ notulen: Notulen[]; total: number }> {
    return notulenClient.searchNotulen(params)
  }

  async getNotulenById(id: string): Promise<Notulen> {
    return notulenClient.getNotulenById(id)
  }

  async createNotulen(request: NotulenCreateRequest): Promise<Notulen> {
    return notulenClient.createNotulen(request)
  }

  async updateNotulen(id: string, request: NotulenUpdateRequest): Promise<Notulen> {
    return notulenClient.updateNotulen(id, request)
  }

  async deleteNotulen(id: string): Promise<void> {
    return notulenClient.deleteNotulen(id)
  }

  async finalizeNotulen(id: string, reason?: string): Promise<Notulen> {
    // Finalize returns success message, so we need to refetch the notulen
    await notulenClient.finalizeNotulen(id, reason ? { wijziging_reden: reason } : {})
    return notulenClient.getNotulenById(id)
  }

  async archiveNotulen(id: string): Promise<Notulen> {
    // Archive returns success message, so we need to refetch the notulen
    await notulenClient.archiveNotulen(id)
    return notulenClient.getNotulenById(id)
  }

  async getNotulenVersions(id: string): Promise<NotulenVersion[]> {
    const result = await notulenClient.getNotulenVersions(id)
    return result.versions
  }

  async getNotulenVersion(id: string, version: number): Promise<NotulenVersion> {
    return notulenClient.getNotulenVersion(id, version)
  }

  async completeActiepunt(
    notulenId: string,
    actieIndex: number,
    completionData?: { voltooid_opmerking?: string }
  ): Promise<Notulen> {
    return notulenClient.completeActiepunt(notulenId, actieIndex, completionData)
  }

  async uncompleteActiepunt(notulenId: string, actieIndex: number): Promise<Notulen> {
    return notulenClient.uncompleteActiepunt(notulenId, actieIndex)
  }

  async rollbackNotulen(id: string, version: number, reason?: string): Promise<Notulen> {
    return notulenClient.rollbackNotulen(id, version, reason)
  }
}

export const notulenService = new NotulenService()

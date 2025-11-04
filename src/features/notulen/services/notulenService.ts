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
    return notulenClient.finalizeNotulen(id, reason)
  }

  async archiveNotulen(id: string): Promise<Notulen> {
    return notulenClient.archiveNotulen(id)
  }

  async getNotulenVersions(id: string): Promise<NotulenVersion[]> {
    return notulenClient.getNotulenVersions(id)
  }

  async getNotulenVersion(id: string, version: number): Promise<NotulenVersion> {
    return notulenClient.getNotulenVersion(id, version)
  }
}

export const notulenService = new NotulenService()
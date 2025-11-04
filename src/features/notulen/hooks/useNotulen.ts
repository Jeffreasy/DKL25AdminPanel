import { useState, useEffect, useCallback } from 'react'
import { notulenService } from '../services/notulenService'
import type { Notulen, NotulenFilters, NotulenSearchParams, NotulenCreateRequest, NotulenUpdateRequest, NotulenVersion } from '../types'

export function useNotulen(filters: NotulenFilters = {}) {
  const [notulen, setNotulen] = useState<Notulen[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchNotulen = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const result = await notulenService.getNotulen(filters)
      setNotulen(result.notulen)
      setTotal(result.total)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch notulen')
    } finally {
      setLoading(false)
    }
  }, [filters])

  useEffect(() => {
    fetchNotulen()
  }, [fetchNotulen])

  return {
    notulen,
    total,
    loading,
    error,
    refetch: fetchNotulen
  }
}

export function useNotulenById(id: string | undefined) {
  const [notulen, setNotulen] = useState<Notulen | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchNotulen = useCallback(async () => {
    if (!id) return

    setLoading(true)
    setError(null)
    try {
      const result = await notulenService.getNotulenById(id)
      setNotulen(result)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch notulen')
    } finally {
      setLoading(false)
    }
  }, [id])

  useEffect(() => {
    fetchNotulen()
  }, [fetchNotulen])

  return {
    notulen,
    loading,
    error,
    refetch: fetchNotulen
  }
}

export function useNotulenSearch() {
  const [results, setResults] = useState<Notulen[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const search = useCallback(async (params: NotulenSearchParams) => {
    setLoading(true)
    setError(null)
    try {
      const result = await notulenService.searchNotulen(params)
      setResults(result.notulen)
      setTotal(result.total)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Search failed')
    } finally {
      setLoading(false)
    }
  }, [])

  return {
    results,
    total,
    loading,
    error,
    search
  }
}

export function useNotulenMutations() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const createNotulen = useCallback(async (request: NotulenCreateRequest): Promise<Notulen | null> => {
    setLoading(true)
    setError(null)
    try {
      const result = await notulenService.createNotulen(request)
      return result
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create notulen')
      return null
    } finally {
      setLoading(false)
    }
  }, [])

  const updateNotulen = useCallback(async (id: string, request: NotulenUpdateRequest): Promise<Notulen | null> => {
    setLoading(true)
    setError(null)
    try {
      const result = await notulenService.updateNotulen(id, request)
      return result
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update notulen')
      return null
    } finally {
      setLoading(false)
    }
  }, [])

  const deleteNotulen = useCallback(async (id: string): Promise<boolean> => {
    setLoading(true)
    setError(null)
    try {
      await notulenService.deleteNotulen(id)
      return true
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete notulen')
      return false
    } finally {
      setLoading(false)
    }
  }, [])

  const finalizeNotulen = useCallback(async (id: string, reason?: string): Promise<Notulen | null> => {
    setLoading(true)
    setError(null)
    try {
      const result = await notulenService.finalizeNotulen(id, reason)
      return result
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to finalize notulen')
      return null
    } finally {
      setLoading(false)
    }
  }, [])

  const archiveNotulen = useCallback(async (id: string): Promise<Notulen | null> => {
    setLoading(true)
    setError(null)
    try {
      const result = await notulenService.archiveNotulen(id)
      return result
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to archive notulen')
      return null
    } finally {
      setLoading(false)
    }
  }, [])

  return {
    loading,
    error,
    createNotulen,
    updateNotulen,
    deleteNotulen,
    finalizeNotulen,
    archiveNotulen
  }
}

export function useNotulenVersions(id: string | undefined) {
  const [versions, setVersions] = useState<NotulenVersion[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchVersions = useCallback(async () => {
    if (!id) return

    setLoading(true)
    setError(null)
    try {
      const result = await notulenService.getNotulenVersions(id)
      setVersions(result)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch versions')
    } finally {
      setLoading(false)
    }
  }, [id])

  useEffect(() => {
    fetchVersions()
  }, [fetchVersions])

  return {
    versions,
    loading,
    error,
    refetch: fetchVersions
  }
}
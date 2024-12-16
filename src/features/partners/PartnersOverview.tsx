import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase/supabaseClient'
import { LoadingSkeleton } from '../../components/auth/LoadingSkeleton'
import { ErrorText, SmallText } from '../../components/typography'
import { PartnerCard } from './components'
import type { Database } from '../../types/supabase'

type Partner = Database['public']['Tables']['partners']['Row']
type SortField = 'name' | 'tier' | 'order_number' | 'since'
type SortOrder = 'asc' | 'desc'

export function PartnersOverview() {
  const [partners, setPartners] = useState<Partner[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [sortField, setSortField] = useState<SortField>('order_number')
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc')
  const [filter, setFilter] = useState('')

  useEffect(() => {
    fetchPartners()
  }, [])

  const fetchPartners = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('partners')
        .select('*')
        .order(sortField, { ascending: sortOrder === 'asc' })

      if (error) throw error
      setPartners(data || [])
    } catch (err) {
      console.error('Error fetching partners:', err)
      setError('Er ging iets mis bij het ophalen van de partners')
    } finally {
      setLoading(false)
    }
  }

  const handleSort = (field: SortField) => {
    if (field === sortField) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortOrder('asc')
    }
  }

  const filteredPartners = partners.filter(partner => {
    if (!filter) return true
    const searchTerm = filter.toLowerCase()
    return (
      partner.name.toLowerCase().includes(searchTerm) ||
      partner.description?.toLowerCase().includes(searchTerm) ||
      partner.tier.toLowerCase().includes(searchTerm)
    )
  })

  if (loading) {
    return (
      <div className="p-4 space-y-4">
        <LoadingSkeleton />
        <LoadingSkeleton />
        <LoadingSkeleton />
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-4">
        <ErrorText>{error}</ErrorText>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Filters en sortering */}
      <div className="p-4 border-b border-gray-200 space-y-4">
        <div className="flex flex-col sm:flex-row gap-4 justify-between">
          <div className="relative flex-1">
            <input
              type="search"
              placeholder="Zoeken..."
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="w-full pl-10 input-primary"
            />
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </div>
          <div className="flex gap-2">
            <select
              value={sortField}
              onChange={(e) => handleSort(e.target.value as SortField)}
              className="input-primary"
            >
              <option value="order_number">Volgorde</option>
              <option value="name">Naam</option>
              <option value="tier">Niveau</option>
              <option value="since">Datum</option>
            </select>
            <button
              onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
              className="p-2 rounded-md border border-gray-300 hover:bg-gray-50"
            >
              {sortOrder === 'asc' ? (
                <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 4h13M3 8h9M3 12h5m0 0v8m0-8h14" />
                </svg>
              ) : (
                <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 4h13M3 8h9m-9 4h9m5-4v12m0 0l-4-4m4 4l4-4" />
                </svg>
              )}
            </button>
          </div>
        </div>
        <SmallText>
          {filteredPartners.length} partner{filteredPartners.length !== 1 ? 's' : ''} gevonden
        </SmallText>
      </div>

      {/* Partners grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 p-4">
        {filteredPartners.map((partner) => (
          <PartnerCard
            key={partner.id}
            partner={partner}
            onUpdate={fetchPartners}
          />
        ))}
      </div>

      {filteredPartners.length === 0 && (
        <div className="text-center py-12">
          <SmallText>
            Geen partners gevonden{filter ? ' voor deze zoekopdracht' : ''}
          </SmallText>
        </div>
      )}
    </div>
  )
} 
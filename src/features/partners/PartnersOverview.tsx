import { useState, useEffect } from 'react'
import { ErrorText, SmallText } from '../../components/typography'
import { PartnerCard } from './components'
import { fetchPartners } from './services/partnerService'
import type { Partner } from './types'
import { cc } from '../../styles/shared'
import { EmptyState, LoadingGrid } from '../../components/ui'

type SortField = 'name' | 'order_number'
type SortOrder = 'asc' | 'desc'

export function PartnersOverview() {
  const [partners, setPartners] = useState<Partner[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [sortField, setSortField] = useState<SortField>('order_number')
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc')
  const [filter, setFilter] = useState('')

  useEffect(() => {
    loadPartners()
  }, [])

  const loadPartners = async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await fetchPartners()
      console.log('Loaded partners:', data)
      setPartners(data)
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
      partner.description?.toLowerCase().includes(searchTerm)
    )
  })

  const sortedAndFilteredPartners = filteredPartners.sort((a, b) => {
    if (sortField === 'name') {
      return sortOrder === 'asc' 
        ? a.name.localeCompare(b.name)
        : b.name.localeCompare(a.name)
    }
    return sortOrder === 'asc'
      ? a.order_number - b.order_number
      : b.order_number - a.order_number
  })

  if (loading) {
    return <LoadingGrid variant="albums" count={6} />
  }

  if (error) {
    return (
      <div className={cc.spacing.container.sm}>
        <ErrorText>{error}</ErrorText>
      </div>
    )
  }

  return (
    <div className={cc.spacing.section.sm}>
      {/* Filters en sortering */}
      <div className={`${cc.spacing.container.sm} border-b border-gray-200 dark:border-gray-700 ${cc.spacing.section.sm}`}>
        <div className="flex flex-col sm:flex-row gap-4 justify-between">
          <div className="relative flex-1">
            <input
              type="search"
              placeholder="Zoeken..."
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className={cc.form.input({ className: 'w-full pl-10' })}
            />
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg className="h-5 w-5 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </div>
          <div className={`flex ${cc.spacing.gap.sm}`}>
            <select
              value={sortField}
              onChange={(e) => handleSort(e.target.value as SortField)}
              className={cc.form.select({ className: 'h-full' })}
            >
              <option value="order_number">Volgorde</option>
              <option value="name">Naam</option>
            </select>
            <button
              onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
              className={`p-2 rounded-md border border-gray-300 dark:border-gray-600 text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-600 ${cc.transition.colors}`}
              title={sortOrder === 'asc' ? 'Oplopend sorteren' : 'Aflopend sorteren'}
            >
              {sortOrder === 'asc' ? (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 4h13M3 8h9M3 12h5m0 0v8m0-8h14" />
                </svg>
              ) : (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
      {sortedAndFilteredPartners.length > 0 ? (
        <div className={`${cc.grid.albums()} ${cc.spacing.container.sm} grid-auto-rows-fr ${cc.spacing.gap.lg}`}>
          {sortedAndFilteredPartners.map((partner) => (
            <PartnerCard
              key={partner.id}
              partner={partner}
              onUpdate={loadPartners}
            />
          ))}
        </div>
      ) : (
        <EmptyState
          title={filter ? 'Geen partners gevonden' : 'Geen partners'}
          description={filter ? 'Probeer een andere zoekopdracht' : 'Voeg je eerste partner toe om te beginnen'}
        />
      )}
    </div>
  )
} 
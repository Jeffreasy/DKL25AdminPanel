import { useState, useEffect, useMemo } from 'react'
import { ErrorText, SmallText } from '../../components/typography/typography'
import { PartnerCard } from './components'
import { fetchPartners } from './services/partnerService'
import { useFilters, applyFilters } from '../../hooks/useFilters'
import { useSorting, applySorting } from '../../hooks/useSorting'
import type { Partner } from './types'
import { cc } from '../../styles/shared'
import { EmptyState, LoadingGrid } from '../../components/ui'

export function PartnersOverview() {
  const [partners, setPartners] = useState<Partner[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Use filters hook
  const filters = useFilters<'search'>({
    initialFilters: {
      search: ''
    }
  })

  // Use sorting hook
  const sorting = useSorting<'name' | 'order_number'>({
    initialSortKey: 'order_number',
    initialSortDirection: 'asc'
  })

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

  // Apply filters and sorting
  const sortedAndFilteredPartners = useMemo(() => {
    // First apply filters
    const filtered = applyFilters(partners, filters.filters, (partner, filterValues) => {
      if (!filterValues.search) return true
      const searchTerm = (filterValues.search as string).toLowerCase()
      return (
        partner.name.toLowerCase().includes(searchTerm) ||
        (partner.description?.toLowerCase().includes(searchTerm) ?? false)
      )
    })

    // Then apply sorting
    return applySorting(filtered, sorting.sortConfig)
  }, [partners, filters.filters, sorting.sortConfig])

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
              value={filters.getFilterValue('search') as string || ''}
              onChange={(e) => filters.setFilter('search', e.target.value)}
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
              value={sorting.sortConfig.key || 'order_number'}
              onChange={(e) => sorting.sortBy(e.target.value as 'name' | 'order_number')}
              className={cc.form.select({ className: 'h-full' })}
            >
              <option value="order_number">Volgorde</option>
              <option value="name">Naam</option>
            </select>
            <button
              onClick={() => sorting.toggleSort(sorting.sortConfig.key || 'order_number')}
              className={`p-2 rounded-md border border-gray-300 dark:border-gray-600 text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-600 ${cc.transition.colors}`}
              title={sorting.sortConfig.direction === 'asc' ? 'Oplopend sorteren' : 'Aflopend sorteren'}
            >
              {sorting.sortConfig.direction === 'asc' ? (
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
          {sortedAndFilteredPartners.length} partner{sortedAndFilteredPartners.length !== 1 ? 's' : ''} gevonden
        </SmallText>
      </div>

      {/* Partners grid */}
      {sortedAndFilteredPartners.length > 0 ? (
        <div className={`${cc.grid.albums()} ${cc.spacing.container.sm} grid-auto-rows-fr ${cc.spacing.gap.lg}`}>
          {sortedAndFilteredPartners.map((partner: Partner) => (
            <PartnerCard
              key={partner.id}
              partner={partner}
              onUpdate={loadPartners}
            />
          ))}
        </div>
      ) : (
        <EmptyState
          title={filters.getFilterValue('search') ? 'Geen partners gevonden' : 'Geen partners'}
          description={filters.getFilterValue('search') ? 'Probeer een andere zoekopdracht' : 'Voeg je eerste partner toe om te beginnen'}
        />
      )}
    </div>
  )
} 
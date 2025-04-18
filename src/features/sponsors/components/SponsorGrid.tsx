import { useState, useEffect } from 'react'
import { LoadingSkeleton } from '../../../components/LoadingSkeleton'
import { ErrorText, SmallText } from '../../../components/typography'
import { sponsorService } from '../services/sponsorService'
import type { Sponsor } from '../types'
import { TrashIcon, PencilIcon } from '@heroicons/react/24/outline'
import { SponsorForm } from './SponsorForm'
import { cc } from '../../../styles/shared'

type SortField = 'name' | 'order'
type SortOrder = 'asc' | 'desc'

export function SponsorGrid() {
  const [sponsors, setSponsors] = useState<Sponsor[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [editingSponsor, setEditingSponsor] = useState<Sponsor | null>(null)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null)
  const [sortField, setSortField] = useState<SortField>('order')
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc')
  const [filter, setFilter] = useState('')

  useEffect(() => {
    loadSponsors()
  }, [])

  const loadSponsors = async () => {
    try {
      setLoading(true)
      const data = await sponsorService.getSponsors()
      setSponsors(data)
    } catch (err) {
      setError('Er ging iets mis bij het ophalen van de sponsors')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = (sponsor: Sponsor) => {
    setEditingSponsor(sponsor)
  }

  const handleDelete = async (id: string) => {
    try {
      await sponsorService.deleteSponsor(id)
      await loadSponsors() // Herlaad de lijst na verwijderen
      setShowDeleteConfirm(null)
    } catch (err) {
      console.error('Error deleting sponsor:', err)
      // Toon eventueel een error message
    }
  }

  const handleUpdateComplete = async () => {
    setEditingSponsor(null)
    await loadSponsors() // Herlaad de lijst na update
  }

  const handleSort = (field: SortField) => {
    if (field === sortField) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortOrder('asc')
    }
  }

  const filteredSponsors = sponsors.filter(sponsor => {
    if (!filter) return true
    const searchTerm = filter.toLowerCase()
    return (
      sponsor.name.toLowerCase().includes(searchTerm) ||
      sponsor.description?.toLowerCase().includes(searchTerm)
    )
  })

  const sortedAndFilteredSponsors = filteredSponsors.sort((a, b) => {
    if (sortField === 'name') {
      return sortOrder === 'asc' 
        ? a.name.localeCompare(b.name)
        : b.name.localeCompare(a.name)
    }
    return sortOrder === 'asc'
      ? a.order - b.order
      : b.order - a.order
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
      {/* Filters en sortering - Apply dark mode and cc styles */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700 space-y-4">
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
          <div className="flex gap-2">
            <select
              value={sortField}
              onChange={(e) => handleSort(e.target.value as SortField)}
              className={cc.form.select({ className: 'h-full' })}
            >
              <option value="order">Volgorde</option>
              <option value="name">Naam</option>
            </select>
            <button
              onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
              className="p-2 rounded-md border border-gray-300 dark:border-gray-600 text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-600"
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
          {filteredSponsors.length} sponsor{filteredSponsors.length !== 1 ? 's' : ''} gevonden
        </SmallText>
      </div>

      {/* Sponsors grid - Add grid-auto-rows-fr */}
      <div className={cc.grid({ className: 'p-4 grid-auto-rows-fr' })}>
        {sortedAndFilteredSponsors.map((sponsor) => (
          <div key={sponsor.id} className="bg-white dark:bg-gray-800 rounded-lg shadow-sm dark:shadow-md hover:shadow-md dark:hover:shadow-lg transition-shadow border border-gray-200 dark:border-gray-700 flex flex-col">
            <div className="h-40 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-t-lg flex items-center justify-center border-b border-gray-200 dark:border-gray-600">
              <img
                src={sponsor.logoUrl}
                alt={`${sponsor.name} logo`}
                className="object-contain w-full h-full"
              />
            </div>
            
            <div className="p-4 flex-grow flex flex-col justify-between">
              <div>
                <div className="flex justify-between items-start mb-2">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{sponsor.name}</h3>
                  <div className="flex space-x-1">
                    <button 
                      onClick={() => handleEdit(sponsor)}
                      className={cc.button.icon({ size: 'sm', color: 'secondary' })}
                    >
                      <PencilIcon className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={() => setShowDeleteConfirm(sponsor.id)}
                      className={cc.button.iconDanger({ size: 'sm' })}
                    >
                      <TrashIcon className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                
                <p className="text-sm text-gray-600 dark:text-gray-300 mb-3">{sponsor.description || "Geen beschrijving."}</p>
              </div>
              
              <div>
                <div className="text-sm text-gray-500 dark:text-gray-400 space-y-1">
                  <p>Volgorde: <span className="font-medium text-gray-700 dark:text-gray-200">{sponsor.order}</span></p>
                  <p>
                    Status:{' '}
                    <span
                      className={cc.badge({ color: sponsor.visible ? 'green' : 'gray', className: 'ml-1' })}
                    >
                      {sponsor.visible ? 'Zichtbaar' : 'Verborgen'}
                    </span>
                  </p>
                  {sponsor.websiteUrl && (
                    <a
                      href={sponsor.websiteUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-indigo-600 hover:text-indigo-800 dark:text-indigo-400 dark:hover:text-indigo-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 dark:focus:ring-offset-gray-800 rounded inline-flex items-center gap-1 mt-2 group"
                    >
                      Bezoek website
                      <svg className="w-4 h-4 transition-transform group-hover:translate-x-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                      </svg>
                    </a>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredSponsors.length === 0 && (
        <div className="text-center py-12">
          <SmallText>
            Geen sponsors gevonden{filter ? ' voor deze zoekopdracht' : ''}
          </SmallText>
        </div>
      )}

      {/* Edit Modal */}
      {editingSponsor && (
        <SponsorForm
          initialData={{
            name: editingSponsor.name,
            description: editingSponsor.description,
            logoUrl: editingSponsor.logoUrl,
            websiteUrl: editingSponsor.websiteUrl ?? '',
            order: editingSponsor.order,
            isActive: editingSponsor.isActive,
            visible: editingSponsor.visible,
            id: editingSponsor.id
          }}
          onComplete={handleUpdateComplete}
          onCancel={() => setEditingSponsor(null)}
        />
      )}

      {/* Delete Confirmation Modal - Add dark mode styles */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-sm w-full border border-gray-200 dark:border-gray-700 shadow-xl">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
              Sponsor verwijderen
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
              Weet je zeker dat je deze sponsor wilt verwijderen? Deze actie kan niet ongedaan worden gemaakt.
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowDeleteConfirm(null)}
                className={cc.button.base({ color: 'secondary' })}
              >
                Annuleren
              </button>
              <button
                onClick={() => handleDelete(showDeleteConfirm)}
                className={cc.button.base({ color: 'danger' })}
              >
                Verwijderen
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
} 
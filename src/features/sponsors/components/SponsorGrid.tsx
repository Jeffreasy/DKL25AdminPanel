import { useState, useEffect } from 'react'
import { LoadingSkeleton } from '../../../components/LoadingSkeleton'
import { ErrorText, SmallText } from '../../../components/typography'
import { sponsorService } from '../services/sponsorService'
import type { Sponsor } from '../types'
import { TrashIcon, PencilIcon } from '@heroicons/react/24/outline'
import { SponsorForm } from './SponsorForm'

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
              <option value="order">Volgorde</option>
              <option value="name">Naam</option>
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
          {filteredSponsors.length} sponsor{filteredSponsors.length !== 1 ? 's' : ''} gevonden
        </SmallText>
      </div>

      {/* Sponsors grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 p-4">
        {sortedAndFilteredSponsors.map((sponsor) => (
          <div key={sponsor.id} className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow">
            <div className="aspect-[3/2] p-4 bg-gray-50 rounded-t-lg flex items-center justify-center">
              <img
                src={sponsor.logoUrl}
                alt={`${sponsor.name} logo`}
                className="max-w-[85%] max-h-[85%] object-contain"
              />
            </div>
            
            <div className="p-4">
              <div className="flex justify-between items-start mb-2">
                <h3 className="text-lg font-semibold text-gray-900">{sponsor.name}</h3>
                <div className="flex space-x-2">
                  <button 
                    onClick={() => handleEdit(sponsor)}
                    className="p-1 text-gray-400 hover:text-gray-500"
                  >
                    <PencilIcon className="w-5 h-5" />
                  </button>
                  <button 
                    onClick={() => setShowDeleteConfirm(sponsor.id)}
                    className="p-1 text-gray-400 hover:text-red-500"
                  >
                    <TrashIcon className="w-5 h-5" />
                  </button>
                </div>
              </div>
              
              <p className="text-sm text-gray-600 mb-2">{sponsor.description}</p>
              
              <div className="text-sm text-gray-500">
                <p>Volgorde: {sponsor.order}</p>
                <p>
                  Status:{' '}
                  <span
                    className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                      sponsor.visible
                        ? 'bg-green-100 text-green-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}
                  >
                    {sponsor.visible ? 'Zichtbaar' : 'Verborgen'}
                  </span>
                </p>
                {sponsor.websiteUrl && (
                  <a
                    href={sponsor.websiteUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-indigo-600 hover:text-indigo-500 flex items-center gap-1 mt-2"
                  >
                    Bezoek website
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                  </a>
                )}
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

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg p-6 max-w-sm w-full">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Sponsor verwijderen
            </h3>
            <p className="text-sm text-gray-500 mb-4">
              Weet je zeker dat je deze sponsor wilt verwijderen? Deze actie kan niet ongedaan worden gemaakt.
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowDeleteConfirm(null)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Annuleren
              </button>
              <button
                onClick={() => handleDelete(showDeleteConfirm)}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-md hover:bg-red-700"
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
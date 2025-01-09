import { useState, useEffect } from 'react'
import { Sponsor } from '../types'
import { TrashIcon, PencilIcon } from '@heroicons/react/24/outline'
import { sponsorService } from '../services/sponsorService'
import { SponsorForm } from './SponsorForm'

export function SponsorGrid() {
  const [sponsors, setSponsors] = useState<Sponsor[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [editingSponsor, setEditingSponsor] = useState<Sponsor | null>(null)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null)

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

  if (loading) {
    return <div className="p-4">Laden...</div>
  }

  if (error) {
    return <div className="p-4 text-red-600">{error}</div>
  }

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
        {sponsors.map((sponsor) => (
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
                <p>Status: {sponsor.isActive ? 'Actief' : 'Inactief'}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Edit Modal */}
      {editingSponsor && (
        <SponsorForm
          initialData={editingSponsor}
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
    </>
  )
} 
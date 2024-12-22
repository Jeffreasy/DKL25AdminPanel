import { useState, useEffect } from 'react'
import { LoadingSkeleton } from '../../../components/LoadingSkeleton'
import { ErrorText } from '../../../components/typography'
import type { Sponsor } from '../types'
import { 
  fetchSponsorsFromAPI, 
  updateSponsorInAPI,
  deleteSponsorFromAPI,
  updateSponsorOrderInAPI 
} from '../services/sponsorService'
import { SponsorForm } from './SponsorForm'
import {
  DndContext,
  closestCenter,
  DragEndEvent,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors
} from '@dnd-kit/core'
import {
  SortableContext,
  arrayMove,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy
} from '@dnd-kit/sortable'
import { SponsorCard } from './SponsorCard'

export function SponsorGrid() {
  const [sponsors, setSponsors] = useState<Sponsor[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [editingSponsor, setEditingSponsor] = useState<Sponsor | null>(null)
  const [selectedSponsors, setSelectedSponsors] = useState<Set<string>>(new Set())

  useEffect(() => {
    fetchSponsors()
  }, [])

  const fetchSponsors = async () => {
    try {
      setLoading(true)
      const sponsors = await fetchSponsorsFromAPI()
      setSponsors(sponsors)
    } catch (err) {
      console.error('Error fetching sponsors:', err)
      setError('Er ging iets mis bij het ophalen van de sponsors')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (sponsor: Sponsor) => {
    if (!confirm(`Weet je zeker dat je ${sponsor.name} wilt verwijderen?`)) {
      return
    }

    try {
      await deleteSponsorFromAPI(sponsor.id)
      fetchSponsors()
    } catch (err) {
      console.error('Error deleting sponsor:', err)
      setError('Er ging iets mis bij het verwijderen van de sponsor')
    }
  }

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8, // Minimale afstand voordat drag start
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event
    if (!over || active.id === over.id) return

    try {
      const oldIndex = sponsors.findIndex(s => s.id === active.id)
      const newIndex = sponsors.findIndex(s => s.id === over.id)
      
      if (oldIndex === -1 || newIndex === -1) return

      // Update lokale state
      const newOrder = arrayMove(sponsors, oldIndex, newIndex)
      setSponsors(newOrder)

      // Maak updates met alle benodigde velden
      const updates = newOrder.map((sponsor, index) => ({
        id: sponsor.id,
        order_number: index + 1
      }))

      await updateSponsorOrderInAPI(updates)
    } catch (err) {
      console.error('Error reordering sponsors:', err)
      setError('Er ging iets mis bij het herordenen')
      fetchSponsors() // Reset naar originele volgorde
    }
  }

  const handleBulkDelete = async () => {
    if (selectedSponsors.size === 0) return
    if (!confirm(`Weet je zeker dat je ${selectedSponsors.size} sponsors wilt verwijderen?`)) return

    try {
      await Promise.all(Array.from(selectedSponsors).map(id => deleteSponsorFromAPI(id)))
      setSelectedSponsors(new Set())
      fetchSponsors()
    } catch (err) {
      console.error('Error bulk deleting sponsors:', err)
      setError('Er ging iets mis bij het verwijderen van de sponsors')
    }
  }

  const handleVisibilityToggle = async (sponsor: Sponsor) => {
    try {
      await updateSponsorInAPI(sponsor.id, { 
        visible: !sponsor.visible,
        updated_at: new Date().toISOString()
      })
      fetchSponsors()
    } catch (err) {
      console.error('Error toggling sponsor visibility:', err)
      setError('Er ging iets mis bij het wijzigen van de zichtbaarheid')
    }
  }

  if (loading) {
    return (
      <div className="p-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {[...Array(6)].map((_, i) => (
          <LoadingSkeleton key={i} className="aspect-[3/2]" />
        ))}
      </div>
    )
  }

  if (error) {
    return <div className="p-4"><ErrorText>{error}</ErrorText></div>
  }

  return (
    <div className="space-y-4">
      {selectedSponsors.size > 0 && (
        <div className="bg-white p-4 rounded-lg shadow flex justify-between items-center">
          <span className="text-sm text-gray-600">
            {selectedSponsors.size} sponsor{selectedSponsors.size === 1 ? '' : 's'} geselecteerd
          </span>
          <button
            onClick={handleBulkDelete}
            className="px-3 py-1 text-sm text-red-600 hover:text-red-700 hover:bg-red-50 rounded-md"
          >
            Verwijderen
          </button>
        </div>
      )}

      <DndContext 
        sensors={sensors}
        onDragEnd={handleDragEnd} 
        collisionDetection={closestCenter}
      >
        <SortableContext 
          items={sponsors.map(s => s.id)}
          strategy={verticalListSortingStrategy}
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {sponsors.map((sponsor) => (
              <SponsorCard 
                key={sponsor.id} 
                sponsor={sponsor}
                onEdit={setEditingSponsor}
                onDelete={handleDelete}
                onVisibilityToggle={handleVisibilityToggle}
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>

      {editingSponsor && (
        <SponsorForm
          sponsor={editingSponsor}
          onComplete={() => {
            setEditingSponsor(null)
            fetchSponsors()
          }}
          onCancel={() => setEditingSponsor(null)}
        />
      )}
    </div>
  )
} 
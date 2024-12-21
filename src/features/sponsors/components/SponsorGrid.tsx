import { useState, useEffect } from 'react'
import { supabase } from '../../../lib/supabase/supabaseClient'
import type { Sponsor } from '../types'
import { LoadingSkeleton } from '../../../components/auth/LoadingSkeleton'
import { ErrorText } from '../../../components/typography'
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
  useSortable,
  arrayMove,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'

interface SortableSponsorCardProps {
  sponsor: Sponsor
  onEdit: (sponsor: Sponsor) => void
  onDelete: (sponsor: Sponsor) => void
}

function SortableSponsorCard({ sponsor, onEdit, onDelete }: SortableSponsorCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition
  } = useSortable({ id: sponsor.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition
  }

  return (
    <div 
      ref={setNodeRef} 
      style={style} 
      className="bg-white rounded-lg shadow overflow-hidden hover:shadow-md transition-shadow"
    >
      <div {...attributes} {...listeners} className="cursor-grab">
        <div className="aspect-[3/2] bg-gray-100 relative">
          <img
            src={sponsor.logo_url}
            alt={sponsor.name}
            className="w-full h-full object-contain p-4"
          />
          {!sponsor.visible && (
            <div className="absolute top-2 right-2 px-2 py-1 bg-gray-100 rounded text-xs text-gray-600">
              Verborgen
            </div>
          )}
        </div>
      </div>

      <div className="p-4">
        <h3 className="font-medium text-gray-900">{sponsor.name}</h3>
        {sponsor.description && (
          <p className="mt-1 text-sm text-gray-500 line-clamp-2">
            {sponsor.description}
          </p>
        )}
        {sponsor.website_url && (
          <a
            href={sponsor.website_url}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-2 inline-flex items-center text-sm text-indigo-600 hover:text-indigo-500"
            onClick={(e) => e.stopPropagation()}
          >
            Bezoek website
            <svg className="ml-1 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
          </a>
        )}
      </div>

      <div className="px-4 py-3 bg-gray-50 flex justify-end gap-2">
        <button
          onClick={(e) => {
            e.stopPropagation()
            onEdit(sponsor)
          }}
          className="p-1.5 text-gray-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
          </svg>
        </button>
        <button
          onClick={(e) => {
            e.stopPropagation()
            onDelete(sponsor)
          }}
          className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        </button>
      </div>
    </div>
  )
}

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
      const { data, error } = await supabase
        .from('sponsors')
        .select('*')
        .order('order_number', { ascending: true })

      if (error) throw error
      setSponsors(data || [])
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
      const { error } = await supabase
        .from('sponsors')
        .delete()
        .eq('id', sponsor.id)

      if (error) throw error

      // Ververs de lijst
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
        name: sponsor.name,           // Verplicht veld
        logo_url: sponsor.logo_url,   // Verplicht veld
        visible: sponsor.visible,     // Verplicht veld
        order_number: index + 1,      // Nieuwe volgorde
        description: sponsor.description,
        website_url: sponsor.website_url
      }))

      const { error } = await supabase
        .from('sponsors')
        .upsert(updates, { 
          onConflict: 'id'
        })

      if (error) throw error
    } catch (err) {
      console.error('Error reordering sponsors:', err)
      setError('Er ging iets mis bij het herordenen')
      fetchSponsors() // Reset naar originele volgorde
    }
  }

  const handleBulkDelete = async () => {
    if (selectedSponsors.size === 0) return

    if (!confirm(`Weet je zeker dat je ${selectedSponsors.size} sponsors wilt verwijderen?`)) {
      return
    }

    try {
      const { error } = await supabase
        .from('sponsors')
        .delete()
        .in('id', Array.from(selectedSponsors))

      if (error) throw error

      setSelectedSponsors(new Set())
      fetchSponsors()
    } catch (err) {
      console.error('Error bulk deleting sponsors:', err)
      setError('Er ging iets mis bij het verwijderen van de sponsors')
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
              <SortableSponsorCard 
                key={sponsor.id} 
                sponsor={sponsor}
                onEdit={setEditingSponsor}
                onDelete={handleDelete}
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
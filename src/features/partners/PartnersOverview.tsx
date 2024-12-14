import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase/supabaseClient'
import { PartnerRow } from '../../types/partner'
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent
} from '@dnd-kit/core'
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { PartnerForm } from './components/PartnerForm'

const TIER_COLORS: Record<PartnerRow['tier'], string> = {
  bronze: 'bg-amber-700',
  silver: 'bg-gray-400',
  gold: 'bg-yellow-500'
}

function SortablePartner({ 
  partner, 
  index, 
  isSelected,
  onSelect,
  onEdit,
  onToggleVisibility
}: { 
  partner: PartnerRow
  index: number
  isSelected: boolean
  onSelect: (id: string, event: React.ChangeEvent<HTMLInputElement> | React.MouseEvent) => void
  onEdit: (partner: PartnerRow) => void
  onToggleVisibility: (partner: PartnerRow) => void
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ id: partner.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 1 : 0
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      aria-label={`Partner ${index + 1}: ${partner.name}`}
      className={`
        bg-white dark:bg-gray-800 rounded-lg shadow-sm 
        transition-all duration-200
        ${isDragging ? 'shadow-xl scale-[1.02] bg-gray-50 dark:bg-gray-700' : 'hover:shadow-md'}
        ${isSelected ? 'ring-2 ring-indigo-500' : ''}
      `}
    >
      <div className="flex items-center p-4">
        {/* Drag Handle */}
        <div
          {...attributes}
          {...listeners}
          className="flex items-center justify-center w-8 h-8 rounded-lg cursor-grab 
            hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors mr-3
            text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300"
          title="Versleep om volgorde aan te passen"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8h16M4 16h16" />
          </svg>
        </div>

        {/* Checkbox */}
        <div className="mr-4">
          <input
            type="checkbox"
            checked={isSelected}
            onChange={(e) => onSelect(partner.id, e)}
            className="w-4 h-4 text-indigo-600 rounded border-gray-300 
              focus:ring-indigo-500 dark:border-gray-600 dark:bg-gray-700
              dark:checked:bg-indigo-600 transition-colors"
          />
        </div>

        {/* Logo */}
        <div className="relative flex-shrink-0 w-32 h-20 rounded-lg overflow-hidden group bg-gray-100 dark:bg-gray-700">
          <img 
            src={partner.logo} 
            alt={partner.name}
            className="w-full h-full object-contain p-2"
          />
        </div>

        {/* Info */}
        <div className="ml-4 flex-grow">
          <div className="flex flex-col space-y-1">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-200">
                  {partner.name}
                </span>
                <span className={`px-2 py-1 text-xs rounded-full text-white ${TIER_COLORS[partner.tier]}`}>
                  {partner.tier}
                </span>
              </div>
              <span className="text-xs text-gray-500 dark:text-gray-400">
                Sinds {partner.since}
              </span>
            </div>
            <span className="text-sm text-gray-500 dark:text-gray-400">
              {partner.description}
            </span>
            {partner.website && (
              <a 
                href={partner.website}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-indigo-600 hover:text-indigo-500 dark:text-indigo-400"
              >
                Website bezoeken
              </a>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center space-x-2">
          <button
            onClick={() => onEdit(partner)}
            className="p-2 text-gray-400 hover:text-gray-600 dark:text-gray-500 
              dark:hover:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700
              transition-colors"
            title="Partner bewerken"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
          </button>

          <button
            onClick={() => onToggleVisibility(partner)}
            className="p-2 text-gray-400 hover:text-gray-600 dark:text-gray-500 
              dark:hover:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700
              transition-colors"
            title={partner.visible ? "Partner verbergen" : "Partner zichtbaar maken"}
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              {partner.visible ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                  d="M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                  d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
              )}
            </svg>
          </button>
        </div>
      </div>
    </div>
  )
} 

export function PartnersOverview() {
  const [partners, setPartners] = useState<PartnerRow[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedPartners, setSelectedPartners] = useState<Set<string>>(new Set())
  const [showForm, setShowForm] = useState(false)
  const [editingPartner, setEditingPartner] = useState<PartnerRow | undefined>(undefined)

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  useEffect(() => {
    fetchPartners()
  }, [])

  const fetchPartners = async () => {
    try {
      const { data, error } = await supabase
        .from('partners')
        .select('*')
        .order('order_number')

      if (error) throw error
      setPartners(data || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Er is een fout opgetreden')
    } finally {
      setLoading(false)
    }
  }

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event
    if (!over || active.id === over.id) return

    try {
      const oldIndex = partners.findIndex(partner => partner.id === active.id)
      const newIndex = partners.findIndex(partner => partner.id === over.id)

      // Optimistic update voor de UI
      const newPartners = arrayMove(partners, oldIndex, newIndex)
      setPartners(newPartners)

      // Update de volgorde via de specifieke stored procedure
      const { error } = await supabase.rpc('reorder_partners', {
        partner_ids: newPartners.map(p => p.id)
      })

      if (error) throw error
    } catch (error) {
      console.error('Drag error:', error)
      setError('Fout bij het updaten van de volgorde')
      await fetchPartners()
    }
  }

  const toggleSelection = (partnerId: string, event: React.ChangeEvent<HTMLInputElement> | React.MouseEvent) => {
    event.stopPropagation()
    const newSelection = new Set(selectedPartners)
    if (newSelection.has(partnerId)) {
      newSelection.delete(partnerId)
    } else {
      newSelection.add(partnerId)
    }
    setSelectedPartners(newSelection)
  }

  const selectAll = () => {
    setSelectedPartners(new Set(partners.map(p => p.id)))
  }

  const deselectAll = () => {
    setSelectedPartners(new Set())
  }

  const handleBulkDelete = async () => {
    if (selectedPartners.size === 0) return

    if (!confirm(`Weet je zeker dat je ${selectedPartners.size} partners wilt verwijderen?`)) {
      return
    }

    try {
      const { error } = await supabase
        .from('partners')
        .delete()
        .in('id', Array.from(selectedPartners))

      if (error) throw error

      await fetchPartners()
      setSelectedPartners(new Set())
    } catch (error) {
      console.error('Delete error:', error)
      setError('Fout bij het verwijderen van partners')
    }
  }

  const handleAdd = () => {
    setEditingPartner(undefined)
    setShowForm(true)
  }

  const handleEdit = (partner: PartnerRow) => {
    setEditingPartner(partner)
    setShowForm(true)
  }

  const handleFormComplete = () => {
    setShowForm(false)
    setEditingPartner(undefined)
    fetchPartners()
  }

  const handleToggleVisibility = async (partner: PartnerRow) => {
    try {
      const { error } = await supabase
        .from('partners')
        .update({ 
          visible: !partner.visible,
          updated_at: new Date().toISOString()
        })
        .eq('id', partner.id)

      if (error) throw error

      setPartners(partners.map(p => 
        p.id === partner.id 
          ? { ...p, visible: !p.visible }
          : p
      ))
    } catch (error) {
      console.error('Visibility toggle error:', error)
      setError('Fout bij het wijzigen van de zichtbaarheid')
    }
  }

  if (loading) return (
    <div className="flex justify-center items-center h-screen">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500"></div>
    </div>
  )
  
  if (error) return (
    <div className="text-red-500 p-4 text-center bg-red-50 rounded-lg">
      {error}
    </div>
  )

  return (
    <div className="max-w-7xl mx-auto p-4 space-y-6">
      {/* Header Section */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-800 dark:text-white">
              Partners & Sponsors
            </h2>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Beheer de partners en sponsors van DKL25
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-4">
            {selectedPartners.size > 0 ? (
              <>
                <div className="flex items-center gap-4">
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    {selectedPartners.size} partners geselecteerd
                  </span>
                  <button
                    onClick={deselectAll}
                    className="text-sm text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200"
                  >
                    Deselecteer alles
                  </button>
                  <button
                    onClick={handleBulkDelete}
                    className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors"
                  >
                    Verwijder geselecteerde
                  </button>
                </div>
              </>
            ) : (
              <button
                onClick={selectAll}
                className="text-sm text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200"
              >
                Selecteer alles
              </button>
            )}
          </div>
          <button
            onClick={handleAdd}
            className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Partner Toevoegen
          </button>
        </div>
      </div>

      {/* Partners Grid */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={partners.map(p => p.id)}
            strategy={verticalListSortingStrategy}
          >
            <div className="space-y-2">
              {partners.map((partner, index) => (
                <SortablePartner 
                  key={partner.id} 
                  partner={partner} 
                  index={index} 
                  isSelected={selectedPartners.has(partner.id)} 
                  onSelect={toggleSelection}
                  onEdit={handleEdit}
                  onToggleVisibility={handleToggleVisibility}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>

        {partners.length === 0 && !loading && (
          <div className="text-center py-12">
            <p className="text-gray-500 dark:text-gray-400">
              Nog geen partners toegevoegd
            </p>
          </div>
        )}
      </div>

      {/* Partner Form Modal */}
      {showForm && (
        <PartnerForm
          partner={editingPartner}
          onComplete={handleFormComplete}
          onCancel={() => setShowForm(false)}
        />
      )}
    </div>
  )
} 
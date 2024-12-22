import { useState } from 'react'
import { 
  EyeIcon, EyeSlashIcon, PencilIcon, TrashIcon 
} from '@heroicons/react/24/outline'
import { updatePartner, deletePartner } from '../services/partnerService'
import type { Partner } from '../types'
import { PartnerForm } from './PartnerForm'

interface PartnerCardProps {
  partner: Partner
  onUpdate: () => void
}

export function PartnerCard({ partner, onUpdate }: PartnerCardProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  const handleVisibilityToggle = async () => {
    try {
      await updatePartner(partner.id, { 
        visible: !partner.visible,
        updated_at: new Date().toISOString()
      })
      onUpdate()
    } catch (error) {
      console.error('Error toggling visibility:', error)
    }
  }

  const handleDelete = async () => {
    if (!window.confirm('Weet je zeker dat je deze partner wilt verwijderen?')) {
      return
    }

    try {
      setIsDeleting(true)
      await deletePartner(partner.id)  // was: deletePartnerFromAPI
      onUpdate()
    } catch (error) {
      console.error('Error deleting partner:', error)
    } finally {
      setIsDeleting(false)
    }
  }

  if (isEditing) {
    return (
      <PartnerForm
        partner={partner}
        onComplete={() => {
          setIsEditing(false)
          onUpdate()
        }}
        onCancel={() => setIsEditing(false)}
      />
    )
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
      {/* Logo/Image sectie */}
      <div className="aspect-[16/9] relative bg-gray-100">
        {partner.logo ? (
          <img
            src={partner.logo}
            alt={`${partner.name} logo`}
            className="w-full h-full object-contain p-2"
          />
        ) : (
          <div className="flex items-center justify-center h-full text-gray-400">
            <span className="text-sm">Geen logo</span>
          </div>
        )}
      </div>

      {/* Content sectie */}
      <div className="p-4">
        <div className="flex justify-between items-start mb-2">
          <h3 className="text-lg font-semibold text-gray-900">
            {partner.name}
          </h3>
        </div>

        {partner.description && (
          <p className="text-sm text-gray-600 mb-4">
            {partner.description}
          </p>
        )}

        {/* Acties */}
        <div className="flex justify-between items-center mt-4 pt-4 border-t border-gray-100">
          <button
            onClick={handleVisibilityToggle}
            className={`text-sm px-3 py-1 rounded-md flex items-center gap-2 ${
              partner.visible
                ? 'text-green-700 bg-green-50 hover:bg-green-100'
                : 'text-gray-700 bg-gray-50 hover:bg-gray-100'
            }`}
          >
            {partner.visible ? (
              <>
                <EyeIcon className="w-4 h-4" />
                Zichtbaar
              </>
            ) : (
              <>
                <EyeSlashIcon className="w-4 h-4" />
                Verborgen
              </>
            )}
          </button>

          <div className="flex gap-2">
            <button
              onClick={() => setIsEditing(true)}
              className="text-gray-400 hover:text-gray-600"
              title="Bewerken"
            >
              <PencilIcon className="w-5 h-5" />
            </button>
            <button
              onClick={handleDelete}
              className="text-gray-400 hover:text-red-600"
              title="Verwijderen"
              disabled={isDeleting}
            >
              <TrashIcon className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
} 
import { useState } from 'react'
import { PencilIcon, TrashIcon } from '@heroicons/react/24/outline'
import { deletePartner } from '../services/partnerService'
import type { Partner } from '../types'
import { PartnerForm } from './PartnerForm'

interface PartnerCardProps {
  partner: Partner
  onUpdate: () => void
}

export function PartnerCard({ partner, onUpdate }: PartnerCardProps) {
  const [isEditing, setIsEditing] = useState(false)

  const handleDelete = async () => {
    if (!window.confirm('Weet je zeker dat je deze partner wilt verwijderen?')) {
      return
    }

    try {
      await deletePartner(partner.id)
      onUpdate()
    } catch (error) {
      console.error('Error deleting partner:', error)
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
    <div className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow">
      <div className="aspect-[3/2] p-4 bg-gray-50 rounded-t-lg flex items-center justify-center">
        <img
          src={partner.logo}
          alt={`${partner.name} logo`}
          className="max-w-[85%] max-h-[85%] object-contain"
        />
      </div>
      
      <div className="p-4">
        <div className="flex justify-between items-start mb-2">
          <h3 className="text-lg font-semibold text-gray-900">{partner.name}</h3>
          <div className="flex space-x-2">
            <button 
              onClick={() => setIsEditing(true)}
              className="p-1 text-gray-400 hover:text-gray-500"
            >
              <PencilIcon className="w-5 h-5" />
            </button>
            <button 
              onClick={handleDelete}
              className="p-1 text-gray-400 hover:text-red-500"
            >
              <TrashIcon className="w-5 h-5" />
            </button>
          </div>
        </div>
        
        <p className="text-sm text-gray-600 mb-2">{partner.description}</p>
        
        <div className="text-sm text-gray-500">
          <p>Tier: {partner.tier}</p>
          <p>
            Status:{' '}
            <span
              className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                partner.visible
                  ? 'bg-green-100 text-green-800'
                  : 'bg-gray-100 text-gray-800'
              }`}
            >
              {partner.visible ? 'Zichtbaar' : 'Verborgen'}
            </span>
          </p>
          {partner.website && (
            <a
              href={partner.website}
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
  )
} 
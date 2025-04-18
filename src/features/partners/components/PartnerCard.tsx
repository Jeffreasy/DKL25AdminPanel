import { useState } from 'react'
import { PencilIcon, TrashIcon } from '@heroicons/react/24/outline'
import { deletePartner } from '../services/partnerService'
import type { Partner } from '../types'
import { PartnerForm } from './PartnerForm'
import { cc } from '../../../styles/shared'

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
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm dark:shadow-md hover:shadow-md dark:hover:shadow-lg transition-shadow border border-gray-200 dark:border-gray-700 flex flex-col">
      <div className="h-40 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-t-lg flex items-center justify-center border-b border-gray-200 dark:border-gray-600">
        <img
          src={partner.logo}
          alt={`${partner.name} logo`}
          className="object-contain w-full h-full"
        />
      </div>
      
      <div className="p-4 flex-grow flex flex-col justify-between">
        <div>
          <div className="flex justify-between items-start mb-2">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{partner.name}</h3>
            <div className="flex space-x-1">
              <button 
                onClick={() => setIsEditing(true)}
                className={cc.button.icon({ size: 'sm', color: 'secondary' })}
              >
                <PencilIcon className="w-4 h-4" />
              </button>
              <button 
                onClick={handleDelete}
                className={cc.button.iconDanger({ size: 'sm' })}
              >
                <TrashIcon className="w-4 h-4" />
              </button>
            </div>
          </div>
          
          <p className="text-sm text-gray-600 dark:text-gray-300 mb-3">{partner.description || "Geen beschrijving."}</p>
        </div>
        
        <div>
          <div className="text-sm text-gray-500 dark:text-gray-400 space-y-1">
            <p>Tier: <span className="font-medium text-gray-700 dark:text-gray-200 capitalize">{partner.tier}</span></p>
            <p>
              Status:{' '}
              <span
                className={cc.badge({ color: partner.visible ? 'green' : 'gray', className: 'ml-1' })}
              >
                {partner.visible ? 'Zichtbaar' : 'Verborgen'}
              </span>
            </p>
            {partner.website && (
              <a
                href={partner.website}
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
  )
} 
import { useState } from 'react'
import { PencilIcon, TrashIcon } from '@heroicons/react/24/outline'
import { deletePartner } from '../services/partnerService'
import type { Partner } from '../types'
import { PartnerForm } from './PartnerForm'
import { cc } from '../../../styles/shared'
import { ConfirmDialog } from '../../../components/ui'

interface PartnerCardProps {
  partner: Partner
  onUpdate: () => void
}

export function PartnerCard({ partner, onUpdate }: PartnerCardProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

  const confirmDelete = async () => {
    try {
      await deletePartner(partner.id)
      onUpdate()
    } catch (error) {
      console.error('Error deleting partner:', error)
    } finally {
      setShowDeleteConfirm(false)
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
    <div className={`bg-white dark:bg-gray-800 rounded-lg shadow-sm dark:shadow-md border border-gray-200 dark:border-gray-700 flex flex-col ${cc.hover.cardLarge} ${cc.transition.normal}`}>
      <div className={`h-40 ${cc.spacing.container.sm} bg-gray-50 dark:bg-gray-700/50 rounded-t-lg flex items-center justify-center border-b border-gray-200 dark:border-gray-600`}>
        <img
          src={partner.logo || ''}
          alt={`${partner.name} logo`}
          className="object-contain w-full h-full"
          loading="lazy"
        />
      </div>
      
      <div className={`${cc.spacing.container.sm} flex-grow flex flex-col justify-between`}>
        <div>
          <div className={`flex justify-between items-start ${cc.spacing.gap.sm}`}>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{partner.name}</h3>
            <div className={`flex ${cc.spacing.gap.xs}`}>
              <button
                onClick={() => setIsEditing(true)}
                className={cc.button.icon({ size: 'sm', color: 'secondary' })}
                title="Bewerken"
              >
                <PencilIcon className="w-4 h-4" />
              </button>
              <button
                onClick={() => setShowDeleteConfirm(true)}
                className={cc.button.iconDanger({ size: 'sm' })}
                title="Verwijderen"
              >
                <TrashIcon className="w-4 h-4" />
              </button>
            </div>
          </div>
          
          <p className={`text-sm text-gray-600 dark:text-gray-300 ${cc.spacing.py.md}`}>{partner.description || "Geen beschrijving."}</p>
        </div>
        
        <div>
          <div className={`text-sm text-gray-500 dark:text-gray-400 ${cc.spacing.section.xs}`}>
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
                className={`text-indigo-600 hover:text-indigo-800 dark:text-indigo-400 dark:hover:text-indigo-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 dark:focus:ring-offset-gray-800 rounded inline-flex items-center ${cc.spacing.gap.xs} mt-2 group ${cc.transition.colors}`}
              >
                Bezoek website
                <svg className={`w-4 h-4 ${cc.transition.transform} group-hover:translate-x-0.5`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
              </a>
            )}
          </div>
        </div>
      </div>

      <ConfirmDialog
        open={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={confirmDelete}
        title="Partner verwijderen"
        message={`Weet je zeker dat je "${partner.name}" wilt verwijderen? Deze actie kan niet ongedaan worden gemaakt.`}
        confirmText="Verwijderen"
        variant="danger"
      />
    </div>
  )
}
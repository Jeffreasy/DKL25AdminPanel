import { EyeIcon, EyeSlashIcon, PencilIcon, TrashIcon } from '@heroicons/react/24/outline'
import type { Sponsor } from '../types'
import { cc } from '../../../styles/shared'

interface SponsorCardProps {
  sponsor: Sponsor
  onEdit: (sponsor: Sponsor) => void
  onDelete: (sponsor: Sponsor) => void
  onVisibilityToggle: (sponsor: Sponsor) => void
}

export function SponsorCard({ sponsor, onEdit, onDelete, onVisibilityToggle }: SponsorCardProps) {
  return (
    <div className={`bg-white dark:bg-gray-800 rounded-lg shadow-sm dark:shadow-md border border-gray-200 dark:border-gray-700 overflow-hidden ${cc.hover.cardLarge} ${cc.transition.normal}`}>
      <div className="cursor-grab">
        <div className="aspect-[3/2] bg-gray-100 dark:bg-gray-700 relative">
          <img
            src={sponsor.logoUrl}
            alt={`${sponsor.name} logo`}
            className="w-full h-full object-contain p-4"
            loading="lazy"
          />
          {!sponsor.visible && (
            <div className="absolute top-2 right-2 px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded text-xs text-gray-600 dark:text-gray-300 border border-gray-300 dark:border-gray-600">
              Verborgen
            </div>
          )}
        </div>
      </div>

      <div className={cc.spacing.container.sm}>
        <h3 className="font-medium text-gray-900 dark:text-white">{sponsor.name}</h3>
        {sponsor.description && (
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400 line-clamp-2">
            {sponsor.description}
          </p>
        )}
        {sponsor.websiteUrl && (
          <a
            href={sponsor.websiteUrl}
            target="_blank"
            rel="noopener noreferrer"
            className={`mt-2 inline-flex items-center text-sm text-indigo-600 dark:text-indigo-400 hover:text-indigo-500 dark:hover:text-indigo-300 ${cc.transition.colors}`}
            onClick={(e) => e.stopPropagation()}
          >
            Bezoek website
            <svg className={`ml-1 w-4 h-4 ${cc.transition.transform} group-hover:translate-x-0.5`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
          </a>
        )}
      </div>

      <div className={`${cc.spacing.px.sm} ${cc.spacing.py.md} bg-gray-50 dark:bg-gray-800/50 border-t border-gray-200 dark:border-gray-700 flex justify-end ${cc.spacing.gap.sm}`}>
        <button
          onClick={() => onVisibilityToggle(sponsor)}
          className={cc.button.icon({ size: 'sm', color: 'secondary' })}
          title={sponsor.visible ? 'Verbergen' : 'Zichtbaar maken'}
        >
          {sponsor.visible ? (
            <EyeIcon className="w-5 h-5" />
          ) : (
            <EyeSlashIcon className="w-5 h-5" />
          )}
        </button>
        <button
          onClick={() => onEdit(sponsor)}
          className={cc.button.icon({ size: 'sm', color: 'secondary' })}
          title="Bewerken"
        >
          <PencilIcon className="w-5 h-5" />
        </button>
        <button
          onClick={() => onDelete(sponsor)}
          className={cc.button.iconDanger({ size: 'sm' })}
          title="Verwijderen"
        >
          <TrashIcon className="w-5 h-5" />
        </button>
      </div>
    </div>
  )
}
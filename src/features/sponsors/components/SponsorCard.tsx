import { EyeIcon, EyeSlashIcon, PencilIcon, TrashIcon } from '@heroicons/react/24/outline'
import type { Sponsor } from '../types'

interface SponsorCardProps {
  sponsor: Sponsor
  onEdit: (sponsor: Sponsor) => void
  onDelete: (sponsor: Sponsor) => void
  onVisibilityToggle: (sponsor: Sponsor) => void
}

export function SponsorCard({ sponsor, onEdit, onDelete, onVisibilityToggle }: SponsorCardProps) {
  return (
    <div className="bg-white rounded-lg shadow overflow-hidden hover:shadow-md transition-shadow">
      <div className="cursor-grab">
        <div className="aspect-[3/2] bg-gray-100 relative">
          <img
            src={sponsor.logoUrl}
            alt={`${sponsor.name} logo`}
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
        {sponsor.websiteUrl && (
          <a
            href={sponsor.websiteUrl}
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
          onClick={() => onVisibilityToggle(sponsor)}
          className="p-1.5 text-gray-500 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
        >
          {sponsor.visible ? (
            <EyeIcon className="w-5 h-5" />
          ) : (
            <EyeSlashIcon className="w-5 h-5" />
          )}
        </button>
        <button
          onClick={() => onEdit(sponsor)}
          className="p-1.5 text-gray-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
        >
          <PencilIcon className="w-5 h-5" />
        </button>
        <button
          onClick={() => onDelete(sponsor)}
          className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
        >
          <TrashIcon className="w-5 h-5" />
        </button>
      </div>
    </div>
  )
} 
import { cc } from '../../../../styles/shared'

interface AlbumDetailHeaderProps {
  title: string
  visible: boolean
  onVisibilityToggle: () => void
  onEdit: () => void
  onClose: () => void
  loading: boolean
}

export function AlbumDetailHeader({
  title,
  visible,
  onVisibilityToggle,
  onEdit,
  onClose,
  loading
}: AlbumDetailHeaderProps) {
  return (
    <div className="px-4 py-3 sm:px-6 sm:py-4 border-b border-gray-200 dark:border-gray-700 flex flex-col sm:flex-row justify-between sm:items-center gap-2 sm:gap-4 flex-shrink-0">
      <h2 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-gray-100 truncate">
        Album: {title}
      </h2>
      <div className="flex items-center justify-end sm:justify-start gap-1 sm:gap-2 flex-wrap">
        <button
          onClick={onVisibilityToggle}
          disabled={loading}
          className={cc.button.base({
            size: 'sm',
            color: visible ? 'secondary' : 'secondary',
            className: visible
              ? 'text-green-700 dark:text-green-300 bg-green-100 dark:bg-green-900/50 hover:bg-green-200 dark:hover:bg-green-900'
              : 'text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600'
          })}
        >
          {visible ? 'Zichtbaar' : 'Verborgen'}
        </button>
        <button
          onClick={onEdit}
          className={cc.button.base({ size: 'sm', color: 'secondary' })}
        >
          Bewerken
        </button>
        <button
          onClick={onClose}
          className={cc.button.icon({ size: 'sm', color: 'secondary' })}
        >
          <span className="sr-only">Sluiten</span>
          <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>
  )
}
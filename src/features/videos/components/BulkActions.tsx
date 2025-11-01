import React from 'react'
import { TrashIcon } from '@heroicons/react/24/outline'
import { cc } from '../../../styles/shared'

interface BulkActionsProps {
  selectedCount: number
  onBulkDelete: () => void
  isDragging?: boolean
}

export function BulkActions({ selectedCount, onBulkDelete, isDragging = false }: BulkActionsProps) {
  if (selectedCount === 0) {
    return null
  }

  return (
    <div className="mb-4 flex justify-between items-center bg-blue-100 dark:bg-blue-900/50 p-2 rounded border border-blue-200 dark:border-blue-800">
      <span className="text-sm font-medium text-blue-800 dark:text-blue-300">
        {selectedCount} video{selectedCount === 1 ? '' : "'s"} geselecteerd
      </span>
      <button
        onClick={onBulkDelete}
        className={cc.button.base({ color: 'danger', className: 'flex items-center gap-1' })}
        disabled={isDragging}
      >
        <TrashIcon className="h-4 w-4" />
        <span>Verwijder Geselecteerde</span>
      </button>
    </div>
  )
}
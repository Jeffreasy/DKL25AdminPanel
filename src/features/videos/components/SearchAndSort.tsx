import React from 'react'
import { MagnifyingGlassIcon } from '@heroicons/react/24/outline'
import { cc } from '../../../styles/shared'

interface SearchAndSortProps {
  searchQuery: string
  sortOrder: 'asc' | 'desc'
  onSearchChange: (query: string) => void
  onSortChange: (order: 'asc' | 'desc') => void
  isDragging?: boolean
}

export function SearchAndSort({
  searchQuery,
  sortOrder,
  onSearchChange,
  onSortChange,
  isDragging = false
}: SearchAndSortProps) {
  return (
    <div className="flex gap-2 items-center">
      <div className="relative">
        <input
          type="text"
          placeholder="Zoeken..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className={cc.form.input({ className: 'pl-8' })}
          disabled={isDragging}
        />
        <MagnifyingGlassIcon className="absolute left-2 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 dark:text-gray-500" />
      </div>
      <select
        value={sortOrder}
        onChange={(e) => onSortChange(e.target.value as 'asc' | 'desc')}
        className={cc.form.input()}
        disabled={isDragging}
      >
        <option value="asc">Oplopend (Volgorde)</option>
        <option value="desc">Aflopend (Volgorde)</option>
      </select>
    </div>
  )
}
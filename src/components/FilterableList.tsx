import { useState } from 'react'
import { Select } from '@mantine/core'

// Base interface voor items die gesorteerd kunnen worden
interface Sortable {
  [key: string]: string | number | boolean | Date | null
}

interface SortOption<T extends Sortable> {
  label: string
  value: {
    column: keyof T
    ascending: boolean
  }
}

interface StatusOption {
  label: string
  value: string
}

interface StatusFilter {
  label: string
  options: StatusOption[]
}

export interface FilterableListProps<T extends Sortable> {
  title: string
  data: T[]
  sortOptions: SortOption<T>[]
  statusFilter?: StatusFilter
  renderItem: (item: T) => React.ReactNode
}

export function FilterableList<T extends Sortable>({ 
  title,
  data,
  sortOptions,
  statusFilter,
  renderItem
}: FilterableListProps<T>) {
  const [sortBy, setSortBy] = useState(sortOptions[0].value)
  const [statusValue, setStatusValue] = useState<string | null>(null)

  // Sort data
  const sortedData = [...data].sort((a, b) => {
    const aValue = a[sortBy.column]
    const bValue = b[sortBy.column]

    // Handle different types of values
    if (aValue instanceof Date && bValue instanceof Date) {
      return sortBy.ascending ? aValue.getTime() - bValue.getTime() : bValue.getTime() - aValue.getTime()
    }

    if (typeof aValue === 'string' && typeof bValue === 'string') {
      return sortBy.ascending ? aValue.localeCompare(bValue) : bValue.localeCompare(aValue)
    }

    if (typeof aValue === 'number' && typeof bValue === 'number') {
      return sortBy.ascending ? aValue - bValue : bValue - aValue
    }

    if (typeof aValue === 'boolean' && typeof bValue === 'boolean') {
      return sortBy.ascending ? (aValue === bValue ? 0 : aValue ? 1 : -1) : (aValue === bValue ? 0 : aValue ? -1 : 1)
    }

    // Handle null values
    if (aValue === null) return sortBy.ascending ? -1 : 1
    if (bValue === null) return sortBy.ascending ? 1 : -1

    return 0
  })

  // Filter by status if needed
  const filteredData = statusValue 
    ? sortedData.filter(item => 'status' in item && item.status === statusValue)
    : sortedData

  return (
    <div className="bg-[#1B2B3A] rounded-lg overflow-hidden">
      <div className="px-4 py-3 border-b border-gray-700">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-medium text-white">{title}</h3>
          <div className="flex gap-2">
            {statusFilter && (
              <Select
                size="xs"
                placeholder={statusFilter.label}
                data={statusFilter.options}
                value={statusValue}
                onChange={setStatusValue}
                clearable
                className="min-w-[140px]"
              />
            )}
            <Select
              size="xs"
              placeholder="Sorteren"
              data={sortOptions.map(option => ({
                label: option.label,
                value: JSON.stringify(option.value)
              }))}
              value={JSON.stringify(sortBy)}
              onChange={(value) => value && setSortBy(JSON.parse(value))}
              className="min-w-[140px]"
            />
          </div>
        </div>
      </div>

      <div className="divide-y divide-gray-700">
        {filteredData.length === 0 ? (
          <div className="px-4 py-3 text-sm text-gray-400 text-center">
            Geen items gevonden
          </div>
        ) : (
          filteredData.map((item, index) => (
            <div key={index} className="px-4">
              {renderItem(item)}
            </div>
          ))
        )}
      </div>
    </div>
  )
} 
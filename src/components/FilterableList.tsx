import { useState } from 'react'
import { Select } from '@mantine/core'

interface SortOption {
  label: string
  value: {
    column: string
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

export interface FilterableListProps<T> {
  title: string
  data: T[]
  sortOptions: SortOption[]
  statusFilter?: StatusFilter
  renderItem: (item: T) => React.ReactNode
}

export function FilterableList<T extends { [key: string]: any }>({ 
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
    const modifier = sortBy.ascending ? 1 : -1
    return aValue < bValue ? -1 * modifier : aValue > bValue ? 1 * modifier : 0
  })

  // Filter by status if needed
  const filteredData = statusValue 
    ? sortedData.filter(item => item.status === statusValue)
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
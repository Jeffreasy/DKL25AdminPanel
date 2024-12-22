import { useState, useEffect } from 'react'
import { LoadingSkeleton } from './LoadingSkeleton'
import { ErrorText } from './typography'

interface SortOption {
  label: string
  value: {
    column: string
    ascending: boolean
  }
}

interface FilterableListProps<T> {
  title: string
  renderItem: (item: T) => React.ReactNode
  sortOptions?: SortOption[]
  filters?: Record<string, any>
  initialSort?: SortOption['value']
  className?: string
}

// TODO: Vervang dit door je nieuwe API service
const fetchDataFromAPI = async <T,>(params: {
  table: string
  sortBy?: { column: string; ascending: boolean }
  filters?: Record<string, any>
}): Promise<T[]> => {
  // Implementeer je nieuwe API call hier
  console.log('Fetching data with params:', params)
  return []
}

export function FilterableList<T>({ 
  title,
  renderItem,
  sortOptions = [],
  filters = {},
  initialSort,
  className
}: FilterableListProps<T>) {
  const [data, setData] = useState<T[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [currentSort, setCurrentSort] = useState(initialSort || sortOptions[0]?.value)

  useEffect(() => {
    fetchData()
  }, [currentSort, filters])

  const fetchData = async () => {
    try {
      setLoading(true)
      const items = await fetchDataFromAPI<T>({
        table: title.toLowerCase(),
        sortBy: currentSort,
        filters
      })
      setData(items)
    } catch (err) {
      console.error(`Error fetching ${title}:`, err)
      setError(`Er ging iets mis bij het ophalen van de ${title.toLowerCase()}`)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <LoadingSkeleton key={i} className="h-24" />
        ))}
      </div>
    )
  }

  if (error) {
    return <ErrorText>{error}</ErrorText>
  }

  return (
    <div className={`space-y-4 ${className || ''}`}>
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-medium text-gray-900">
          {title}
        </h2>
        {sortOptions.length > 0 && (
          <select
            value={`${currentSort?.column}-${currentSort?.ascending}`}
            onChange={(e) => {
              const [column, ascending] = e.target.value.split('-')
              setCurrentSort({
                column,
                ascending: ascending === 'true'
              })
            }}
            className="text-sm border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          >
            {sortOptions.map((option) => (
              <option
                key={`${option.value.column}-${option.value.ascending}`}
                value={`${option.value.column}-${option.value.ascending}`}
              >
                {option.label}
              </option>
            ))}
          </select>
        )}
      </div>

      <div className="bg-white shadow rounded-lg divide-y divide-gray-200">
        {data.length === 0 ? (
          <div className="p-4 text-center text-gray-500">
            Geen {title.toLowerCase()} gevonden
          </div>
        ) : (
          data.map((item, index) => (
            <div key={index}>
              {renderItem(item)}
            </div>
          ))
        )}
      </div>
    </div>
  )
} 
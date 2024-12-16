import { useState, useTransition } from 'react'
import { useInfiniteList } from '../hooks/useInfiniteList'
import { H3, SmallText } from './typography'
import { VirtualItem } from '@tanstack/react-virtual'

interface FilterableListProps<T> {
  title: string
  table: string
  queryKey: string
  renderItem: (item: T) => React.ReactNode
  filters?: Record<string, any>
  sortOptions?: Array<{
    label: string
    value: { column: string; ascending: boolean }
  }>
}

export function FilterableList<T>({
  title,
  table,
  queryKey,
  renderItem,
  filters,
  sortOptions
}: FilterableListProps<T>) {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedSort, setSelectedSort] = useState(sortOptions?.[0]?.value)
  const [isPending, startTransition] = useTransition()

  const {
    parentRef,
    virtualizer,
    items,
    isLoading,
    isRefetching,
    refetch,
    handleScroll
  } = useInfiniteList({
    queryKey,
    table,
    filters,
    sortBy: selectedSort,
    searchQuery
  })

  // Pull to refresh implementation
  const [startY, setStartY] = useState(0)
  const [pulling, setPulling] = useState(false)
  const [refreshing, setRefreshing] = useState(false)

  const handleTouchStart = (e: React.TouchEvent) => {
    const touch = e.touches[0]
    setStartY(touch.clientY)
  }

  const handleTouchMove = async (e: React.TouchEvent) => {
    const touch = e.touches[0]
    const deltaY = touch.clientY - startY

    if (deltaY > 50 && !refreshing && !pulling) {
      setPulling(true)
      setRefreshing(true)
      await refetch()
      setRefreshing(false)
      setPulling(false)
    }
  }

  return (
    <div className="bg-white rounded-lg shadow-sm overflow-hidden">
      <div className="p-4 border-b border-gray-200">
        <div className="flex justify-between items-center mb-4">
          <H3>{title}</H3>
          {sortOptions && (
            <select
              className="text-sm border-gray-300 rounded-md"
              onChange={(e) => {
                const option = sortOptions[Number(e.target.value)]
                startTransition(() => {
                  setSelectedSort(option.value)
                })
              }}
            >
              {sortOptions.map((option, index) => (
                <option key={index} value={index}>
                  {option.label}
                </option>
              ))}
            </select>
          )}
        </div>

        <input
          type="search"
          placeholder="Zoeken..."
          className="w-full px-3 py-2 border border-gray-300 rounded-md"
          value={searchQuery}
          onChange={(e) => {
            startTransition(() => {
              setSearchQuery(e.target.value)
            })
          }}
        />
      </div>

      <div
        ref={parentRef}
        onScroll={handleScroll}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        className="h-[calc(100vh-300px)] overflow-auto relative"
        style={{
          transform: pulling ? `translateY(${Math.min(100, 50)}px)` : undefined,
          transition: pulling ? undefined : 'transform 0.2s ease'
        }}
      >
        {(isLoading || isPending) && (
          <div className="absolute inset-0 bg-white/50 flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500" />
          </div>
        )}

        <div
          style={{
            height: `${virtualizer.getTotalSize()}px`,
            width: '100%',
            position: 'relative'
          }}
        >
          {virtualizer.getVirtualItems().map((virtualRow: VirtualItem) => {
            const item = items[virtualRow.index]
            return (
              <div
                key={virtualRow.index}
                data-index={virtualRow.index}
                ref={virtualizer.measureElement}
                className={`absolute top-0 left-0 w-full transform transition-opacity duration-200 ${
                  isRefetching ? 'opacity-50' : 'opacity-100'
                }`}
                style={{
                  transform: `translateY(${virtualRow.start}px)`
                }}
              >
                {item ? renderItem(item as T) : <div className="p-4">Loading...</div>}
              </div>
            )
          })}
        </div>

        {refreshing && (
          <div className="absolute top-0 left-0 right-0 flex justify-center p-2">
            <SmallText>Vernieuwen...</SmallText>
          </div>
        )}
      </div>
    </div>
  )
} 
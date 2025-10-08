import { cc } from '../../../../styles/shared'

interface PhotosPaginationProps {
  hasMore: boolean
  loadingMore: boolean
  onLoadMore: () => void
  loadedCount: number
}

export function PhotosPagination({ hasMore, loadingMore, onLoadMore, loadedCount }: PhotosPaginationProps) {
  if (!hasMore && loadedCount === 0) return null

  return (
    <div className="flex justify-center pt-4">
      {hasMore ? (
        <button
          onClick={onLoadMore}
          disabled={loadingMore}
          className={cc.button.base({ color: 'secondary' })}
        >
          {loadingMore ? 'Bezig met laden...' : 'Meer laden'}
        </button>
      ) : (
        <div className="text-sm text-gray-500 dark:text-gray-400">
          {loadedCount} foto{loadedCount !== 1 ? 's' : ''} geladen
        </div>
      )}
    </div>
  )
}
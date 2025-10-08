import { useNavigate } from 'react-router-dom'
import { useFavorites } from '../../providers/FavoritesProvider'
import { StarIcon } from '@heroicons/react/24/outline'
import { StarIcon as StarIconSolid } from '@heroicons/react/24/solid'
import { cc } from '../../styles/shared'

export function FavoritePages() {
  const { favorites, removeFavorite } = useFavorites()
  const navigate = useNavigate()

  if (favorites.length === 0) return null

  return (
    <div className="mt-4">
      <h3 className="px-2 text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-2">
        Favorieten
      </h3>
      <div className={cc.spacing.section.xs}>
        {favorites.map((page) => (
          <div
            key={page.id}
            className="group flex items-center"
          >
            <button
              onClick={() => navigate(page.path)}
              className={`flex-1 group flex items-center px-2 py-2 text-sm font-medium rounded-md text-gray-300 dark:text-gray-300 hover:bg-gray-700 dark:hover:bg-gray-800 hover:text-white dark:hover:text-white ${cc.transition.colors}`}
            >
              <StarIconSolid className="mr-3 h-5 w-5 text-yellow-400 dark:text-yellow-500 flex-shrink-0" aria-hidden="true" />
              <span className="truncate">{page.name}</span>
            </button>
            <button
              onClick={() => removeFavorite(page.id)}
              className={`${cc.hover.fadeIn} p-2 text-gray-400 dark:text-gray-500 hover:text-gray-200 dark:hover:text-gray-300 ${cc.transition.colors}`}
              title="Verwijder favoriet"
              aria-label="Verwijder favoriet"
            >
              <StarIcon className="h-5 w-5" aria-hidden="true" />
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}
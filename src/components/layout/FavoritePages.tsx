import { useNavigate } from 'react-router-dom'
import { useFavorites } from '../../contexts/FavoritesContext'
import { StarIcon } from '@heroicons/react/24/outline'
import { StarIcon as StarIconSolid } from '@heroicons/react/24/solid'

export function FavoritePages() {
  const { favorites, removeFavorite } = useFavorites()
  const navigate = useNavigate()

  if (favorites.length === 0) return null

  return (
    <div className="px-2 py-4">
      <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
        Favorieten
      </h3>
      <div className="space-y-1">
        {favorites.map((page) => (
          <div
            key={page.id}
            className="group flex items-center"
          >
            <button
              onClick={() => navigate(page.path)}
              className="flex-1 group flex items-center px-2 py-2 text-sm font-medium rounded-md text-gray-600 hover:bg-gray-50 hover:text-gray-900"
            >
              <StarIconSolid className="mr-3 h-5 w-5 text-yellow-400" />
              <span className="truncate">{page.name}</span>
            </button>
            <button
              onClick={() => removeFavorite(page.id)}
              className="hidden group-hover:flex p-2 text-gray-400 hover:text-gray-500"
            >
              <span className="sr-only">Verwijder favoriet</span>
              <StarIcon className="h-5 w-5" />
            </button>
          </div>
        ))}
      </div>
    </div>
  )
} 
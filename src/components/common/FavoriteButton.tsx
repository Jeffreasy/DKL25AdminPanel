import { StarIcon } from '@heroicons/react/24/outline'
import { StarIcon as StarIconSolid } from '@heroicons/react/24/solid'
import { useFavorites } from '../../contexts/FavoritesContext'

interface FavoriteButtonProps {
  name: string
  path: string
  icon: string
}

export function FavoriteButton({ name, path, icon }: FavoriteButtonProps) {
  const { isFavorite, addFavorite, removeFavorite } = useFavorites()
  const favorite = isFavorite(path)

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()

    if (favorite) {
      removeFavorite(path)
    } else {
      addFavorite({ name, path, icon })
    }
  }

  return (
    <button
      onClick={handleClick}
      className="ml-auto p-1 text-gray-400 dark:text-gray-500 hover:text-yellow-400 dark:hover:text-yellow-500"
    >
      {favorite ? (
        <StarIconSolid className="h-5 w-5 text-yellow-400 dark:text-yellow-500" />
      ) : (
        <StarIcon className="h-5 w-5" />
      )}
    </button>
  )
} 
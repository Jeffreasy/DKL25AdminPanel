import { createContext } from 'react'

export interface FavoritesContextType {
  favorites: string[]
  addFavorite: (id: string) => void
  removeFavorite: (id: string) => void
}

export const FavoritesContext = createContext<FavoritesContextType>({
  favorites: [],
  addFavorite: () => {},
  removeFavorite: () => {}
}) 
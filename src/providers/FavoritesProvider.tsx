import { createContext, useContext, useState, useEffect, ReactNode } from 'react'

interface FavoriteItem {
  id: string
  name: string
  path: string
  icon: string
}

interface FavoritesContextType {
  favorites: FavoriteItem[]
  addFavorite: (item: Omit<FavoriteItem, 'id'>) => void
  removeFavorite: (id: string) => void
  isFavorite: (path: string) => boolean
}

const FavoritesContext = createContext<FavoritesContextType | undefined>(undefined)

export function FavoritesProvider({ children }: { children: ReactNode }) {
  const [favorites, setFavorites] = useState<FavoriteItem[]>(() => {
    const saved = localStorage.getItem('favorites')
    return saved ? JSON.parse(saved) : []
  })

  useEffect(() => {
    localStorage.setItem('favorites', JSON.stringify(favorites))
  }, [favorites])

  const addFavorite = (item: Omit<FavoriteItem, 'id'>) => {
    const id = crypto.randomUUID()
    setFavorites(prev => [...prev, { ...item, id }])
  }

  const removeFavorite = (id: string) => {
    setFavorites(prev => prev.filter(item => item.id !== id))
  }

  const isFavorite = (path: string) => {
    return favorites.some(item => item.path === path)
  }

  return (
    <FavoritesContext.Provider value={{ favorites, addFavorite, removeFavorite, isFavorite }}>
      {children}
    </FavoritesContext.Provider>
  )
}

export function useFavorites() {
  const context = useContext(FavoritesContext)
  if (context === undefined) {
    throw new Error('useFavorites must be used within a FavoritesProvider')
  }
  return context
} 
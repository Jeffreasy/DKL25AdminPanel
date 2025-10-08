import { createContext } from 'react'
import type { Permission } from '../../users/types'

export interface User {
  id: string
  email: string | undefined
  role: string
  permissions?: Permission[]
  metadata?: Record<string, unknown>
  user_metadata?: {
    full_name?: string
    avatar_url?: string
    [key: string]: unknown
  }
}

export interface AuthContextType {
  user: User | null
  loading: boolean
  error: Error | null
  isAuthenticated: boolean
  isLoading: boolean
  signIn: (email: string, password: string) => Promise<void>
  signOut: () => Promise<void>
  logout: () => Promise<void>
  login?: (email: string, password: string) => Promise<{ success: boolean; error?: string }>
  loadUserProfile?: () => Promise<any>
  refreshToken?: () => Promise<string | null>
}

export const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  error: null,
  isAuthenticated: false,
  isLoading: true,
  signIn: async () => {},
  signOut: async () => {},
  logout: async () => {}
}) 
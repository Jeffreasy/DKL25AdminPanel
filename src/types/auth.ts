export interface AuthUser {
  id: string
  email: string
  role: 'admin' | 'super_admin'
  created_at: string
  last_sign_in_at: string | null
}

export interface AuthError {
  message: string
  status?: number
}

export interface AuthState {
  user: AuthUser | null
  loading: boolean
  error: AuthError | null
}

export interface AuthContextType extends AuthState {
  signIn: (email: string, password: string) => Promise<{ error: AuthError | null }>
  signOut: () => Promise<void>
  clearError: () => void
}

export interface LoginFormData {
  email: string
  password: string
}

export interface ResetPasswordData {
  email: string
} 
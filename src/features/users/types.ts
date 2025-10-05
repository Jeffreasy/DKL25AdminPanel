export interface User {
  id: string
  email: string
  naam: string
  rol: string
  is_actief: boolean
  created_at: string
  updated_at: string
}

export interface CreateUserRequest {
  email: string
  naam: string
  rol: string
  password: string
  is_actief: boolean
}

export interface UpdateUserRequest extends Partial<CreateUserRequest> {}

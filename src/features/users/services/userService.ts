import { authManager } from '../../../api/client/auth'
import type { User, CreateUserRequest, UpdateUserRequest } from '../types'

export const userService = {
  async getUsers(limit = 50, offset = 0): Promise<User[]> {
    return await authManager.makeAuthenticatedRequest(`/api/users?limit=${limit}&offset=${offset}`) as User[]
  },

  async createUser(request: CreateUserRequest): Promise<User> {
    return await authManager.makeAuthenticatedRequest('/api/users', {
      method: 'POST',
      body: JSON.stringify(request)
    }) as User
  },

  async getUser(id: string): Promise<User> {
    return await authManager.makeAuthenticatedRequest(`/api/users/${id}`) as User
  },

  async updateUser(id: string, request: UpdateUserRequest): Promise<User> {
    return await authManager.makeAuthenticatedRequest(`/api/users/${id}`, {
      method: 'PUT',
      body: JSON.stringify(request)
    }) as User
  },

  async deleteUser(id: string): Promise<void> {
    await authManager.makeAuthenticatedRequest(`/api/users/${id}`, { method: 'DELETE' })
  }
}

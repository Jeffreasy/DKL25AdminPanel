// API Error handling utility for RBAC permission errors
export interface PermissionError {
  error: string
  code: string
  details: {
    required_permission: string
    user_permissions: string[]
  }
}

export class ApiPermissionError extends Error {
  public code: string
  public requiredPermission: string
  public userPermissions: string[]

  constructor(errorData: PermissionError) {
    super(errorData.error)
    this.name = 'ApiPermissionError'
    this.code = errorData.code
    this.requiredPermission = errorData.details.required_permission
    this.userPermissions = errorData.details.user_permissions
  }
}

export async function handleApiResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    if (response.status === 403) {
      // Try to parse permission error
      try {
        const errorData: PermissionError = await response.json()
        if (errorData.code === 'PERMISSION_DENIED') {
          throw new ApiPermissionError(errorData)
        }
      } catch (parseError) {
        // If JSON parsing fails, try to get text content
        console.warn('Failed to parse 403 error as JSON:', parseError)
        throw new Error(`API Error ${response.status}: Permission denied`)
      }
    }

    // Generic error handling for non-403 errors
    try {
      const errorText = await response.text()
      throw new Error(`API Error ${response.status}: ${errorText}`)
    } catch {
      throw new Error(`API Error ${response.status}: ${response.statusText || 'Unknown error'}`)
    }
  }

  return response.json()
}

export function isPermissionError(error: unknown): error is ApiPermissionError {
  return error instanceof ApiPermissionError
}
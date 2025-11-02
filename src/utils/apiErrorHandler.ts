// API Error handling utility for RBAC and API errors
// Supports V1.49 backend error format with machine-readable codes

export interface ApiErrorResponse {
  error: string
  code: string
  details?: {
    required_permission?: string
    user_permissions?: string[]
    [key: string]: unknown
  }
}

export interface PermissionError extends ApiErrorResponse {
  details: {
    required_permission: string
    user_permissions: string[]
  }
}

export class ApiError extends Error {
  public code: string
  public status: number
  public details?: Record<string, unknown>

  constructor(errorData: ApiErrorResponse, status: number) {
    super(errorData.error)
    this.name = 'ApiError'
    this.code = errorData.code
    this.status = status
    this.details = errorData.details
  }
}

export class ApiPermissionError extends ApiError {
  public requiredPermission: string
  public userPermissions: string[]

  constructor(errorData: PermissionError, status: number) {
    super(errorData, status)
    this.name = 'ApiPermissionError'
    this.requiredPermission = errorData.details.required_permission
    this.userPermissions = errorData.details.user_permissions
  }
}

export async function handleApiResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    // Try to parse structured error response
    try {
      const errorData: ApiErrorResponse = await response.json()
      
      // Check if it's a permission error
      if (errorData.code === 'PERMISSION_DENIED' || errorData.code === 'FORBIDDEN') {
        if (errorData.details?.required_permission && errorData.details?.user_permissions) {
          throw new ApiPermissionError(errorData as PermissionError, response.status)
        }
      }
      
      // Generic API error with code
      throw new ApiError(errorData, response.status)
    } catch (parseError) {
      // If JSON parsing fails or error is already thrown, handle it
      if (parseError instanceof ApiError) {
        throw parseError
      }
      
      // Fallback for non-JSON errors
      console.warn('Failed to parse error response as JSON:', parseError)
      throw new ApiError(
        {
          error: response.statusText || `Request failed with status ${response.status}`,
          code: `HTTP_${response.status}`
        },
        response.status
      )
    }
  }

  return response.json()
}

export function isPermissionError(error: unknown): error is ApiPermissionError {
  return error instanceof ApiPermissionError
}

export function isApiError(error: unknown): error is ApiError {
  return error instanceof ApiError
}

// Helper to get user-friendly error message
export function getErrorMessage(error: unknown): string {
  if (isApiError(error)) {
    return error.message
  }
  if (error instanceof Error) {
    return error.message
  }
  return 'Er is een onbekende fout opgetreden'
}

// Helper to get error code for logging/debugging
export function getErrorCode(error: unknown): string | undefined {
  if (isApiError(error)) {
    return error.code
  }
  return undefined
}
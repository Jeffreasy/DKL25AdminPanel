/**
 * API Error Handler
 * Centralized error handling voor nieuwe backend response format
 */

/**
 * Backend Error Response Format
 * According to: docs/backend Docs/api/README.md
 */
export interface BackendErrorResponse {
  success: false;
  error: string;
  code?: string;
  details?: Record<string, unknown>;
}

/**
 * Backend Success Response Format
 */
export interface BackendSuccessResponse<T = unknown> {
  success: true;
  data: T;
  message?: string;
}

/**
 * Backend Paginated Response Format
 */
export interface BackendPaginatedResponse<T = unknown> {
  success: true;
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    total_pages: number;
  };
}

/**
 * API Error Class met metadata
 */
export class ApiError extends Error {
  constructor(
    message: string,
    public code?: string,
    public status?: number,
    public details?: Record<string, unknown>
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

/**
 * Parse backend error response en maak user-friendly message
 */
export function parseApiError(error: unknown): ApiError {
  // Axios/Fetch error met response
  if (error && typeof error === 'object' && 'response' in error) {
    const response = (error as { response?: { data?: unknown; status?: number } }).response;
    
    if (response?.data) {
      const data = response.data as BackendErrorResponse;
      const status = response.status || 500;
      
      // Map status codes to default messages
      const statusMessage = getStatusMessage(status);
      const message = data.error || statusMessage;
      
      return new ApiError(
        message,
        data.code || getHttpErrorCode(status),
        status,
        data.details
      );
    }
    
    // Response zonder data
    if (response?.status) {
      return new ApiError(
        getStatusMessage(response.status),
        getHttpErrorCode(response.status),
        response.status
      );
    }
  }
  
  // Network error (no response)
  if (error && typeof error === 'object' && 'request' in error) {
    return new ApiError(
      'Netwerkfout. Controleer je internetverbinding.',
      'NETWORK_ERROR',
      0
    );
  }
  
  // Generic error
  if (error instanceof Error) {
    return new ApiError(error.message, 'UNKNOWN_ERROR');
  }
  
  return new ApiError('Er is een onbekende fout opgetreden', 'UNKNOWN_ERROR');
}

/**
 * Get user-friendly message for HTTP status code
 */
function getStatusMessage(status: number): string {
  const messages: Record<number, string> = {
    400: 'Ongeldige aanvraag',
    401: 'Niet geautoriseerd - log opnieuw in',
    403: 'Je hebt geen toegang tot deze resource',
    404: 'Resource niet gevonden',
    409: 'Conflict - resource bestaat al',
    422: 'Validatie fout',
    429: 'Te veel aanvragen - probeer later opnieuw',
    500: 'Serverfout - probeer later opnieuw',
    502: 'Gateway fout - service tijdelijk niet bereikbaar',
    503: 'Service niet beschikbaar - probeer later opnieuw',
  };
  
  return messages[status] || `Fout (${status})`;
}

/**
 * Get error code for HTTP status (internal helper)
 */
function getHttpErrorCode(status: number): string {
  const codes: Record<number, string> = {
    400: 'BAD_REQUEST',
    401: 'UNAUTHORIZED',
    403: 'FORBIDDEN',
    404: 'NOT_FOUND',
    409: 'CONFLICT',
    422: 'VALIDATION_ERROR',
    429: 'RATE_LIMITED',
    500: 'SERVER_ERROR',
    502: 'BAD_GATEWAY',
    503: 'SERVICE_UNAVAILABLE',
  };
  
  return codes[status] || 'HTTP_ERROR';
}

/**
 * Handle API error and return user-friendly message
 */
export function handleApiError(error: unknown): string {
  const apiError = parseApiError(error);
  
  // Log for debugging
  if (import.meta.env.DEV) {
    console.error('API Error:', {
      message: apiError.message,
      code: apiError.code,
      status: apiError.status,
      details: apiError.details,
    });
  }
  
  return apiError.message;
}

/**
 * Type guard voor success response
 */
export function isSuccessResponse<T>(
  response: unknown
): response is BackendSuccessResponse<T> {
  return (
    typeof response === 'object' &&
    response !== null &&
    'success' in response &&
    response.success === true &&
    'data' in response
  );
}

/**
 * Type guard voor error response
 */
export function isErrorResponse(
  response: unknown
): response is BackendErrorResponse {
  return (
    typeof response === 'object' &&
    response !== null &&
    'success' in response &&
    response.success === false &&
    'error' in response
  );
}

/**
 * Type guard voor paginated response
 */
export function isPaginatedResponse<T>(
  response: unknown
): response is BackendPaginatedResponse<T> {
  return (
    isSuccessResponse(response) &&
    'pagination' in response &&
    typeof response.pagination === 'object'
  );
}

/**
 * Legacy function: Handle API response
 * Parse backend response en extract data
 */
export async function handleApiResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ error: 'API Error' }));
    throw new ApiError(
      errorData.error || getStatusMessage(response.status),
      errorData.code || getHttpErrorCode(response.status),
      response.status,
      errorData.details
    );
  }

  const data = await response.json();
  
  // Backend success format: { success: true, data: T }
  if (isSuccessResponse<T>(data)) {
    return data.data;
  }
  
  // Fallback to raw data
  return data as T;
}

/**
 * Extended ApiError voor permission errors
 */
export interface PermissionError extends ApiError {
  requiredPermission?: string;
}

/**
 * Legacy function: Check if error is permission error
 */
export function isPermissionError(error: unknown): error is PermissionError {
  if (error instanceof ApiError) {
    const isPerm = error.status === 403 ||
                   error.code === 'FORBIDDEN' ||
                   (error.code?.includes('PERMISSION') ?? false);
    
    // Add requiredPermission if not present (extract from details or message)
    if (isPerm && !(error as PermissionError).requiredPermission) {
      // Try to extract from details
      if (error.details?.required_permission) {
        (error as PermissionError).requiredPermission = String(error.details.required_permission);
      } else if (error.details?.permission) {
        (error as PermissionError).requiredPermission = String(error.details.permission);
      }
    }
    
    return isPerm;
  }
  return false;
}

/**
 * Legacy function: Get error message from error object
 */
export function getErrorMessage(error: unknown): string {
  if (error instanceof ApiError) {
    return error.message;
  }
  if (error instanceof Error) {
    return error.message;
  }
  if (typeof error === 'string') {
    return error;
  }
  return 'Er is een onbekende fout opgetreden';
}

/**
 * Legacy function: Get error code from error object
 */
export function getErrorCode(error: unknown): string {
  if (error instanceof ApiError && error.code) {
    return error.code;
  }
  if (typeof error === 'number') {
    return getHttpErrorCode(error);
  }
  return 'UNKNOWN_ERROR';
}
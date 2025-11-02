/**
 * DKL API Client
 * Centralized API communication met JWT authenticatie
 */

import axios, { AxiosInstance, AxiosError, InternalAxiosRequestConfig, AxiosResponse } from 'axios';
import { apiConfig } from '../config/api.config';

// =============================================================================
// TYPES
// =============================================================================

interface UpdateData {
  [key: string]: unknown;
}

interface CreateData {
  [key: string]: unknown;
}

// =============================================================================
// API CLIENT SETUP
// =============================================================================

export const apiClient: AxiosInstance = axios.create({
  baseURL: `${apiConfig.baseURL}/api`,
  timeout: apiConfig.timeout,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request Interceptor - Voeg JWT token toe aan alle requests
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem('auth_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error: unknown) => Promise.reject(error)
);

// Response Interceptor - Handle errors (401 unauthorized vs 403 forbidden)
apiClient.interceptors.response.use(
  (response: AxiosResponse) => response,
  (error: AxiosError) => {
    // 401 UNAUTHORIZED - Token invalid/expired, force logout
    if (error.response?.status === 401) {
      localStorage.removeItem('auth_token');
      localStorage.removeItem('refresh_token');
      
      // Redirect to login
      if (typeof window !== 'undefined') {
        window.location.href = '/login';
      }
    }
    
    // 403 FORBIDDEN - No permission, but token is valid, DON'T logout
    // Just pass the error through to be handled by the component
    // Components should show error message but NOT logout user
    
    return Promise.reject(error);
  }
);

// =============================================================================
// API METHODS
// =============================================================================

export const api = {
  // -------------------------
  // AUTHENTICATION
  // -------------------------
  auth: {
    login: async (email: string, password: string) => {
      const response = await apiClient.post('/auth/login', { email, password });
      
      // Sla tokens op
      if (response.data.token) {
        localStorage.setItem('auth_token', response.data.token);
      }
      if (response.data.refresh_token) {
        localStorage.setItem('refresh_token', response.data.refresh_token);
      }
      
      return response.data;
    },
    
    logout: async () => {
      try {
        await apiClient.post('/auth/logout');
      } finally {
        localStorage.removeItem('auth_token');
        localStorage.removeItem('refresh_token');
      }
    },
    
    getProfile: async () => {
      const response = await apiClient.get('/auth/profile');
      return response.data;
    },
    
    resetPassword: async (currentPassword: string, newPassword: string) => {
      const response = await apiClient.post('/auth/reset-password', {
        huidig_wachtwoord: currentPassword,
        nieuw_wachtwoord: newPassword,
      });
      return response.data;
    },
    
    refreshToken: async () => {
      const refreshToken = localStorage.getItem('refresh_token');
      const response = await apiClient.post('/auth/refresh', {
        refresh_token: refreshToken,
      });
      
      if (response.data.token) {
        localStorage.setItem('auth_token', response.data.token);
      }
      
      return response.data;
    },
  },

  // -------------------------
  // CONTACT FORMULIEREN
  // -------------------------
  contacts: {
    list: async (limit = 50, offset = 0) => {
      const response = await apiClient.get(`/contact?limit=${limit}&offset=${offset}`);
      return response.data;
    },
    
    getById: async (id: string) => {
      const response = await apiClient.get(`/contact/${id}`);
      return response.data;
    },
    
    filterByStatus: async (status: string) => {
      const response = await apiClient.get(`/contact/status/${status}`);
      return response.data;
    },
    
    update: async (id: string, data: UpdateData) => {
      const response = await apiClient.put(`/contact/${id}`, data);
      return response.data;
    },
    
    delete: async (id: string) => {
      const response = await apiClient.delete(`/contact/${id}`);
      return response.data;
    },
    
    addReply: async (id: string, message: string) => {
      const response = await apiClient.post(`/contact/${id}/antwoord`, {
        bericht: message,
      });
      return response.data;
    },
  },

  // -------------------------
  // AANMELDINGEN
  // -------------------------
  registrations: {
    list: async (limit = 50, offset = 0) => {
      const response = await apiClient.get(`/aanmelding?limit=${limit}&offset=${offset}`);
      return response.data;
    },
    
    getById: async (id: string) => {
      const response = await apiClient.get(`/aanmelding/${id}`);
      return response.data;
    },
    
    filterByRole: async (role: string) => {
      const response = await apiClient.get(`/aanmelding/rol/${role}`);
      return response.data;
    },
    
    update: async (id: string, data: UpdateData) => {
      const response = await apiClient.put(`/aanmelding/${id}`, data);
      return response.data;
    },
    
    delete: async (id: string) => {
      const response = await apiClient.delete(`/aanmelding/${id}`);
      return response.data;
    },
    
    addReply: async (id: string, message: string) => {
      const response = await apiClient.post(`/aanmelding/${id}/antwoord`, {
        bericht: message,
      });
      return response.data;
    },
  },

  // -------------------------
  // ALBUMS
  // -------------------------
  albums: {
    // Public endpoint
    listPublic: async () => {
      const response = await apiClient.get('/albums');
      return response.data;
    },
    
    // Admin endpoints
    listAll: async (limit = 50, offset = 0) => {
      const response = await apiClient.get(`/albums/admin?limit=${limit}&offset=${offset}`);
      return response.data;
    },
    
    getById: async (id: string) => {
      const response = await apiClient.get(`/albums/${id}`);
      return response.data;
    },
    
    getPhotos: async (id: string) => {
      const response = await apiClient.get(`/albums/${id}/photos`);
      return response.data;
    },
    
    create: async (data: CreateData) => {
      const response = await apiClient.post('/albums', data);
      return response.data;
    },
    
    update: async (id: string, data: UpdateData) => {
      const response = await apiClient.put(`/albums/${id}`, data);
      return response.data;
    },
    
    delete: async (id: string) => {
      const response = await apiClient.delete(`/albums/${id}`);
      return response.data;
    },
  },

  // -------------------------
  // PHOTOS
  // -------------------------
  photos: {
    listPublic: async (filters?: { year?: number; title?: string }) => {
      let url = '/photos';
      if (filters) {
        const params = new URLSearchParams();
        if (filters.year) params.append('year', filters.year.toString());
        if (filters.title) params.append('title', filters.title);
        url += '?' + params.toString();
      }
      const response = await apiClient.get(url);
      return response.data;
    },
    
    listAll: async (limit = 50, offset = 0) => {
      const response = await apiClient.get(`/photos/admin?limit=${limit}&offset=${offset}`);
      return response.data;
    },
    
    create: async (data: CreateData) => {
      const response = await apiClient.post('/photos', data);
      return response.data;
    },
    
    update: async (id: string, data: UpdateData) => {
      const response = await apiClient.put(`/photos/${id}`, data);
      return response.data;
    },
    
    delete: async (id: string) => {
      const response = await apiClient.delete(`/photos/${id}`);
      return response.data;
    },
  },

  // -------------------------
  // VIDEOS
  // -------------------------
  videos: {
    listPublic: async () => {
      const response = await apiClient.get('/videos');
      return response.data;
    },
    
    listAll: async (limit = 50, offset = 0) => {
      const response = await apiClient.get(`/videos/admin?limit=${limit}&offset=${offset}`);
      return response.data;
    },
    
    create: async (data: CreateData) => {
      const response = await apiClient.post('/videos', data);
      return response.data;
    },
    
    update: async (id: string, data: UpdateData) => {
      const response = await apiClient.put(`/videos/${id}`, data);
      return response.data;
    },
    
    delete: async (id: string) => {
      const response = await apiClient.delete(`/videos/${id}`);
      return response.data;
    },
  },

  // -------------------------
  // SPONSORS
  // -------------------------
  sponsors: {
    listPublic: async () => {
      const response = await apiClient.get('/sponsors');
      return response.data;
    },
    
    listAll: async (limit = 50, offset = 0) => {
      const response = await apiClient.get(`/sponsors/admin?limit=${limit}&offset=${offset}`);
      return response.data;
    },
    
    create: async (data: CreateData) => {
      const response = await apiClient.post('/sponsors', data);
      return response.data;
    },
    
    update: async (id: string, data: UpdateData) => {
      const response = await apiClient.put(`/sponsors/${id}`, data);
      return response.data;
    },
    
    delete: async (id: string) => {
      const response = await apiClient.delete(`/sponsors/${id}`);
      return response.data;
    },
  },

  // -------------------------
  // STEPS TRACKING
  // -------------------------
  steps: {
    updateSteps: async (participantId: string, steps: number) => {
      const response = await apiClient.post(`/steps/${participantId}`, { steps });
      return response.data;
    },
    
    getParticipantDashboard: async (participantId: string) => {
      const response = await apiClient.get(`/participant/${participantId}/dashboard`);
      return response.data;
    },
    
    getTotalSteps: async () => {
      const response = await apiClient.get('/total-steps');
      return response.data;
    },
    
    getFundsDistribution: async () => {
      const response = await apiClient.get('/funds-distribution');
      return response.data;
    },
  },

  // -------------------------
  // USERS (Gebruikersbeheer)
  // -------------------------
  users: {
    list: async (limit = 50, offset = 0) => {
      const response = await apiClient.get(`/users?limit=${limit}&offset=${offset}`);
      return response.data;
    },
    
    getById: async (id: string) => {
      const response = await apiClient.get(`/users/${id}`);
      return response.data;
    },
    
    update: async (id: string, data: UpdateData) => {
      const response = await apiClient.put(`/users/${id}`, data);
      return response.data;
    },
    
    delete: async (id: string) => {
      const response = await apiClient.delete(`/users/${id}`);
      return response.data;
    },
    
    assignRole: async (userId: string, roleId: string) => {
      const response = await apiClient.post(`/users/${userId}/roles`, { role_id: roleId });
      return response.data;
    },
    
    removeRole: async (userId: string, roleId: string) => {
      const response = await apiClient.delete(`/users/${userId}/roles/${roleId}`);
      return response.data;
    },
  },

  // -------------------------
  // NEWSLETTER
  // -------------------------
  newsletter: {
    list: async (limit = 50, offset = 0) => {
      const response = await apiClient.get(`/newsletter?limit=${limit}&offset=${offset}`);
      return response.data;
    },
    
    getById: async (id: string) => {
      const response = await apiClient.get(`/newsletter/${id}`);
      return response.data;
    },
    
    create: async (data: CreateData) => {
      const response = await apiClient.post('/newsletter', data);
      return response.data;
    },
    
    update: async (id: string, data: UpdateData) => {
      const response = await apiClient.put(`/newsletter/${id}`, data);
      return response.data;
    },
    
    delete: async (id: string) => {
      const response = await apiClient.delete(`/newsletter/${id}`);
      return response.data;
    },
    
    send: async (id: string) => {
      const response = await apiClient.post(`/newsletter/${id}/send`);
      return response.data;
    },
  },

  // -------------------------
  // HEALTH & MONITORING
  // -------------------------
  health: async () => {
    const response = await apiClient.get('/health');
    return response.data;
  },
};

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

/**
 * Check of user is ingelogd
 */
export const isAuthenticated = (): boolean => {
  return !!localStorage.getItem('auth_token');
};

/**
 * Get current auth token
 */
export const getAuthToken = (): string | null => {
  return localStorage.getItem('auth_token');
};

/**
 * Clear authentication
 */
export const clearAuth = (): void => {
  localStorage.removeItem('auth_token');
  localStorage.removeItem('refresh_token');
};

/**
 * Handle API errors met vriendelijke berichten
 */
export const handleAPIError = (error: unknown): string => {
  // Type guard to check if error is an AxiosError
  if (axios.isAxiosError(error)) {
    // Now TypeScript knows error is AxiosError
    const axiosError = error as AxiosError<{ error?: string }>;
    
    if (axiosError.response) {
      // Server responded with error status
      const responseData = axiosError.response.data;
      switch (axiosError.response.status) {
        case 400:
          return responseData?.error || 'Ongeldige invoer';
        case 401:
          return 'Niet geautoriseerd - log opnieuw in';
        case 403:
          return 'Geen toegang tot deze resource';
        case 404:
          return 'Niet gevonden';
        case 429:
          return 'Te veel verzoeken - probeer later opnieuw';
        case 500:
          return 'Server error - probeer later opnieuw';
        default:
          return responseData?.error || 'Er is iets misgegaan';
      }
    } else if (axiosError.request) {
      // Request made but no response received
      return 'Geen verbinding met server - check of backend draait';
    }
  }
  
  if (error instanceof Error) {
    return error.message;
  }
  
  return 'Onbekende fout';
};

/**
 * Check of API beschikbaar is
 */
export const checkAPIAvailability = async (): Promise<boolean> => {
  try {
    await api.health();
    return true;
  } catch {
    return false;
  }
};

export default api;
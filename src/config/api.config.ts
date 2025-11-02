/**
 * API Configuration
 * Automatisch switchen tussen lokale en productie backend
 */

interface APIConfig {
  baseURL: string;
  wsURL: string;
  emailURL: string;
  emailApiKey: string;
  supabaseURL: string;
  timeout: number;
  environment: 'development' | 'production';
}

/**
 * Haal API Base URL uit environment variabelen
 */
const getAPIBaseURL = (): string => {
  // Vite environment variabelen
  if (import.meta.env.VITE_API_BASE_URL) {
    return import.meta.env.VITE_API_BASE_URL;
  }
  
  // Fallback naar productie als geen env var beschikbaar
  return 'https://dklemailservice.onrender.com/api';
};

/**
 * Haal WebSocket URL uit environment variabelen
 */
const getWSURL = (): string => {
  if (import.meta.env.VITE_WS_URL) {
    return import.meta.env.VITE_WS_URL;
  }
  
  // Fallback naar productie WebSocket
  return 'wss://dklemailservice.onrender.com/api/chat/ws';
};

/**
 * Haal Email API URL uit environment variabelen
 */
const getEmailURL = (): string => {
  if (import.meta.env.VITE_EMAIL_API_URL) {
    return import.meta.env.VITE_EMAIL_API_URL;
  }
  
  return 'https://dklemailservice.onrender.com';
};

/**
 * Haal Email API Key uit environment variabelen
 */
const getEmailApiKey = (): string => {
  return import.meta.env.VITE_EMAIL_API_KEY || '';
};

/**
 * Haal Supabase API URL uit environment variabelen
 */
const getSupabaseURL = (): string => {
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL;
  }
  
  // Fallback naar standaard Supabase URL
  return '';
};

/**
 * Bepaal huidige environment
 */
const getEnvironment = (): 'development' | 'production' => {
  if (import.meta.env.VITE_ENV) {
    return import.meta.env.VITE_ENV as 'development' | 'production';
  }
  
  // Fallback: check of development mode actief is
  if (import.meta.env.DEV) {
    return 'development';
  }
  
  return 'production';
};

/**
 * API Configuratie object
 */
export const apiConfig: APIConfig = {
  baseURL: getAPIBaseURL(),
  wsURL: getWSURL(),
  emailURL: getEmailURL(),
  emailApiKey: getEmailApiKey(),
  supabaseURL: getSupabaseURL(),
  timeout: parseInt(import.meta.env.VITE_API_TIMEOUT || '30000'),
  environment: getEnvironment(),
};

/**
 * Helper functies
 */
export const isDevelopment = () => apiConfig.environment === 'development';
export const isProduction = () => apiConfig.environment === 'production';

/**
 * Log configuratie in development mode
 */
if (isDevelopment()) {
  console.group('🔧 API Configuration (Development)');
  console.log('Base URL:', apiConfig.baseURL);
  console.log('WebSocket URL:', apiConfig.wsURL);
  console.log('Email URL:', apiConfig.emailURL);
  console.log('Email API Key:', apiConfig.emailApiKey ? '***' + apiConfig.emailApiKey.slice(-4) : 'Not set');
  console.log('Supabase URL:', apiConfig.supabaseURL);
  console.log('Timeout:', apiConfig.timeout + 'ms');
  console.log('Environment:', apiConfig.environment);
  console.groupEnd();
}

/**
 * Cloudinary configuratie
 */
export const cloudinaryConfig = {
  apiKey: import.meta.env.VITE_CLOUDINARY_API_KEY || '',
  cloudName: import.meta.env.VITE_CLOUDINARY_CLOUD_NAME || '',
  uploadPreset: import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET || '',
};

/**
 * App configuratie
 */
export const appConfig = {
  appURL: import.meta.env.VITE_APP_URL || 'http://localhost:5173',
  debug: import.meta.env.VITE_DEBUG === 'true',
};

/**
 * Email configuratie
 */
export const emailConfig = {
  defaultFromAddress: 'info@dekoninklijkeloop.nl',
  defaultFromName: 'DKL25 Team',
};

export default apiConfig;
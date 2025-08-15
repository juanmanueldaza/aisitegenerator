// Application configuration constants
export const APP_CONFIG = {
  APP_NAME: 'AI Site Generator',
  VERSION: process.env.REACT_APP_VERSION || '1.0.0',
  GITHUB_CLIENT_ID: process.env.REACT_APP_GITHUB_CLIENT_ID || '',
  MAX_UPLOAD_SIZE: 5 * 1024 * 1024, // 5MB
  SUPPORTED_FILE_TYPES: ['image/jpeg', 'image/png', 'image/svg+xml'],
} as const;

// API configuration
export const API_CONFIG = {
  BASE_URL: process.env.REACT_APP_API_URL || 'http://localhost:3001',
  TIMEOUT: 5000,
  RETRY_ATTEMPTS: 3,
} as const;
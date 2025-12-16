// API Configuration
export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export const API_ENDPOINTS = {
  // Auth endpoints
  LOGIN: '/api/auth/login',
  REGISTER: '/api/auth/register',
  ME: '/api/auth/me',

  // File endpoints
  FILE_UPLOAD: '/api/files/upload',
  FILE_DOWNLOAD: '/api/files/download',
  FILE_LIST: '/api/files',
  FILE_DELETE: '/api/files',
  FILE_INFO: '/api/files',
} as const;

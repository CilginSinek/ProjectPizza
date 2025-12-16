// Alternative API Service using Axios (as per DevOps requirements)
import axios from 'axios';
import type { AxiosRequestConfig } from 'axios';
import { API_BASE_URL } from '../config/api';
import { getAuthHeader, removeToken } from '../utils/auth';

// Backend response format: { status: "success" | "error", data?: any, message?: string }
export interface ApiResponse<T = any> {
  status: 'success' | 'error';
  data?: T;
  message?: string;
}

// Create axios instance
const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
axiosInstance.interceptors.request.use(
  (config) => {
    const authHeaders = getAuthHeader();
    if (authHeaders.Authorization) {
      config.headers.Authorization = authHeaders.Authorization;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
axiosInstance.interceptors.response.use(
  (response) => {
    return response.data;
  },
  (error) => {
    console.error('API request failed:', error);

    // Handle 401 Unauthorized
    if (error.response && error.response.status === 401) {
      removeToken();
      window.location.href = '/login';
    }

    // Return consistent error structure
    return {
      status: 'error',
      message: error.response?.data?.message || 'Network error. Please try again.',
    };
  }
);

class ApiServiceAxios {
  async get<T>(endpoint: string, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    return axiosInstance.get(endpoint, config);
  }

  async post<T>(endpoint: string, data?: any, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    return axiosInstance.post(endpoint, data, config);
  }

  async put<T>(endpoint: string, data?: any, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    return axiosInstance.put(endpoint, data, config);
  }

  async delete<T>(endpoint: string, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    return axiosInstance.delete(endpoint, config);
  }

  async uploadFile<T>(endpoint: string, formData: FormData): Promise<ApiResponse<T>> {
    return axiosInstance.post(endpoint, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  }
}

export const apiServiceAxios = new ApiServiceAxios();
export { axiosInstance };
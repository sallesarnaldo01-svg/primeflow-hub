import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

export const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
apiClient.interceptors.request.use(
  (config) => {
    const authData = localStorage.getItem('primezap-auth');
    if (authData) {
      try {
        const { state } = JSON.parse(authData);
        if (state?.token) {
          config.headers.Authorization = `Bearer ${state.token}`;
        }
      } catch (error) {
        console.error('Error parsing auth data:', error);
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Handle unauthorized
      localStorage.removeItem('primezap-auth');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Mock flag for development
const ENABLE_DEV_MOCK = import.meta.env.VITE_ENABLE_DEV_MOCK === 'true';

export const mockApiCall = <T>(data: T, delay = 500): Promise<T> => {
  if (!ENABLE_DEV_MOCK) {
    throw new Error('Mock is disabled');
  }
  return new Promise((resolve) => {
    setTimeout(() => resolve(data), delay);
  });
};

import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  headers: { 'Content-Type': 'application/json' },
  timeout: 30000,
});

// Request interceptor: attach auth token and normalize FormData headers
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('legalAidToken');
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  // Remove hardcoded Content-Type if uploading FormData so browser generates proper boundary
  if (config.data instanceof FormData && config.headers) {
    delete config.headers['Content-Type'];
  }

  return config;
}, (error) => {
  return Promise.reject(error);
});

// Response interceptor: translate cryptic network errors into actionable explanations
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.code === 'ERR_NETWORK' || error.message === 'Network Error') {
      error.message = 'Unable to reach the backend service. Please verify the API URL and ensure the backend is running and reachable.';
    } else if (error.response) {
      const { status, data } = error.response;
      const backendMsg = data?.message || data?.error || data?.msg;

      if (status === 401) {
        error.message = backendMsg || 'Session expired or invalid credentials. Please log in again.';
        if (typeof window !== 'undefined' && !window.location.pathname.includes('/login')) {
          localStorage.removeItem('legalAidToken');
          localStorage.removeItem('legalAidUser');
        }
      } else if (status === 400) {
        error.message = backendMsg || 'Validation error: Please verify that all required case details are filled.';
      } else if (status === 403) {
        error.message = backendMsg || 'Access denied: You do not have permission to perform this judicial action.';
      } else if (status === 404) {
        error.message = backendMsg || 'The requested case or endpoint was not found.';
      } else if (status === 409) {
        error.message = backendMsg || 'Conflict: Duplicate record or legal representation conflict detected.';
      } else if (status >= 500) {
        error.message = backendMsg || 'Internal server error. Please try again shortly.';
      }
    }
    return Promise.reject(error);
  }
);

export default api;

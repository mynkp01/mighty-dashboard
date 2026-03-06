import axios from 'axios';
import Cookies from 'js-cookie';
import { setIsLoading } from '../redux/slices/loadingSlice';
import { logout } from '../redux/slices/userSlice';
import { store } from '../redux/store';
import { ROUTES } from '../utils/Constant';

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_APP_API_URL || 'http://localhost:3000/api/v1',
});

apiClient.interceptors.request.use(
  (config) => {
    const token = Cookies.get('token') || '';

    // Don't set token or redirect on sign-in page
    if (window && window.location.pathname === '/sign-in') {
      return config;
    }

    // If no token, cancel request and redirect
    if (!token && !ROUTES.publicPaths.includes(window?.location?.pathname)) {
      window.location.href = '/sign-in';
      return Promise.reject({ message: 'No token found. Redirecting...' });
    }

    config.headers.Authorization = `Bearer ${token}`;
    return config;
  },
  (error) => {
    return Promise.reject({
      error,
      message: error?.response?.data?.message || 'Request error message',
    });
  },
);

// Response Interceptor
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error?.response?.status;

    if (status === 401) {
      new Promise(() => {
        store.dispatch(logout());
        store.dispatch(setIsLoading(false));
        Cookies.remove('token');
      });
      window.location.href = '/sign-in';
    }

    return Promise.reject({
      error,
      message: error?.response?.data?.message || 'Response error message',
    });
  },
);

export default apiClient;

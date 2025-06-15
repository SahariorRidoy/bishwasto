import axios from 'axios';
import Cookies from 'js-cookie';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  timeout: 10000,
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    const token = Cookies.get('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Handle token refresh
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = Cookies.get('refreshToken');
        if (!refreshToken) {
          throw new Error('No refresh token available');
        }

        const response = await axios.post(
          `${process.env.NEXT_PUBLIC_API_URL}auth/refresh/`,
          { refresh: refreshToken }
        );

        const { access } = response.data;
        Cookies.set('accessToken', access, {
          expires: 1,
          secure: true,
          sameSite: 'Strict',
          path: '/',
        });

        originalRequest.headers.Authorization = `Bearer ${access}`;
        return api(originalRequest);
      } catch (refreshError) {
        // Clear auth data and redirect to login
        Cookies.remove('accessToken');
        Cookies.remove('refreshToken');
        window.location.href = '/authentication';
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

// API methods
export const authAPI = {
  login: (credentials) => api.post('auth/login/', credentials),
  register: (data) => api.post('auth/register/', data),
  verifyOTP: (data) => api.post('auth/verify-otp/', data),
  logout: () => api.get('auth/logout/'),
};

export const profileAPI = {
  getProfile: () => api.get('profile/'),
  updateProfile: (data) => api.put('profile/', data),
};

export const shopAPI = {
  getShops: () => api.get('shop/all'),
  getShopDetails: (id) => api.get(`shop/${id}/`),
  createShop: (data) => api.post('shop/create/', data),
};

export const employeeAPI = {
  getEmployees: (shopId) => api.get(`employee/${shopId}/employees/`),
  createEmployee: (data) => api.post('employee/create/', data),
  updateEmployee: (id, data) => api.put(`employee/${id}/`, data),
  deleteEmployee: (id) => api.delete(`employee/${id}/`),
};

export default api; 
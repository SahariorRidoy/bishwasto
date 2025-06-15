import { createSlice } from '@reduxjs/toolkit';
import Cookies from 'js-cookie';

// Helper to get user info from localStorage or cookie
const getUserInfoFromStorage = () => {
  // Check if we're in a browser environment
  const isBrowser = typeof window !== 'undefined';
  
  // Try to get from localStorage first (only in browser)
  if (isBrowser) {
    try {
      const storedUserInfo = localStorage.getItem('userInfo');
      if (storedUserInfo) {
        return JSON.parse(storedUserInfo);
      }
    } catch (error) {
      console.error('Failed to parse user info from localStorage:', error);
    }
  }
  
  // Fallback to cookies (works in both environments)
  const userInfoCookie = Cookies.get('userInfo');
  if (userInfoCookie) {
    try {
      return JSON.parse(userInfoCookie);
    } catch (error) {
      console.error('Failed to parse user info from cookie:', error);
    }
  }
  
  return null;
};

// Initial state checks for token existence and user info on load
const initialState = {
  isAuthenticated: !!Cookies.get('accessToken'),
  userInfo: getUserInfoFromStorage(),
  loading: false,
  error: null
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setAuthenticated: (state, action) => {
      state.isAuthenticated = true;
      
      // Store user info if provided
      if (action.payload) {
        state.userInfo = action.payload;
        
        // Persist user info in localStorage and cookies
        try {
          // Only use localStorage in browser environment
          if (typeof window !== 'undefined') {
            localStorage.setItem('userInfo', JSON.stringify(action.payload));
          }
          Cookies.set('userInfo', JSON.stringify(action.payload), { expires: 7 });
        } catch (error) {
          console.error('Failed to persist user info:', error);
        }
      }
    },
    setUserInfo: (state, action) => {
      state.userInfo = action.payload;
      
      // Update persisted user info
      try {
        // Only use localStorage in browser environment
        if (typeof window !== 'undefined') {
          localStorage.setItem('userInfo', JSON.stringify(action.payload));
        }
        Cookies.set('userInfo', JSON.stringify(action.payload), { expires: 7 });
      } catch (error) {
        console.error('Failed to persist updated user info:', error);
      }
    },
    setUnauthenticated: (state) => {
      state.isAuthenticated = false;
      state.userInfo = null;
      
      // Remove all auth-related data
      Cookies.remove('accessToken');
      Cookies.remove('refreshToken');
      Cookies.remove('userInfo');
      
      // Only use localStorage in browser environment
      if (typeof window !== 'undefined') {
        try {
          localStorage.removeItem('userInfo');
        } catch (error) {
          console.error('Failed to remove user info from localStorage:', error);
        }
      }
    },
    setLoading: (state, action) => {
      state.loading = action.payload;
    },
    setError: (state, action) => {
      state.error = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    }
  }
});

// Export actions
export const {
  setAuthenticated,
  setUserInfo,
  setUnauthenticated,
  setLoading,
  setError,
  clearError
} = authSlice.actions;

// Helper thunk to handle logout
export const logoutUser = () => (dispatch) => {
  dispatch(setUnauthenticated());
  // Additional cleanup if needed
};

// Helper to check if user is a shop owner
export const isShopOwner = (state) => 
  state.auth.isAuthenticated && state.auth.userInfo?.is_shopOwner;

// Helper to check if user is an employee
export const isEmployee = (state) => 
  state.auth.isAuthenticated && state.auth.userInfo?.is_employee;

export default authSlice.reducer;
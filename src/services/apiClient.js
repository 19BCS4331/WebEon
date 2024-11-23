// apiClient.js
import axios from "axios";

const baseUrl = process.env.REACT_APP_BASE_URL;

let csrfToken = null;
let isGettingToken = false;
let tokenPromise = null;

// Function to get CSRF token
const getCsrfToken = async () => {
  try {
    // If already getting token, return existing promise
    if (isGettingToken) {
      return tokenPromise;
    }

    // Set flag and create new promise
    isGettingToken = true;
    tokenPromise = axios.get(`${baseUrl}/api/csrf-token`, { 
      withCredentials: true 
    });

    const response = await tokenPromise;
    csrfToken = response.data.csrfToken;
    return response;
  } catch (error) {
    console.error('Failed to fetch CSRF token:', error);
    throw error;
  } finally {
    isGettingToken = false;
    tokenPromise = null;
  }
};

export const apiClient = axios.create({
  baseURL: baseUrl,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor
apiClient.interceptors.request.use(
  async (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // Skip CSRF for authentication routes
    const authRoutes = [
      '/auth/login',
      '/auth/register',
      '/auth/login/branchOnUser',
      '/auth/login/CounterOnBranchAndUser',
      '/auth/login/finYear'
    ];

    const isAuthRoute = authRoutes.some(route => config.url.includes(route));

    if (!isAuthRoute && ['POST', 'PUT', 'DELETE', 'PATCH'].includes(config.method.toUpperCase())) {
      try {
        if (!csrfToken) {
          await getCsrfToken();
        }
        config.headers['X-CSRF-Token'] = csrfToken;
      } catch (error) {
        console.error('Error getting CSRF token:', error);
      }
    }

    return config;
  },
  (error) => Promise.reject(error)
);

let logoutCallback = null;
let NoTokenCallBack = null;
let UserNotFoundCallback = null;
let tokenExpiredCallback = null;
let InvalidTokenCallback = null;
let DefaultCaseCallback = null;

export const setLogoutCallback = (callback) => {
  logoutCallback = callback;
};

export const setNoTokenCallback = (callback) => {
  NoTokenCallBack = callback;
};

export const setUserNotFoundCallback = (callback) => {
  UserNotFoundCallback = callback;
};

export const setTokenExpiredCallback = (callback) => {
  tokenExpiredCallback = callback;
};

export const setInvalidTokenCallback = (callback) => {
  InvalidTokenCallback = callback;
};

export const setDefaultCaseCallback = (callback) => {
  DefaultCaseCallback = callback;
};

// Response interceptor to handle CSRF token expiration
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 403 && error.response?.data?.errorCode === 'CSRF_ERROR') {
      // Token might be expired, get a new one
      csrfToken = null;
      try {
        await getCsrfToken();
        // Retry the original request
        const config = error.config;
        config.headers['X-CSRF-Token'] = csrfToken;
        return apiClient(config);
      } catch (retryError) {
        return Promise.reject(retryError);
      }
    } else if (error.response) {
      const errorCode = error.response.data.errorCode;
      
      // Handle authentication-related errors
      if (errorCode) {
        switch (errorCode) {
          case "NO_TOKEN":
            if (NoTokenCallBack) NoTokenCallBack();
            break;
          case "USER_NOT_FOUND":
            if (UserNotFoundCallback) UserNotFoundCallback();
            break;
          case "TOKEN_MISMATCH":
            if (logoutCallback) logoutCallback();
            break;
          case "TOKEN_EXPIRED":
            if (tokenExpiredCallback) tokenExpiredCallback();
            break;
          case "INVALID_TOKEN":
            if (InvalidTokenCallback) InvalidTokenCallback();
            break;
            default:
            if (DefaultCaseCallback) DefaultCaseCallback();
        }
      }
      // Don't trigger logout for non-authentication errors
    }
    return Promise.reject(error);
  }
);

// Initialize by getting the first token
getCsrfToken().catch(console.error);

// apiClient.js
import axios from "axios";

const baseUrl = process.env.REACT_APP_BASE_URL;

export const apiClient = axios.create({
  baseURL: baseUrl,
  headers: {
    "Content-Type": "application/json",
  },
});

// Add a request interceptor to include the token
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
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

// Add a response interceptor to handle errors
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    // if (error.response && error.response.status === 401) {
    //   console.error("Unauthorized request NEW");
    //   if (logoutCallback) logoutCallback(); // Call logout if it's set
    // }
    if (error.response) {
      const errorCode = error.response.data.errorCode;
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
          if (InvalidTokenCallback) InvalidTokenCallback();
      }
    }
    return Promise.reject(error);
  }
);

import axios from "axios";
import { Endpoint } from "./Endpoint";

const TOKEN_KEY = "gym_token";
const USER_KEY = "gym_user";

export const getToken = () => {
  try {
    return localStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
};

export const saveAuth = (token, user) => {
  try {
    localStorage.setItem(TOKEN_KEY, token);
    localStorage.setItem(USER_KEY, JSON.stringify(user ?? null));
  } catch {
    /* storage blocked */
  }
};


export const clearAuth = () => {
  try {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  } catch {
    /* storage blocked */
  }
};

export const getUser = () => {
  try {
    return JSON.parse(localStorage.getItem(USER_KEY));
  } catch {
    return null;
  }
};

// true when a token exists and has not expired yet
export const isLoggedIn = () => {
  const token = getToken();
  if (!token) return false;
  try {
    const base64 = token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/");
    const { exp } = JSON.parse(atob(base64));
    return typeof exp === "number" && exp * 1000 > Date.now();
  } catch {
    return false;
  }
};

// nice message from an axios error
export const getErrorMessage = (err, fallback = "Something went wrong.") =>
  err?.response?.data?.message ||
  (err?.request ? "Cannot reach the server. Is it running?" : fallback);

// Every axios call in the project automatically sends the JWT --------------
axios.interceptors.request.use((config) => {
  const token = getToken();
  if (token && typeof config.url === "string" && config.url.startsWith(Endpoint)) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// If the server says the token is missing/expired -> back to the login page
axios.interceptors.response.use(
  (response) => response,
  (error) => {
    const url = error?.config?.url || "";
    if (error?.response?.status === 401 && !url.includes("/auth/")) {
      clearAuth();
      if (window.location.pathname.toLowerCase() !== "/loginpage") {
        window.location.assign("/loginpage");
      }
    }
    return Promise.reject(error);
  }
);

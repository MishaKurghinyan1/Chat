import React, { createContext, useEffect, useState, useRef } from "react";

const parseJwt = (token) => {
  try {
    return JSON.parse(atob(token.split(".")[1]));
  } catch {
    return null;
  }
};

export const ApiContext = createContext(null);

const BASE_URL = import.meta.env.VITE_API_URL || "";

export const ApiProvider = ({ children }) => {
  const [token, setToken] = useState(localStorage.getItem("token"));
  const refreshTimeout = useRef(null);

  const clearScheduledRefresh = () => {
    if (refreshTimeout.current) {
      clearTimeout(refreshTimeout.current);
      refreshTimeout.current = null;
    }
  };

  const login = (accessToken) => {
    localStorage.setItem("token", accessToken);
    setToken(accessToken);
    scheduleRefresh(accessToken);
  };

  const logout = () => {
    clearScheduledRefresh();
    localStorage.removeItem("token");
    setToken(null);
    window.location.href = "/login";
  };

  const scheduleRefresh = (accessToken) => {
    clearScheduledRefresh();
    const payload = parseJwt(accessToken);
    if (!payload?.exp) return;

    const expiresInMs = payload.exp * 1000 - Date.now() - 30_000;
    if (expiresInMs <= 0) return;

    refreshTimeout.current = setTimeout(async () => {
      const newToken = await refreshToken();
      if (newToken) scheduleRefresh(newToken);
    }, expiresInMs);
  };

  const refreshToken = async () => {
    try {
      const res = await fetch(`${BASE_URL}/api/auth/refresh`, {
        method: "POST",
        credentials: "include",
      });

      if (!res.ok) return null;

      const data = await res.json().catch(() => null);
      if (!data?.accessToken) return null;

      login(data.accessToken);
      return data.accessToken;
    } catch (err) {
      console.error("Refresh token error:", err);
      return null;
    }
  };

  useEffect(() => {
    if (token) scheduleRefresh(token);
    return clearScheduledRefresh;
  }, [token]);

  const apiFetch = async (endpoint, options = {}) => {
    const url = endpoint.startsWith("http") ? endpoint : `${BASE_URL}${endpoint}`;

    const headers = {
      ...options.headers,
    };

    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    let res = await fetch(url, {
      ...options,
      headers,
      credentials: "include",
    });

    if (res.status === 401 && token) {
      const newToken = await refreshToken();
      if (!newToken) {
        logout();
        throw new Error("Session expired. Please log in again.");
      }

      headers["Authorization"] = `Bearer ${newToken}`;
      res = await fetch(url, { ...options, headers, credentials: "include" });
    }

    if (res.status === 204) return null;

    const text = await res.text();
    let data = null;
    try {
      data = text ? JSON.parse(text) : null;
    } catch {
      data = text;
    }

    if (!res.ok) {
      const message = data?.message || data?.error || `HTTP ${res.status} Error`;
      const error = new Error(Array.isArray(message) ? message.join(", ") : message);
      error.status = res.status;
      error.details = data?.message;
      throw error;
    }

    return data;
  };

  return (
    <ApiContext.Provider value={{ apiFetch, login, logout, token }}>
      {children}
    </ApiContext.Provider>
  );
};
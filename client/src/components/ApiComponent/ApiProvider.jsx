import React, { createContext, useEffect, useState, useRef } from "react";

const parseJwt = (token) => {
  try {
    return JSON.parse(atob(token.split(".")[1]));
  } catch {
    return null;
  }
};

export const ApiContext = createContext();

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

  const refreshToken = async () => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/auth/refresh`, {
        method: "POST",
        credentials: "include",
      });
      if (!res.ok) throw new Error("Unauthorized");

      const data = await res.json().catch(() => {
        throw new Error("Invalid JSON");
      });
      if (!data?.accessToken) throw new Error("No access token");

      login(data.accessToken);
      return data.accessToken;
    } catch {
      logout();
      return null;
    }
  };

  const scheduleRefresh = (accessToken) => {
    clearScheduledRefresh();
    const payload = parseJwt(accessToken);
    if (!payload?.exp) return;

    const expiresInMs = payload.exp * 1000 - Date.now() - 30_000;
    refreshTimeout.current = setTimeout(async () => {
      const newToken = await refreshToken();
      if (newToken) scheduleRefresh(newToken);
    }, expiresInMs);
  };

  useEffect(() => {
    if (token) scheduleRefresh(token);
    return clearScheduledRefresh;
  }, [token]);

  const apiFetch = async (url, options = {}) => {
    options.headers = { ...options.headers, Authorization: `Bearer ${token}` };
    options.credentials = "include";

    let res = await fetch(url, options);

    if (res.status === 401) {
      const newToken = await refreshToken();
      if (!newToken) return;

      options.headers.Authorization = `Bearer ${newToken}`;
      res = await fetch(url, options);
      if (res.status === 401) {
        logout();
        return;
      }
    }

    if (res.status === 204) return null;

    const text = await res.text();
    if (!text) return null;

    if (!res.ok) {
      try {
        const errData = JSON.parse(text);
        throw errData;
      } catch {
        throw {};
      }
    }

    return JSON.parse(text);
  };

  return (
    <ApiContext.Provider value={{ apiFetch, login, logout, token }}>
      {children}
    </ApiContext.Provider>
  );
};

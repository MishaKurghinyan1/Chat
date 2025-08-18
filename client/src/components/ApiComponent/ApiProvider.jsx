import React, { createContext, useEffect, useState } from "react";

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

  const refreshToken = async () => {
    const res = await fetch("http://localhost:8000/auth/refresh", {
      method: "POST",
      credentials: "include",
    });
    if (!res.ok) {
      localStorage.removeItem("token");
      window.location.href = "/login";
      return null;
    }
    const data = await res.json();
    localStorage.setItem("token", data.accessToken);
    setToken(data.accessToken);
    return data.accessToken;
  };

  const scheduleRefresh = (accessToken) => {
    const payload = parseJwt(accessToken);
    if (!payload?.exp) return;

    const expiresInMs = payload.exp * 1000 - Date.now() - 30_000;
    setTimeout(async () => {
      const newToken = await refreshToken();
      if (newToken) scheduleRefresh(newToken);
    }, expiresInMs);
  };

  useEffect(() => {
    if (token) scheduleRefresh(token);
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
        localStorage.removeItem("token");
        window.location.href = "/login";
        return;
      }
    }

    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      throw errData;
    }

    return res.json();
  };

  return (
    <ApiContext.Provider value={{ apiFetch }}>{children}</ApiContext.Provider>
  );
};

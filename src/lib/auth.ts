import { getAuthStorageKeys, getAuthRedirectPath } from "./authScope";

export const getCurrentUser = () => {
  const { user: userKey } = getAuthStorageKeys();
  const userStr = localStorage.getItem(userKey);
  if (!userStr) return null;
  try {
    return JSON.parse(userStr);
  } catch (e) {
    return null;
  }
};

export const getToken = () => {
  const { token: tokenKey } = getAuthStorageKeys();
  return localStorage.getItem(tokenKey);
};

/**
 * Persists a freshly-issued JWT + user object for the client portal.
 * Single source of truth used by both password login and Google Sign-In so the
 * localStorage keys + authScope handling never drift out of sync.
 */
export const saveClientSession = (token: string, user: unknown) => {
  const { token: tokenKey, user: userKey } = getAuthStorageKeys();
  localStorage.setItem(tokenKey, token);
  localStorage.setItem(userKey, JSON.stringify(user));
  localStorage.setItem("authScope", "client");
};

export const logout = () => {
  localStorage.removeItem("devionic_console_token");
  localStorage.removeItem("devionic_console_user");
  localStorage.removeItem("devionic_user_token");
  localStorage.removeItem("devionic_public_user");
  window.location.href = getAuthRedirectPath();
};

/**
 * Drop-in replacement for fetch() that handles silent JWT token refresh.
 *
 * Flow on a 401 response:
 *  1. First request to fail triggers a POST /users/refresh-token call.
 *  2. Concurrent requests that also fail with 401 are queued and wait.
 *  3. Once a new access token arrives, all queued requests are retried.
 *  4. If the refresh itself fails, all queued requests are rejected, tokens
 *     are cleared, and AuthContext is notified to force the user to /login.
 *
 * Usage:
 *   import { apiFetch } from "../utils/apiFetch";
 *   const res = await apiFetch(`${conf.serverUrl}/posts/`, { headers: { Authorization: `Bearer ${jwtToken}` } });
 *
 * Note: The Authorization header value in the original call doesn't matter —
 * apiFetch always injects the freshest token from localStorage.
 */

import conf from "../config/conf";
import { notifyTokenRefreshed, notifySessionExpired } from "./tokenRefresh";

let _isRefreshing = false;
let _pendingQueue = []; // { resolve, reject }[]

function processQueue(error, token = null) {
  _pendingQueue.forEach(({ resolve, reject }) =>
    error ? reject(error) : resolve(token)
  );
  _pendingQueue = [];
}

function makeHeaders(options, token) {
  return {
    ...(options.headers || {}),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

export async function apiFetch(url, options = {}) {
  const token = localStorage.getItem("token");

  let response = await fetch(url, {
    ...options,
    headers: makeHeaders(options, token),
  });

  if (response.status !== 401) return response;

  // ── 401: join refresh queue or trigger a new refresh ─────────────────────

  if (_isRefreshing) {
    return new Promise((resolve, reject) => {
      _pendingQueue.push({ resolve, reject });
    }).then((newToken) =>
      fetch(url, { ...options, headers: makeHeaders(options, newToken) })
    );
  }

  _isRefreshing = true;

  try {
    const refreshToken = localStorage.getItem("refreshToken");
    if (!refreshToken) throw new Error("No refresh token stored");

    const refreshRes = await fetch(`${conf.serverUrl}/users/refresh-token`, {
      method:  "POST",
      headers: { "Content-Type": "application/json" },
      body:    JSON.stringify({ refreshToken }),
    });

    if (!refreshRes.ok) throw new Error("Token refresh failed");

    const refreshData = await refreshRes.json();
    const newToken         = refreshData.data?.accessToken;
    const newRefreshToken  = refreshData.data?.refreshToken;

    if (!newToken) throw new Error("Server returned no access token");

    localStorage.setItem("token", newToken);
    if (newRefreshToken) localStorage.setItem("refreshToken", newRefreshToken);

    // Sync AuthContext state so React components re-render with the new token.
    notifyTokenRefreshed(newToken);

    processQueue(null, newToken);

    // Retry the original request with the fresh token.
    response = await fetch(url, {
      ...options,
      headers: makeHeaders(options, newToken),
    });
    return response;
  } catch (err) {
    processQueue(err);

    // Refresh failed — session is dead.
    localStorage.removeItem("token");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("user");
    notifySessionExpired();

    throw err;
  } finally {
    _isRefreshing = false;
  }
}

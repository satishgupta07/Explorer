/**
 * Module-level registry for token-lifecycle callbacks.
 *
 * apiFetch cannot import React context directly (it runs outside the React
 * tree), so instead AuthContext registers two callbacks here on mount:
 *
 *   onTokenRefreshed(newToken) — called when a silent refresh succeeds so
 *     context state stays in sync with localStorage.
 *
 *   onSessionExpired() — called when the refresh token is also invalid;
 *     triggers logout and redirects to /login.
 */

let _onTokenRefreshed = null;
let _onSessionExpired = null;

export function registerTokenCallbacks(onTokenRefreshed, onSessionExpired) {
  _onTokenRefreshed = onTokenRefreshed;
  _onSessionExpired = onSessionExpired;
}

export function notifyTokenRefreshed(newToken) {
  _onTokenRefreshed?.(newToken);
}

export function notifySessionExpired() {
  _onSessionExpired?.();
}

import { useState, useEffect, createContext, useContext, useCallback } from "react";
import { registerTokenCallbacks } from "../../utils/tokenRefresh";

// Default context shape — provides auto-complete in editors and documents the
// contract that consumers can expect from useAuth().
export const AuthContext = createContext({
  user: null,
  token: null,
  login: () => {},
  logout: () => {},
  updateUser: () => {},
  updateToken: () => {},
});

// Convenience hook so consumers don't need to import both useContext and AuthContext.
export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user,  setUser]  = useState(null);
  const [token, setToken] = useState(null);

  // On first render, rehydrate auth state from localStorage so the user
  // stays logged in across page refreshes without hitting the server.
  useEffect(() => {
    const _token = localStorage.getItem("token");
    const _user  = JSON.parse(localStorage.getItem("user") || "null");

    try {
      if (_token && _user?._id) {
        setUser(_user);
        setToken(_token);
      }
    } catch (error) {
      console.error("Error parsing user data:", error);
    }
  }, []);

  // Called after a successful login API response.
  // Persists auth data to both React state and localStorage.
  const login = (userData) => {
    const { user, accessToken, refreshToken } = userData;

    setUser(user);
    setToken(accessToken);

    localStorage.setItem("user",         JSON.stringify(user));
    localStorage.setItem("token",        accessToken);
    localStorage.setItem("refreshToken", refreshToken);
  };

  // Merges updated fields into the stored user object.
  // Called after a successful profile-update API response so the UI
  // reflects the new name / email / avatar without a full re-login.
  // useCallback keeps the reference stable so consumers (e.g. EditProfileModal)
  // don't recreate their own handlers on every context render.
  const updateUser = useCallback((updatedFields) => {
    setUser((prev) => {
      const merged = { ...prev, ...updatedFields };
      localStorage.setItem("user", JSON.stringify(merged));
      return merged;
    });
  }, []);

  // Called by apiFetch when a silent token refresh succeeds.
  // Keeps the React state in sync with the new token in localStorage.
  const updateToken = useCallback((newToken) => {
    setToken(newToken);
    localStorage.setItem("token", newToken);
  }, []);

  // Clears all auth state and localStorage entries.
  // Note: this does not call the server-side logout endpoint — the server's
  // refreshToken is invalidated separately when /logout is hit.
  const logout = useCallback(() => {
    setUser(null);
    setToken(null);

    localStorage.removeItem("user");
    localStorage.removeItem("token");
    localStorage.removeItem("refreshToken");
  }, []);

  // Register callbacks with the module-level tokenRefresh registry so
  // apiFetch (which runs outside the React tree) can update context state.
  useEffect(() => {
    registerTokenCallbacks(updateToken, logout);
  }, [updateToken, logout]);

  return (
    <AuthContext.Provider value={{ user, token, login, logout, updateUser, updateToken }}>
      {children}
    </AuthContext.Provider>
  );
};

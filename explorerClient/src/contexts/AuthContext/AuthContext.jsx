import { useState, useEffect, createContext, useContext } from "react";

export const AuthContext = createContext({
  user: null,
  token: null,
  login: () => {},
  logout: () => {},
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);

  useEffect(() => {
    const _token = localStorage.getItem("token");
    const _user = JSON.parse(localStorage.getItem("user"));

    try {
      if (_token && _user?._id) {
        setUser(_user);
        setToken(_token);
      }
    } catch (error) {
      // Handle parsing error
      console.error("Error parsing user data:", error);
    }
  }, []);

  const login = (userData) => {
    console.log(userData);
    const { user, accessToken, refreshToken } = userData;

    console.log(accessToken);
    // Set user and tokens in state
    setUser(user);
    setToken(accessToken);

    // Save user and tokens to local storage
    localStorage.setItem("user", JSON.stringify(user));
    localStorage.setItem("token", accessToken);
    localStorage.setItem("refreshToken", refreshToken);
  };

  const logout = () => {
    // Clear user and tokens from state
    setUser(null);
    setToken(null);

    // Remove user and tokens from local storage
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    localStorage.removeItem("refreshToken");

    // Add additional logic for token revocation or any cleanup needed on logout
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

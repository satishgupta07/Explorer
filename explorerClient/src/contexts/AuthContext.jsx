import { useState, useEffect } from "react";
import { createContext, useContext } from "react";

export const AuthContext = createContext({
  user: null,
  token: null,
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);

  useEffect(() => {
    const _token = localStorage.getItem("token");
    const _user = localStorage.getItem("user");
    console.log("Token : " + _token);
    console.log("User : " + _user);
    if (_token && _user?._id) {
      setUser(_user);
      setToken(_token);
    }
  }, []);

  return (
    <AuthContext.Provider value={{ user, setUser, token, setToken }}>
      {children}
    </AuthContext.Provider>
  );
};

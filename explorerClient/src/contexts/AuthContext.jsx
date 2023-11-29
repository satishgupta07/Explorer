import { useState, useEffect } from "react";
import { createContext, useContext } from "react";

export const AuthContext = createContext({
  user: null,
  token: null,
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);

  useEffect(() => {
    setIsLoading(true);
    const _token = localStorage.getItem("token");
    const _user = localStorage.getItem("user");
    console.log("Token : "+_token);
    if (_token && _user?._id) {
      setUser(_user);
      setToken(_token);
    }
    setIsLoading(false);
  }, []);

  return (
    <AuthContext.Provider value={{ user, setUser, token, setToken, isLoading }}>
      {isLoading ? <Loader /> : children}
    </AuthContext.Provider>
  );
};

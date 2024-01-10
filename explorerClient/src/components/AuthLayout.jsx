import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

export default function AuthLayout({ children, authentication = true }) {
  const navigate = useNavigate();
  const [loader, setLoader] = useState(true);
  const { user, token, logout } = useAuth();
  const jwtToken = token || localStorage.getItem("token");
  const _user = user || localStorage.getItem("user");

  useEffect(() => {
    let authStatus;
    if (_user && jwtToken) {
      authStatus = true;
    } else {
      authStatus = false;
    }

    if (authentication && authStatus !== authentication) {
      navigate("/login");
      logout();
    } else if (!authentication && authStatus !== authentication) {
      navigate("/");
    }
    setLoader(false);
  }, [user, token, navigate, authentication]);

  return loader ? <h1>Loading...</h1> : <>{children}</>;
}

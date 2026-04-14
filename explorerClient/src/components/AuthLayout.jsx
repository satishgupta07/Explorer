import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

/**
 * Route guard component.
 * - authentication=true (default): redirects unauthenticated users to /login.
 * - authentication=false: redirects already-authenticated users to /.
 * Shows a full-page shimmer skeleton while the auth check runs to avoid
 * flashing either protected content or an unnecessary redirect.
 */
export default function AuthLayout({ children, authentication = true }) {
  const navigate         = useNavigate();
  const [loading, setLoading] = useState(true);
  const { user, token, logout } = useAuth();

  // Fall back to localStorage in case the context hasn't rehydrated yet.
  const jwtToken = token || localStorage.getItem("token");
  const _user    = user  || JSON.parse(localStorage.getItem("user") || "null");
  const isAuth   = !!(_user && jwtToken);

  useEffect(() => {
    if (authentication && !isAuth) {
      navigate("/login");
      logout();
    } else if (!authentication && isAuth) {
      navigate("/");
    }
    setLoading(false);
  }, [user, token, navigate, authentication]);

  if (loading) {
    return (
      <div className="min-h-[calc(100vh-56px)] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-ig-purple to-purple-500 flex items-center justify-center animate-pulse">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="white" className="w-7 h-7">
              <path d="M11.645 20.91l-.007-.003-.022-.012a15.247 15.247 0 01-.383-.218 25.18 25.18 0 01-4.244-3.17C4.688 15.36 2.25 12.174 2.25 8.25 2.25 5.322 4.714 3 7.688 3A5.5 5.5 0 0112 5.052 5.5 5.5 0 0116.313 3c2.973 0 5.437 2.322 5.437 5.25 0 3.925-2.438 7.111-4.739 9.256a25.175 25.175 0 01-4.244 3.17 15.247 15.247 0 01-.383.219l-.022.012-.007.004-.003.001a.752.752 0 01-.704 0l-.003-.001z" />
            </svg>
          </div>
          <p className="text-ig-secondary text-sm">Loading…</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}

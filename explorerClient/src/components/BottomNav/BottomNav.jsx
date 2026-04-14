import React from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { avatarUrl } from "../../utils/cloudinary";

/**
 * Mobile-only bottom navigation bar (hidden on md+ screens).
 * Provides quick access to Home, Create, and Profile.
 * Fixed at the bottom of the viewport, safe-area aware.
 */
function BottomNav() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const _user    = user || JSON.parse(localStorage.getItem("user") || "null");

  const handleCreate = () => {
    // Navigate to feed first (if not already there), then scroll to the create bar.
    if (location.pathname !== "/") {
      navigate("/");
    } else {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-ig-border">
      <div className="flex items-center justify-around h-14 max-w-md mx-auto px-4">

        {/* Home */}
        <Link
          to="/"
          className={`flex flex-col items-center justify-center p-2 rounded-lg transition-colors ${
            isActive("/") ? "text-ig-purple" : "text-ig-secondary"
          }`}
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"
            fill={isActive("/") ? "currentColor" : "none"}
            stroke="currentColor" strokeWidth={isActive("/") ? 0 : 1.8}
            className="w-6 h-6">
            <path strokeLinecap="round" strokeLinejoin="round"
              d="M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
          </svg>
        </Link>

        {/* Create Post */}
        <button
          onClick={handleCreate}
          className="flex items-center justify-center w-10 h-10 rounded-xl bg-ig-purple text-white shadow-md shadow-ig-purple/30 active:scale-95 transition-transform"
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
            <path fillRule="evenodd" d="M12 3.75a.75.75 0 01.75.75v6.75h6.75a.75.75 0 010 1.5h-6.75v6.75a.75.75 0 01-1.5 0v-6.75H4.5a.75.75 0 010-1.5h6.75V4.5a.75.75 0 01.75-.75z" clipRule="evenodd" />
          </svg>
        </button>

        {/* Profile */}
        <Link
          to="/profile"
          className={`flex flex-col items-center justify-center p-1 rounded-full transition-all ${
            isActive("/profile") ? "ring-2 ring-ig-purple" : ""
          }`}
        >
          {_user ? (
            <img
              src={avatarUrl(_user.avatar)}
              alt="Profile"
              className="w-7 h-7 rounded-full object-cover"
            />
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"
              fill="none" stroke="currentColor" strokeWidth={1.8}
              className="w-6 h-6 text-ig-secondary">
              <path strokeLinecap="round" strokeLinejoin="round"
                d="M17.982 18.725A7.488 7.488 0 0012 15.75a7.488 7.488 0 00-5.982 2.975m11.963 0a9 9 0 10-11.963 0m11.963 0A8.966 8.966 0 0112 21a8.966 8.966 0 01-5.982-2.275M15 9.75a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          )}
        </Link>
      </div>
    </nav>
  );
}

export default BottomNav;

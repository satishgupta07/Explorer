import React, { useState, useEffect, useRef, useCallback } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { useDebounce } from "../hooks/useDebounce";
import { apiFetch } from "../utils/apiFetch";
import conf from "../config/conf";
import { avatarUrl } from "../utils/cloudinary";

/**
 * Top-level navigation bar — clean white, Instagram-inspired.
 * - Desktop: logo left | search centre | nav icons + avatar right
 * - Mobile:  logo left | search icon right (expands to full-width input)
 * Always sticky at the top with a bottom border.
 */
export default function Navbar() {
  const { user, token, logout } = useAuth();
  const navigate   = useNavigate();
  const location   = useLocation();

  const [menuOpen,      setMenuOpen]      = useState(false);
  const [searchOpen,    setSearchOpen]    = useState(false); // mobile search expanded
  const [searchQuery,   setSearchQuery]   = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [searching,     setSearching]     = useState(false);

  const searchRef    = useRef(null);
  const debouncedQ   = useDebounce(searchQuery, 350);

  const _user  = user  || JSON.parse(localStorage.getItem("user")  || "null");
  const _token = token || localStorage.getItem("token");
  const isAuth = !!(_user && _token);

  // ── Search ──────────────────────────────────────────────────────────────────

  useEffect(() => {
    if (!debouncedQ.trim() || !isAuth) {
      setSearchResults([]);
      return;
    }
    let cancelled = false;
    setSearching(true);
    apiFetch(`${conf.serverUrl}/users/search?q=${encodeURIComponent(debouncedQ)}`)
      .then((r) => r.json())
      .then((data) => {
        if (!cancelled) setSearchResults(data.data ?? []);
      })
      .catch(() => {})
      .finally(() => { if (!cancelled) setSearching(false); });
    return () => { cancelled = true; };
  }, [debouncedQ, isAuth]);

  const clearSearch = useCallback(() => {
    setSearchQuery("");
    setSearchResults([]);
    setSearchOpen(false);
  }, []);

  const goToUser = useCallback((userId) => {
    clearSearch();
    navigate(`/profile/${userId}`);
  }, [clearSearch, navigate]);

  // Close search results when clicking outside the search box.
  useEffect(() => {
    const handler = (e) => {
      if (searchRef.current && !searchRef.current.contains(e.target)) {
        setSearchResults([]);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // ── Auth ────────────────────────────────────────────────────────────────────

  const handleLogout = () => {
    logout();
    navigate("/login");
    setMenuOpen(false);
  };

  const isActive = (path) => location.pathname === path;

  // ── Render ──────────────────────────────────────────────────────────────────

  return (
    <nav className="sticky top-0 z-40 bg-white border-b border-ig-border">
      <div className="max-w-5xl mx-auto px-4 h-14 flex items-center gap-3">

        {/* ── Logo ──────────────────────────────────────────────────── */}
        <Link to="/" className="flex items-center gap-2 shrink-0">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-ig-purple to-purple-500 flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="white" className="w-5 h-5">
              <path d="M11.645 20.91l-.007-.003-.022-.012a15.247 15.247 0 01-.383-.218 25.18 25.18 0 01-4.244-3.17C4.688 15.36 2.25 12.174 2.25 8.25 2.25 5.322 4.714 3 7.688 3A5.5 5.5 0 0112 5.052 5.5 5.5 0 0116.313 3c2.973 0 5.437 2.322 5.437 5.25 0 3.925-2.438 7.111-4.739 9.256a25.175 25.175 0 01-4.244 3.17 15.247 15.247 0 01-.383.219l-.022.012-.007.004-.003.001a.752.752 0 01-.704 0l-.003-.001z" />
            </svg>
          </div>
          <span className={`font-bold text-lg text-ig-text tracking-tight transition-all ${searchOpen ? "hidden" : "hidden xs:block"}`}>
            Explorer
          </span>
        </Link>

        {/* ── Search box (desktop always visible; mobile toggled) ──── */}
        {isAuth && (
          <div
            ref={searchRef}
            className={`relative flex-1 transition-all ${searchOpen ? "block" : "hidden md:block"} max-w-xs`}
          >
            <div className="relative">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ig-secondary pointer-events-none"
                fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
              </svg>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => setSearchOpen(true)}
                placeholder="Search users…"
                className="w-full pl-9 pr-8 py-1.5 text-sm bg-ig-bg border border-ig-border rounded-lg outline-none focus:ring-2 focus:ring-ig-purple/30 focus:border-ig-purple transition-all placeholder-ig-secondary"
              />
              {searchQuery && (
                <button
                  onClick={clearSearch}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-ig-secondary hover:text-ig-text"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                    <path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z" />
                  </svg>
                </button>
              )}
            </div>

            {/* Search results dropdown */}
            {(searchResults.length > 0 || searching) && (
              <div className="absolute top-full mt-1 left-0 right-0 bg-white rounded-xl shadow-lg border border-ig-border py-1 z-50 animate-slide-down">
                {searching && searchResults.length === 0 ? (
                  <div className="px-4 py-3 text-sm text-ig-secondary text-center">Searching…</div>
                ) : searchResults.length === 0 ? (
                  <div className="px-4 py-3 text-sm text-ig-secondary text-center">No users found</div>
                ) : (
                  searchResults.map((u) => (
                    <button
                      key={u._id}
                      onClick={() => goToUser(u._id)}
                      className="flex items-center gap-3 w-full px-4 py-2.5 hover:bg-gray-50 transition-colors text-left"
                    >
                      <img
                        src={avatarUrl(u.avatar)}
                        alt={u.name}
                        className="w-8 h-8 rounded-full object-cover shrink-0"
                      />
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-ig-text truncate">{u.name}</p>
                        <p className="text-xs text-ig-secondary truncate">{u.email}</p>
                      </div>
                    </button>
                  ))
                )}
              </div>
            )}
          </div>
        )}

        {/* Spacer pushes right section to the edge on desktop */}
        <div className="flex-1 md:hidden" />

        {/* ── Right section ─────────────────────────────────────────── */}
        <div className="flex items-center gap-1">
          {isAuth ? (
            <>
              {/* Mobile search toggle */}
              {!searchOpen && (
                <button
                  onClick={() => setSearchOpen(true)}
                  className="md:hidden p-2 rounded-lg text-ig-text hover:bg-gray-100 transition-colors"
                  aria-label="Search"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"
                    stroke="currentColor" strokeWidth={1.8} className="w-5 h-5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
                  </svg>
                </button>
              )}
              {searchOpen && (
                <button
                  onClick={clearSearch}
                  className="md:hidden p-2 rounded-lg text-ig-text hover:bg-gray-100 transition-colors"
                  aria-label="Close search"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"
                    stroke="currentColor" strokeWidth={2} className="w-5 h-5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}

              {/* Desktop nav icons */}
              <div className="hidden md:flex items-center gap-1">
                <Link
                  to="/"
                  className={`p-2 rounded-lg transition-colors ${isActive("/") ? "text-ig-purple" : "text-ig-text hover:bg-gray-100"}`}
                  title="Home"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"
                    fill={isActive("/") ? "currentColor" : "none"}
                    stroke="currentColor" strokeWidth={isActive("/") ? 0 : 1.8}
                    className="w-6 h-6">
                    <path strokeLinecap="round" strokeLinejoin="round"
                      d="M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
                  </svg>
                </Link>

                <Link
                  to="/profile"
                  className={`p-2 rounded-lg transition-colors ${isActive("/profile") ? "text-ig-purple" : "text-ig-text hover:bg-gray-100"}`}
                  title="Profile"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"
                    fill={isActive("/profile") ? "currentColor" : "none"}
                    stroke="currentColor" strokeWidth={isActive("/profile") ? 0 : 1.8}
                    className="w-6 h-6">
                    <path strokeLinecap="round" strokeLinejoin="round"
                      d="M17.982 18.725A7.488 7.488 0 0012 15.75a7.488 7.488 0 00-5.982 2.975m11.963 0a9 9 0 10-11.963 0m11.963 0A8.966 8.966 0 0112 21a8.966 8.966 0 01-5.982-2.275M15 9.75a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </Link>
              </div>

              {/* Avatar button → dropdown menu */}
              <div className="relative">
                <button
                  onClick={() => setMenuOpen(!menuOpen)}
                  className="flex items-center gap-2 p-1 rounded-full hover:ring-2 hover:ring-ig-purple/30 transition-all"
                >
                  <img
                    src={avatarUrl(_user.avatar)}
                    alt={_user.name}
                    className="w-8 h-8 rounded-full object-cover"
                  />
                  <span className="hidden sm:block text-sm font-semibold text-ig-text max-w-[100px] truncate">
                    {_user.name}
                  </span>
                </button>

                {/* Dropdown */}
                {menuOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-ig-border py-1 animate-slide-down z-50">
                    <Link
                      to="/profile"
                      onClick={() => setMenuOpen(false)}
                      className="flex items-center gap-2 px-4 py-2.5 text-sm text-ig-text hover:bg-gray-50 transition-colors"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M17.982 18.725A7.488 7.488 0 0012 15.75a7.488 7.488 0 00-5.982 2.975m11.963 0a9 9 0 10-11.963 0m11.963 0A8.966 8.966 0 0112 21a8.966 8.966 0 01-5.982-2.275M15 9.75a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      Your Profile
                    </Link>
                    <div className="border-t border-ig-border my-1" />
                    <button
                      onClick={handleLogout}
                      className="flex items-center gap-2 w-full px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 transition-colors"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9" />
                      </svg>
                      Sign out
                    </button>
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                to="/login"
                className="text-sm font-semibold text-ig-purple hover:text-ig-purple-dark transition-colors px-3 py-1.5"
              >
                Sign In
              </Link>
              <Link
                to="/register"
                className="text-sm font-semibold bg-ig-purple hover:bg-ig-purple-dark text-white rounded-lg px-3 py-1.5 transition-colors"
              >
                Sign Up
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Click-outside overlay to close dropdown menu */}
      {menuOpen && (
        <div className="fixed inset-0 z-30" onClick={() => setMenuOpen(false)} />
      )}
    </nav>
  );
}

import React, { lazy, Suspense } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import AuthLayout from "./components/AuthLayout";
import BottomNav from "./components/BottomNav/BottomNav";
import ErrorBoundary from "./components/ErrorBoundary";
import "./App.css";

/**
 * Route-based code splitting with React.lazy.
 * Each page bundle is only downloaded when the user navigates to that route,
 * reducing the initial JS payload significantly.
 */
const Home        = lazy(() => import("./pages/Home"));
const Login       = lazy(() => import("./pages/Login"));
const Register    = lazy(() => import("./pages/Register"));
const ProfilePage = lazy(() => import("./pages/ProfilePage"));
const UserProfile = lazy(() => import("./pages/UserProfile"));

/**
 * Minimal full-page loading indicator shown by Suspense while a lazy chunk loads.
 */
function PageLoader() {
  return (
    <div className="min-h-[calc(100vh-56px)] flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-ig-border border-t-ig-purple rounded-full animate-spin" />
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      {/* Global sticky navbar */}
      <Navbar />

      {/* Page-level error boundary — catches any uncaught render error */}
      <ErrorBoundary>
        <Suspense fallback={<PageLoader />}>
          <Routes>
            {/* Protected routes */}
            <Route
              path="/"
              element={
                <AuthLayout>
                  <Home />
                </AuthLayout>
              }
            />
            <Route
              path="/profile"
              element={
                <AuthLayout>
                  <ProfilePage />
                </AuthLayout>
              }
            />
            <Route
              path="/profile/:userid"
              element={
                <AuthLayout>
                  <UserProfile />
                </AuthLayout>
              }
            />

            {/* Public routes */}
            <Route path="/login"    element={<Login />} />
            <Route path="/register" element={<Register />} />

            {/* 404 */}
            <Route
              path="*"
              element={
                <div className="min-h-[calc(100vh-56px)] flex items-center justify-center">
                  <div className="text-center">
                    <p className="text-6xl font-bold text-ig-border">404</p>
                    <p className="text-ig-secondary mt-2">Page not found</p>
                  </div>
                </div>
              }
            />
          </Routes>
        </Suspense>
      </ErrorBoundary>

      {/* Mobile bottom navigation — only shown when authenticated */}
      <BottomNav />
    </BrowserRouter>
  );
}

export default App;

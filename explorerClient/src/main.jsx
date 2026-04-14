import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import "./index.css";
import { AuthProvider } from "./contexts/AuthContext";
import { PostProvider } from "./contexts/PostContext";
import { ToastProvider } from "./contexts/ToastContext";

// Provider order (outer → inner):
//   ToastProvider  — global toast queue, needs no other context
//   AuthProvider   — auth state; registers token-refresh callbacks on mount
//   PostProvider   — global posts state; may eventually read auth context
ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <ToastProvider>
      <AuthProvider>
        <PostProvider>
          <App />
        </PostProvider>
      </AuthProvider>
    </ToastProvider>
  </React.StrictMode>
);

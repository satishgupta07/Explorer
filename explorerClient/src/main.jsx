import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import "./index.css";
import { AuthProvider }   from "./contexts/AuthContext";
import { PostProvider }   from "./contexts/PostContext";
import { ToastProvider }  from "./contexts/ToastContext";
import { FollowProvider } from "./contexts/FollowContext";

// Provider order (outer → inner):
//   ToastProvider   — global toast queue, needs no other context
//   AuthProvider    — auth state; registers token-refresh callbacks on mount
//   FollowProvider  — depends on auth token; hydrates the current user's
//                     "following" list once and broadcasts updates
//   PostProvider    — global posts state; may eventually read auth context
ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <ToastProvider>
      <AuthProvider>
        <FollowProvider>
          <PostProvider>
            <App />
          </PostProvider>
        </FollowProvider>
      </AuthProvider>
    </ToastProvider>
  </React.StrictMode>
);

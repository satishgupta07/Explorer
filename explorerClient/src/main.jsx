import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import "./index.css";
import { AuthProvider } from "./contexts/AuthContext";
import { PostProvider } from "./contexts/PostContext";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <AuthProvider>
      <PostProvider>
        <App />
      </PostProvider>
    </AuthProvider>
  </React.StrictMode>
);

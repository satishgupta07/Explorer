import "./App.css";
import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import Login from "./pages/Login";
import ProfilePage from "./pages/ProfilePage";
import Register from "./pages/Register";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import UserProfile from "./pages/UserProfile";
import AuthLayout from "./components/AuthLayout";

function App() {
  return (
    <>
      <BrowserRouter>
        <Navbar />
        <Routes>
          <Route
            exact
            path="/"
            element={
              <AuthLayout>
                <Home />
              </AuthLayout>
            }
          />
          <Route exact path="/login" element={<Login />} />
          <Route exact path="/register" element={<Register />} />
          <Route
            exact
            path="/profile"
            element={
              <AuthLayout>
                <ProfilePage />
              </AuthLayout>
            }
          />
          <Route
            exact
            path="/profile/:userid"
            element={
              <AuthLayout>
                <UserProfile />
              </AuthLayout>
            }
          />
          {/* Wildcard route for undefined paths. Shows a 404 error */}
          <Route path="*" element={<p>404 Not found</p>} />
        </Routes>
      </BrowserRouter>
    </>
  );
}

export default App;

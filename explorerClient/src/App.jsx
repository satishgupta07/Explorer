import "./App.css";
import Navbar from "./components/Navbar";
import { useAuth } from "./contexts";
import Home from "./pages/Home";
import Login from "./pages/Login";
import ProfilePage from "./pages/ProfilePage";
import Register from "./pages/Register";
import { BrowserRouter, Routes, Route } from "react-router-dom";

function App() {
  return (
    <>
      <BrowserRouter>
        <Navbar />
        <Routes>
          <Route exact path="/" element={<Home />} />
          <Route exact path="/login" element={<Login />} />
          <Route exact path="/register" element={<Register />} />
          <Route exact path="/profile" element={<ProfilePage />} />
          {/* Wildcard route for undefined paths. Shows a 404 error */}
          <Route path="*" element={<p>404 Not found</p>} />
        </Routes>
      </BrowserRouter>
    </>
  );
}

export default App;

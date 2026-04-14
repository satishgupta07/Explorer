import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { authenticateLogin } from "../services/auth";
import { useAuth } from "../contexts/AuthContext";

/**
 * Clean, centered login page inspired by Instagram's auth flow.
 * Uses local error state instead of SweetAlert2 for inline, accessible feedback.
 */
function Login() {
  const [form,     setForm]     = useState({ email: "", password: "" });
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState("");

  const navigate = useNavigate();
  const { login } = useAuth();

  const handleChange = (e) =>
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await authenticateLogin(form);
      login(res.data.data);
      navigate("/");
    } catch (err) {
      setError(
        err?.response?.data?.message ?? "Invalid credentials. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-56px)] bg-ig-bg flex items-center justify-center p-4">
      <div className="w-full max-w-sm">

        {/* Card */}
        <div className="card-rounded p-8 mb-3">
          {/* Logo */}
          <div className="flex flex-col items-center mb-8">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-ig-purple to-purple-500 flex items-center justify-center mb-3">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="white" className="w-8 h-8">
                <path d="M11.645 20.91l-.007-.003-.022-.012a15.247 15.247 0 01-.383-.218 25.18 25.18 0 01-4.244-3.17C4.688 15.36 2.25 12.174 2.25 8.25 2.25 5.322 4.714 3 7.688 3A5.5 5.5 0 0112 5.052 5.5 5.5 0 0116.313 3c2.973 0 5.437 2.322 5.437 5.25 0 3.925-2.438 7.111-4.739 9.256a25.175 25.175 0 01-4.244 3.17 15.247 15.247 0 01-.383.219l-.022.012-.007.004-.003.001a.752.752 0 01-.704 0l-.003-.001z" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-ig-text">Explorer</h1>
            <p className="text-ig-secondary text-sm mt-1">Sign in to see your world</p>
          </div>

          {/* Error banner */}
          {error && (
            <div className="mb-4 px-3 py-2.5 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600 animate-fade-in">
              {error}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-3">
            <div>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={form.email}
                onChange={handleChange}
                placeholder="Email address"
                className="input-field"
              />
            </div>
            <div>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                value={form.password}
                onChange={handleChange}
                placeholder="Password"
                className="input-field"
              />
            </div>

            <button
              type="submit"
              disabled={loading || !form.email || !form.password}
              className="btn-primary flex items-center justify-center gap-2 mt-1"
            >
              {loading ? (
                <>
                  <svg className="animate-spin w-4 h-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Signing in…
                </>
              ) : (
                "Sign In"
              )}
            </button>
          </form>
        </div>

        {/* Register link */}
        <div className="card-rounded px-8 py-4 text-center text-sm">
          Don't have an account?{" "}
          <Link to="/register" className="font-semibold text-ig-purple hover:text-ig-purple-dark transition-colors">
            Sign up
          </Link>
        </div>
      </div>
    </div>
  );
}

export default Login;

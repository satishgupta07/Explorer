import React, { useState, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import { registerUser } from "../services/auth";

const INITIAL = { name: "", email: "", password: "", confirm_password: "" };

/**
 * Registration page with avatar upload preview.
 * Inline validation and error messages — no external alert library needed.
 */
function Register() {
  const navigate                 = useNavigate();
  const [form,    setForm]       = useState(INITIAL);
  const [avatar,  setAvatar]     = useState(null);        // File object
  const [preview, setPreview]    = useState("");           // data URL for preview
  const [loading, setLoading]    = useState(false);
  const [error,   setError]      = useState("");

  const handleChange = (e) =>
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const handleAvatar = useCallback((e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 1 * 1024 * 1024) {
      setError("Profile photo must be under 1 MB.");
      return;
    }
    setAvatar(file);
    const reader = new FileReader();
    reader.onload = (ev) => setPreview(ev.target.result);
    reader.readAsDataURL(file);
  }, []);

  const validate = () => {
    if (!form.name || form.name.length < 3)
      return "Name must be at least 3 characters.";
    if (form.password !== form.confirm_password)
      return "Passwords do not match.";
    if (!avatar)
      return "Please upload a profile photo.";
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    const validationError = validate();
    if (validationError) { setError(validationError); return; }

    setLoading(true);
    try {
      const data = new FormData();
      Object.entries(form).forEach(([k, v]) => data.append(k, v));
      data.append("avatar", avatar);

      const res = await registerUser(data);
      if (res.data.success) navigate("/login");
    } catch (err) {
      setError(
        err?.response?.data?.message ?? "Registration failed. Please try again."
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
          <div className="flex flex-col items-center mb-6">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-ig-purple to-purple-500 flex items-center justify-center mb-3">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="white" className="w-8 h-8">
                <path d="M11.645 20.91l-.007-.003-.022-.012a15.247 15.247 0 01-.383-.218 25.18 25.18 0 01-4.244-3.17C4.688 15.36 2.25 12.174 2.25 8.25 2.25 5.322 4.714 3 7.688 3A5.5 5.5 0 0112 5.052 5.5 5.5 0 0116.313 3c2.973 0 5.437 2.322 5.437 5.25 0 3.925-2.438 7.111-4.739 9.256a25.175 25.175 0 01-4.244 3.17 15.247 15.247 0 01-.383.219l-.022.012-.007.004-.003.001a.752.752 0 01-.704 0l-.003-.001z" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-ig-text">Explorer</h1>
            <p className="text-ig-secondary text-sm mt-1 text-center">
              Sign up to share your moments
            </p>
          </div>

          {/* Error banner */}
          {error && (
            <div className="mb-4 px-3 py-2.5 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600 animate-fade-in">
              {error}
            </div>
          )}

          {/* Avatar picker */}
          <div className="flex justify-center mb-5">
            <label className="cursor-pointer group relative">
              <div className={`w-20 h-20 rounded-full overflow-hidden border-2 ${
                preview ? "border-ig-purple" : "border-dashed border-ig-border"
              } flex items-center justify-center bg-ig-bg hover:border-ig-purple transition-colors`}>
                {preview ? (
                  <img src={preview} alt="Preview" className="w-full h-full object-cover" />
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-8 h-8 text-ig-secondary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                  </svg>
                )}
              </div>
              {/* Edit overlay */}
              {preview && (
                <div className="absolute inset-0 rounded-full bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                  </svg>
                </div>
              )}
              <input type="file" accept="image/*" onChange={handleAvatar} className="hidden" />
            </label>
          </div>
          <p className="text-center text-xs text-ig-secondary mb-5 -mt-3">
            {preview ? "Tap to change photo" : "Add profile photo"}
          </p>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-3">
            <input
              name="name"
              type="text"
              placeholder="Full name"
              required
              value={form.name}
              onChange={handleChange}
              className="input-field"
            />
            <input
              name="email"
              type="email"
              placeholder="Email address"
              required
              autoComplete="email"
              value={form.email}
              onChange={handleChange}
              className="input-field"
            />
            <input
              name="password"
              type="password"
              placeholder="Password"
              required
              autoComplete="new-password"
              value={form.password}
              onChange={handleChange}
              className="input-field"
            />
            <input
              name="confirm_password"
              type="password"
              placeholder="Confirm password"
              required
              value={form.confirm_password}
              onChange={handleChange}
              className="input-field"
            />

            <button
              type="submit"
              disabled={loading}
              className="btn-primary flex items-center justify-center gap-2 mt-1"
            >
              {loading ? (
                <>
                  <svg className="animate-spin w-4 h-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Creating account…
                </>
              ) : (
                "Create Account"
              )}
            </button>
          </form>

          <p className="text-xs text-ig-secondary text-center mt-4">
            By signing up, you agree to our Terms and Privacy Policy.
          </p>
        </div>

        {/* Login link */}
        <div className="card-rounded px-8 py-4 text-center text-sm">
          Already have an account?{" "}
          <Link to="/login" className="font-semibold text-ig-purple hover:text-ig-purple-dark transition-colors">
            Sign in
          </Link>
        </div>
      </div>
    </div>
  );
}

export default Register;

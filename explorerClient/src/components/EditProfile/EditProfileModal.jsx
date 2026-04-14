import React, { useState, useRef, useCallback } from "react";
import conf from "../../config/conf";
import { useAuth } from "../../contexts/AuthContext";
import { useToast } from "../../contexts/ToastContext";
import { apiFetch } from "../../utils/apiFetch";
import { avatarUrl } from "../../utils/cloudinary";

/**
 * Modal dialog for editing the current user's profile.
 *
 * Tab 1 – Profile: change display name, email, avatar.
 * Tab 2 – Password: change current password.
 *
 * On success, calls AuthContext.updateUser() so the UI reflects changes
 * immediately without a full re-login.
 */
function EditProfileModal({ onClose, onSaved }) {
  const { user, token, updateUser } = useAuth();
  const { toast } = useToast();
  const jwtToken = token || localStorage.getItem("token");
  const _user    = user  || JSON.parse(localStorage.getItem("user") || "null");

  const [tab,           setTab]           = useState("profile"); // "profile" | "password"

  // ── Profile tab state ──────────────────────────────────────────────────────
  const [name,          setName]          = useState(_user?.name  ?? "");
  const [email,         setEmail]         = useState(_user?.email ?? "");
  const [avatarFile,    setAvatarFile]    = useState(null);
  const [avatarPreview, setAvatarPreview] = useState("");
  const [savingProfile, setSavingProfile] = useState(false);

  // ── Password tab state ─────────────────────────────────────────────────────
  const [oldPassword,   setOldPassword]   = useState("");
  const [newPassword,   setNewPassword]   = useState("");
  const [confirmPwd,    setConfirmPwd]    = useState("");
  const [savingPwd,     setSavingPwd]     = useState(false);
  const [showOld,       setShowOld]       = useState(false);
  const [showNew,       setShowNew]       = useState(false);

  const fileInputRef = useRef(null);

  // ── Avatar selection ───────────────────────────────────────────────────────

  const handleAvatarChange = useCallback((e) => {
    const file = e.target.files[0];
    if (!file || !file.type.startsWith("image/")) return;
    if (file.size > 1 * 1024 * 1024) {
      toast.error("Image must be under 1 MB.");
      return;
    }
    setAvatarFile(file);
    const reader = new FileReader();
    reader.onload = (ev) => setAvatarPreview(ev.target.result);
    reader.readAsDataURL(file);
  }, [toast]);

  // ── Save profile ───────────────────────────────────────────────────────────

  const handleSaveProfile = useCallback(async () => {
    if (savingProfile) return;

    const nameChanged   = name.trim()  !== (_user?.name  ?? "");
    const emailChanged  = email.trim() !== (_user?.email ?? "");
    const avatarChanged = !!avatarFile;

    if (!nameChanged && !emailChanged && !avatarChanged) {
      onClose();
      return;
    }

    setSavingProfile(true);
    try {
      let updatedUser = { ..._user };

      if (nameChanged || emailChanged) {
        const body = {};
        if (nameChanged)  body.name  = name.trim();
        if (emailChanged) body.email = email.trim();

        const res  = await apiFetch(`${conf.serverUrl}/users/update-account`, {
          method:  "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization:  `Bearer ${jwtToken}`,
          },
          body: JSON.stringify(body),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data?.message || "Failed to update details");
        updatedUser = { ...updatedUser, ...data.data };
      }

      if (avatarChanged) {
        const form = new FormData();
        form.append("avatar", avatarFile);

        const res  = await apiFetch(`${conf.serverUrl}/users/update-avatar`, {
          method:  "PATCH",
          headers: { Authorization: `Bearer ${jwtToken}` },
          body:    form,
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data?.message || "Failed to update avatar");
        updatedUser = { ...updatedUser, ...data.data };
      }

      updateUser(updatedUser);
      toast.success("Profile updated successfully!");
      onSaved?.();
      onClose();
    } catch (err) {
      console.error("Edit profile error:", err);
      toast.error(err.message || "Something went wrong. Please try again.");
    } finally {
      setSavingProfile(false);
    }
  }, [savingProfile, name, email, avatarFile, _user, jwtToken, updateUser, onClose, onSaved, toast]);

  // ── Save password ──────────────────────────────────────────────────────────

  const handleSavePassword = useCallback(async () => {
    if (savingPwd) return;

    if (!oldPassword || !newPassword || !confirmPwd) {
      toast.error("All password fields are required.");
      return;
    }
    if (newPassword !== confirmPwd) {
      toast.error("New passwords do not match.");
      return;
    }
    if (newPassword.length < 3) {
      toast.error("New password must be at least 3 characters.");
      return;
    }

    setSavingPwd(true);
    try {
      const res  = await apiFetch(`${conf.serverUrl}/users/change-password`, {
        method:  "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization:  `Bearer ${jwtToken}`,
        },
        body: JSON.stringify({ oldPassword, newPassword }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.message || "Failed to change password");

      setOldPassword("");
      setNewPassword("");
      setConfirmPwd("");
      toast.success("Password changed successfully!");
    } catch (err) {
      console.error("Change password error:", err);
      toast.error(err.message || "Something went wrong. Please try again.");
    } finally {
      setSavingPwd(false);
    }
  }, [savingPwd, oldPassword, newPassword, confirmPwd, jwtToken, toast]);

  // ── Render ─────────────────────────────────────────────────────────────────

  const currentAvatar = avatarPreview || avatarUrl(_user?.avatar);

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm animate-fade-in"
        onClick={onClose}
      />

      {/* Dialog */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div
          className="bg-white rounded-2xl w-full max-w-md shadow-2xl animate-slide-up"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-5 py-4 border-b border-ig-border">
            <h2 className="text-base font-semibold text-ig-text">Edit Profile</h2>
            <button onClick={onClose} className="p-1 rounded-full hover:bg-gray-100 transition-colors" aria-label="Close">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none"
                stroke="currentColor" strokeWidth={2} className="w-5 h-5 text-ig-text">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Tabs */}
          <div className="flex border-b border-ig-border">
            {["profile", "password"].map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`flex-1 py-3 text-sm font-semibold capitalize transition-colors ${
                  tab === t
                    ? "text-ig-purple border-b-2 border-ig-purple"
                    : "text-ig-secondary hover:text-ig-text"
                }`}
              >
                {t === "profile" ? "Profile" : "Password"}
              </button>
            ))}
          </div>

          {/* ── Profile Tab ─────────────────────────────────────────── */}
          {tab === "profile" && (
            <>
              <div className="p-5 space-y-5">
                {/* Avatar picker */}
                <div className="flex flex-col items-center gap-3">
                  <div className="relative">
                    <img
                      src={currentAvatar}
                      alt="Avatar preview"
                      className="w-20 h-20 rounded-full object-cover border-2 border-ig-border"
                    />
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="absolute -bottom-1 -right-1 bg-ig-purple text-white rounded-full p-1.5 shadow-md hover:bg-ig-purple-dark transition-colors"
                      aria-label="Change avatar"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-3.5 h-3.5">
                        <path d="M21.731 2.269a2.625 2.625 0 00-3.712 0l-1.157 1.157 3.712 3.712 1.157-1.157a2.625 2.625 0 000-3.712zM19.513 8.199l-3.712-3.712-8.4 8.4a5.25 5.25 0 00-1.32 2.214l-.8 2.685a.75.75 0 00.933.933l2.685-.8a5.25 5.25 0 002.214-1.32l8.4-8.4z" />
                        <path d="M5.25 5.25a3 3 0 00-3 3v10.5a3 3 0 003 3h10.5a3 3 0 003-3V13.5a.75.75 0 00-1.5 0v5.25a1.5 1.5 0 01-1.5 1.5H5.25a1.5 1.5 0 01-1.5-1.5V8.25a1.5 1.5 0 011.5-1.5h5.25a.75.75 0 000-1.5H5.25z" />
                      </svg>
                    </button>
                  </div>
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="text-sm font-medium text-ig-purple hover:text-ig-purple-dark transition-colors"
                  >
                    Change photo
                  </button>
                  <input ref={fileInputRef} type="file" accept="image/*" onChange={handleAvatarChange} className="hidden" />
                </div>

                {/* Name */}
                <div>
                  <label className="block text-xs font-semibold text-ig-secondary uppercase tracking-wide mb-1.5">Name</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    maxLength={60}
                    placeholder="Your name"
                    className="input-field"
                  />
                </div>

                {/* Email */}
                <div>
                  <label className="block text-xs font-semibold text-ig-secondary uppercase tracking-wide mb-1.5">Email</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="input-field"
                  />
                </div>
              </div>

              <div className="px-5 pb-5 flex gap-3">
                <button onClick={onClose} className="btn-outline flex-1" disabled={savingProfile}>Cancel</button>
                <button
                  onClick={handleSaveProfile}
                  disabled={savingProfile}
                  className="btn-primary flex-1 flex items-center justify-center gap-2"
                >
                  {savingProfile ? (
                    <><svg className="animate-spin w-4 h-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>Saving…</>
                  ) : "Save"}
                </button>
              </div>
            </>
          )}

          {/* ── Password Tab ─────────────────────────────────────────── */}
          {tab === "password" && (
            <>
              <div className="p-5 space-y-4">
                {[
                  { label: "Current password", value: oldPassword, set: setOldPassword, show: showOld, toggle: () => setShowOld((v) => !v) },
                  { label: "New password",     value: newPassword, set: setNewPassword, show: showNew, toggle: () => setShowNew((v) => !v) },
                  { label: "Confirm new password", value: confirmPwd, set: setConfirmPwd, show: showNew, toggle: () => setShowNew((v) => !v) },
                ].map(({ label, value, set, show, toggle }) => (
                  <div key={label}>
                    <label className="block text-xs font-semibold text-ig-secondary uppercase tracking-wide mb-1.5">{label}</label>
                    <div className="relative">
                      <input
                        type={show ? "text" : "password"}
                        value={value}
                        onChange={(e) => set(e.target.value)}
                        placeholder="••••••••"
                        className="input-field pr-10"
                      />
                      <button
                        type="button"
                        onClick={toggle}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-ig-secondary hover:text-ig-text"
                      >
                        {show ? (
                          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="w-4 h-4">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
                          </svg>
                        ) : (
                          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="w-4 h-4">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                        )}
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              <div className="px-5 pb-5 flex gap-3">
                <button onClick={onClose} className="btn-outline flex-1" disabled={savingPwd}>Cancel</button>
                <button
                  onClick={handleSavePassword}
                  disabled={savingPwd}
                  className="btn-primary flex-1 flex items-center justify-center gap-2"
                >
                  {savingPwd ? (
                    <><svg className="animate-spin w-4 h-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>Saving…</>
                  ) : "Change Password"}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
}

export default EditProfileModal;

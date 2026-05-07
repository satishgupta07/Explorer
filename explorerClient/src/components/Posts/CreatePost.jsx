import React, { useState, useCallback, useRef } from "react";
import conf from "../../config/conf";
import { useAuth } from "../../contexts/AuthContext";
import { useToast } from "../../contexts/ToastContext";
import { apiFetch } from "../../utils/apiFetch";
import { avatarUrl } from "../../utils/cloudinary";

/**
 * "What's on your mind?" bar + full-screen modal for post creation.
 *
 * Two-step upload flow:
 *  1. Image selected locally → shown as preview via FileReader.
 *  2. On "Share", image is uploaded to Cloudinary (direct, unsigned preset).
 *  3. Once Cloudinary returns a URL, POST title + URL to backend.
 *  4. Parent's onPostCreated() is called to refresh the feed.
 */
function CreatePost({ onPostCreated }) {
  const [open,       setOpen]       = useState(false);
  const [title,      setTitle]      = useState("");
  const [imageFile,  setImageFile]  = useState(null);   // raw File object
  const [imagePreview, setImagePreview] = useState(""); // base64 data URL for preview
  const [uploading,  setUploading]  = useState(false);
  const [dragOver,   setDragOver]   = useState(false);
  const fileInputRef = useRef(null);

  const { user, token } = useAuth();
  const { toast }       = useToast();
  const jwtToken        = token || localStorage.getItem("token");
  const _user           = user  || JSON.parse(localStorage.getItem("user") || "null");

  // ── File handling ─────────────────────────────────────────────────────────

  const handleFile = useCallback((file) => {
    if (!file || !file.type.startsWith("image/")) return;
    // The drop-zone copy advertises "up to 10MB"; enforce it here so the user
    // gets immediate feedback instead of a silent Cloudinary failure.
    if (file.size > 10 * 1024 * 1024) {
      toast.error("Image must be under 10 MB.");
      return;
    }
    setImageFile(file);
    const reader = new FileReader();
    reader.onload = (e) => setImagePreview(e.target.result);
    reader.readAsDataURL(file);
  }, [toast]);

  const handleFileInput = useCallback(
    (e) => handleFile(e.target.files[0]),
    [handleFile]
  );

  const handleDrop = useCallback(
    (e) => {
      e.preventDefault();
      setDragOver(false);
      handleFile(e.dataTransfer.files[0]);
    },
    [handleFile]
  );

  // ── Reset & close ─────────────────────────────────────────────────────────

  const reset = useCallback(() => {
    setTitle("");
    setImageFile(null);
    setImagePreview("");
    setUploading(false);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }, []);

  const close = useCallback(() => {
    reset();
    setOpen(false);
  }, [reset]);

  // ── Submit ────────────────────────────────────────────────────────────────

  const handleSubmit = useCallback(async () => {
    if (!title.trim() || !imageFile || uploading) return;

    setUploading(true);
    try {
      // Step 1: Upload image to Cloudinary.
      const form = new FormData();
      form.append("file",           imageFile);
      form.append("upload_preset",  conf.cloudinaryUploadPreset);
      form.append("cloud_name",     conf.cloudName);
      form.append("folder",         "Posts");

      const cdnRes  = await fetch(
        `https://api.cloudinary.com/v1_1/${conf.cloudName}/image/upload`,
        { method: "POST", body: form }
      );
      const cdnData = await cdnRes.json();
      if (!cdnData.secure_url && !cdnData.url)
        throw new Error("Cloudinary upload failed");

      const imageUrl = cdnData.secure_url || cdnData.url;

      // Step 2: Save post to backend.
      const postRes = await apiFetch(`${conf.serverUrl}/posts/create-post`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization:  `Bearer ${jwtToken}`,
        },
        body: JSON.stringify({ title: title.trim(), image: imageUrl }),
      });
      if (!postRes.ok) throw new Error("Failed to create post");
      const postBody    = await postRes.json();
      const createdPost = postBody?.data?.createdPost ?? postBody?.createdPost;

      // Server returns a bare Post document; hydrate the engagement fields the
      // feed expects so the parent can prepend it without a full feed refetch.
      const newPost = {
        ...createdPost,
        postedBy:     { _id: _user._id, name: _user.name, avatar: _user.avatar },
        likeCount:    0,
        commentCount: 0,
        comments:     [],
        isLiked:      false,
      };

      close();
      onPostCreated?.(newPost);
    } catch (err) {
      console.error("Create post failed:", err);
      toast.error("Failed to share post. Please try again.");
    } finally {
      setUploading(false);
    }
  // conf is a module-level constant — not reactive, so excluded from deps.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [title, imageFile, uploading, jwtToken, _user, close, onPostCreated, toast]);

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <>
      {/* ── Trigger bar ────────────────────────────────────────────── */}
      <div
        className="card sm:rounded-lg mb-4 flex items-center gap-3 px-4 py-3 cursor-pointer hover:bg-gray-50 transition-colors"
        onClick={() => setOpen(true)}
        role="button"
        aria-label="Create post"
      >
        {_user && (
          <img
            src={avatarUrl(_user.avatar)}
            alt="You"
            className="w-9 h-9 rounded-full object-cover shrink-0"
          />
        )}
        <div className="flex-1 bg-ig-bg border border-ig-border rounded-full px-4 py-2 text-sm text-ig-secondary select-none">
          What's on your mind?
        </div>
        <div className="shrink-0 p-2 rounded-xl bg-ig-purple-light">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"
            className="w-5 h-5 text-ig-purple">
            <path fillRule="evenodd" d="M1.5 6a2.25 2.25 0 012.25-2.25h16.5A2.25 2.25 0 0122.5 6v12a2.25 2.25 0 01-2.25 2.25H3.75A2.25 2.25 0 011.5 18V6zM3 16.06V18c0 .414.336.75.75.75h16.5A.75.75 0 0021 18v-1.94l-2.69-2.689a1.5 1.5 0 00-2.12 0l-.88.879.97.97a.75.75 0 11-1.06 1.06l-5.16-5.159a1.5 1.5 0 00-2.12 0L3 16.061zm10.125-7.81a1.125 1.125 0 112.25 0 1.125 1.125 0 01-2.25 0z" clipRule="evenodd" />
          </svg>
        </div>
      </div>

      {/* ── Modal ──────────────────────────────────────────────────── */}
      {open && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm animate-fade-in"
            onClick={close}
          />

          {/* Dialog */}
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div
              className="bg-white rounded-2xl w-full max-w-lg shadow-2xl animate-slide-up"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal header */}
              <div className="flex items-center justify-between px-5 py-4 border-b border-ig-border">
                <h2 className="text-base font-semibold text-ig-text">Create new post</h2>
                <button
                  onClick={close}
                  className="p-1 rounded-full hover:bg-gray-100 transition-colors"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none"
                    stroke="currentColor" strokeWidth={2} className="w-5 h-5 text-ig-text">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Modal body */}
              <div className="p-5 space-y-4">
                {/* User info */}
                {_user && (
                  <div className="flex items-center gap-3">
                    <img src={avatarUrl(_user.avatar)} alt="You" className="w-9 h-9 rounded-full object-cover" />
                    <span className="font-semibold text-sm text-ig-text">{_user.name}</span>
                  </div>
                )}

                {/* Caption textarea */}
                <textarea
                  rows={3}
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Write a caption…"
                  maxLength={500}
                  className="w-full text-sm text-ig-text placeholder-ig-secondary bg-transparent resize-none outline-none border-b border-ig-border pb-2 leading-relaxed"
                />
                <div className="text-right text-xs text-ig-secondary -mt-2">{title.length}/500</div>

                {/* Image drop zone */}
                <div
                  onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                  onDragLeave={() => setDragOver(false)}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                  className={`relative flex items-center justify-center h-48 rounded-xl border-2 border-dashed transition-all cursor-pointer overflow-hidden ${
                    dragOver
                      ? "border-ig-purple bg-ig-purple-light"
                      : "border-ig-border hover:border-ig-purple hover:bg-ig-purple-light/30"
                  }`}
                >
                  {imagePreview ? (
                    <>
                      <img
                        src={imagePreview}
                        alt="Preview"
                        className="w-full h-full object-cover rounded-xl"
                      />
                      <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity rounded-xl">
                        <span className="text-white text-sm font-medium">Change photo</span>
                      </div>
                    </>
                  ) : (
                    <div className="text-center px-4">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 mx-auto text-ig-secondary mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
                      </svg>
                      <p className="text-sm font-medium text-ig-secondary">
                        Drag & drop or <span className="text-ig-purple">browse</span>
                      </p>
                      <p className="text-xs text-ig-secondary mt-1">PNG, JPG, GIF up to 10MB</p>
                    </div>
                  )}

                  {/* Hidden file input */}
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileInput}
                    className="hidden"
                  />
                </div>
              </div>

              {/* Modal footer */}
              <div className="px-5 pb-5">
                <button
                  onClick={handleSubmit}
                  disabled={!title.trim() || !imageFile || uploading}
                  className="btn-primary flex items-center justify-center gap-2"
                >
                  {uploading ? (
                    <>
                      <svg className="animate-spin w-4 h-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                      Sharing…
                    </>
                  ) : (
                    "Share"
                  )}
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
}

export default CreatePost;

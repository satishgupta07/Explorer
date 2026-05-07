import React, { useState, useCallback, memo } from "react";
import moment from "moment/moment";
import { useAuth } from "../../contexts/AuthContext";
import { useToast } from "../../contexts/ToastContext";
import Comment from "./Comment";
import { usePost } from "../../contexts/PostContext";
import { useNavigate } from "react-router-dom";
import conf from "../../config/conf";
import { useIntersectionObserver } from "../../hooks/useIntersectionObserver";
import { apiFetch } from "../../utils/apiFetch";
import { postImageUrl, avatarUrl } from "../../utils/cloudinary";

/**
 * Instagram-inspired post card.
 *
 * Optimisations applied:
 *  - React.memo — skips re-render when parent re-renders with same props
 *  - useCallback — stable handler references prevent child re-renders
 *  - useIntersectionObserver — image only loads when card enters viewport
 *  - Optimistic like toggle — UI responds instantly, server confirms async
 *  - Optimistic comment add & delete — immediate feedback with rollback
 *  - apiFetch — silent JWT token refresh on 401
 *  - Cloudinary URL transforms — serves compressed/resized images
 */
const PostCard = memo(function PostCard({ post }) {
  const [isLiked,       setIsLiked]       = useState(post.isLiked);
  const [likeCount,     setLikeCount]     = useState(post.likeCount);
  const [showComments,  setShowComments]  = useState(false);
  const [textComment,   setTextComment]   = useState("");
  const [isSubmitting,  setIsSubmitting]  = useState(false);
  const [heartAnim,     setHeartAnim]     = useState(false);
  const [comments,      setComments]      = useState(post.comments ?? []);

  const { token, user }     = useAuth();
  const { toast }           = useToast();
  const jwtToken = token || localStorage.getItem("token");
  const _user    = user  || JSON.parse(localStorage.getItem("user") || "null");
  const { setPosts } = usePost();
  const navigate = useNavigate();

  const isOwner = _user?._id === post.postedBy._id;

  // Lazy-load the post image when it enters the viewport.
  const [imageRef, imageVisible] = useIntersectionObserver({ threshold: 0.01, rootMargin: "200px" });

  // ── Like ──────────────────────────────────────────────────────────────────

  const handleLike = useCallback(async () => {
    const wasLiked = isLiked;
    setIsLiked(!wasLiked);
    setLikeCount((c) => wasLiked ? c - 1 : c + 1);
    setHeartAnim(true);
    setTimeout(() => setHeartAnim(false), 300);

    try {
      const res  = await apiFetch(`${conf.serverUrl}/posts/post/${post._id}`, {
        method:  "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${jwtToken}` },
      });
      const data = await res.json();
      setIsLiked(data.data.isLiked);
      setLikeCount((c) => {
        const expectedAfter = wasLiked ? post.likeCount - 1 : post.likeCount + 1;
        return data.data.isLiked !== wasLiked ? c : expectedAfter;
      });
    } catch {
      setIsLiked(wasLiked);
      setLikeCount((c) => wasLiked ? c + 1 : c - 1);
    }
  }, [isLiked, jwtToken, post._id, post.likeCount]);

  // ── Comment add ───────────────────────────────────────────────────────────

  const handleAddComment = useCallback(async (e) => {
    e.preventDefault();
    if (!textComment.trim() || isSubmitting) return;

    setIsSubmitting(true);
    const tempComment = {
      _id:       `temp-${Date.now()}`,
      content:   textComment.trim(),
      author:    { _id: _user._id, name: _user.name, avatar: _user.avatar },
      createdAt: new Date().toISOString(),
    };
    setComments((prev) => [...prev, tempComment]);
    setTextComment("");
    setShowComments(true);

    try {
      const res  = await apiFetch(`${conf.serverUrl}/comments/post/${post._id}`, {
        method:  "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${jwtToken}` },
        body:    JSON.stringify({ content: tempComment.content }),
      });
      const data = await res.json();
      if (data.data) {
        setComments((prev) => prev.map((c) =>
          c._id === tempComment._id
            ? { ...data.data, author: { _id: _user._id, name: _user.name, avatar: _user.avatar } }
            : c
        ));
      }
    } catch {
      setComments((prev) => prev.filter((c) => c._id !== tempComment._id));
      setTextComment(tempComment.content);
      toast.error("Could not post comment. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }, [textComment, isSubmitting, jwtToken, post._id, _user, toast]);

  // ── Comment delete (called by Comment child) ──────────────────────────────

  const handleCommentDelete = useCallback((commentId, restore) => {
    if (restore) {
      // Roll back: re-insert the comment in its original position.
      setComments((prev) => {
        const already = prev.find((c) => c._id === commentId);
        return already ? prev : [...prev, restore];
      });
    } else {
      setComments((prev) => prev.filter((c) => c._id !== commentId));
    }
  }, []);

  // ── Post delete ───────────────────────────────────────────────────────────

  const handleDelete = useCallback(async () => {
    if (!window.confirm("Delete this post?")) return;
    try {
      await apiFetch(`${conf.serverUrl}/posts/deletepost/${post._id}`, {
        method:  "DELETE",
        headers: { Authorization: `Bearer ${jwtToken}` },
      });
      setPosts((prev) => prev.filter((p) => p._id !== post._id));
      toast.success("Post deleted.");
    } catch {
      toast.error("Could not delete post. Please try again.");
    }
  }, [jwtToken, post._id, setPosts, toast]);

  const goToProfile = useCallback(() => {
    isOwner ? navigate("/profile") : navigate(`/profile/${post.postedBy._id}`);
  }, [isOwner, navigate, post.postedBy._id]);

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <article className="card sm:rounded-lg mb-4 animate-fade-in">

      {/* ── Header ───────────────────────────────────────────────────── */}
      <div className="flex items-center gap-3 px-3 py-3">
        <button onClick={goToProfile} className="shrink-0">
          <img
            src={avatarUrl(post.postedBy.avatar)}
            alt={post.postedBy.name}
            className="w-9 h-9 rounded-full object-cover"
          />
        </button>

        <div className="flex-1 min-w-0">
          <button
            onClick={goToProfile}
            className="text-sm font-semibold text-ig-text hover:underline block truncate"
          >
            {post.postedBy.name}
          </button>
          <p className="text-xs text-ig-secondary">{moment(post.createdAt).fromNow()}</p>
        </div>

        {post.title && (
          <p className="hidden sm:block text-sm text-ig-secondary truncate max-w-[160px]">
            {post.title}
          </p>
        )}

        {isOwner && (
          <button
            onClick={handleDelete}
            title="Delete post"
            className="shrink-0 p-1.5 rounded-full hover:bg-red-50 text-ig-secondary hover:text-ig-red transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" strokeWidth={1.8} className="w-4 h-4">
              <path strokeLinecap="round" strokeLinejoin="round"
                d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
            </svg>
          </button>
        )}
      </div>

      {/* ── Post Image ───────────────────────────────────────────────── */}
      <div ref={imageRef} className="w-full bg-gray-50">
        {imageVisible ? (
          <img
            src={postImageUrl(post.image)}
            alt="Post"
            className="post-image"
            loading="lazy"
            onDoubleClick={handleLike}
          />
        ) : (
          <div className="skeleton w-full h-72" />
        )}
      </div>

      {/* Caption on mobile (below image) */}
      {post.title && (
        <div className="sm:hidden px-3 pt-2 pb-1">
          <span className="text-sm font-semibold text-ig-text">{post.postedBy.name} </span>
          <span className="text-sm text-ig-text">{post.title}</span>
        </div>
      )}

      {/* ── Action Row ───────────────────────────────────────────────── */}
      <div className="flex items-center gap-3 px-3 pt-3 pb-1">
        <button onClick={handleLike} className="group outline-none" aria-label={isLiked ? "Unlike" : "Like"}>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill={isLiked ? "currentColor" : "none"}
            stroke="currentColor"
            strokeWidth={isLiked ? 0 : 1.8}
            className={`w-6 h-6 transition-all ${
              isLiked ? "text-ig-red" : "text-ig-text hover:text-ig-secondary"
            } ${heartAnim ? "animate-heart-pop" : ""}`}
          >
            <path strokeLinecap="round" strokeLinejoin="round"
              d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
          </svg>
        </button>

        <button
          onClick={() => setShowComments((v) => !v)}
          aria-label="Toggle comments"
          className="outline-none"
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" strokeWidth={1.8}
            className="w-6 h-6 text-ig-text hover:text-ig-secondary transition-colors">
            <path strokeLinecap="round" strokeLinejoin="round"
              d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a5.969 5.969 0 01-.474-.065 4.48 4.48 0 00.978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z" />
          </svg>
        </button>
      </div>

      {/* Like count */}
      <div className="px-3 pb-1">
        <span className="text-sm font-semibold text-ig-text">
          {likeCount} {likeCount === 1 ? "like" : "likes"}
        </span>
      </div>

      {/* Caption (desktop) */}
      {post.title && (
        <div className="hidden sm:block px-3 pb-2">
          <span className="text-sm font-semibold text-ig-text">{post.postedBy.name} </span>
          <span className="text-sm text-ig-text">{post.title}</span>
        </div>
      )}

      {/* View/hide comments toggle */}
      {comments.length > 0 && (
        <button
          onClick={() => setShowComments((v) => !v)}
          className="px-3 pb-1 text-sm text-ig-secondary hover:text-ig-text transition-colors block"
        >
          {showComments
            ? "Hide comments"
            : `View all ${comments.length} comment${comments.length !== 1 ? "s" : ""}`}
        </button>
      )}

      {/* Comment list */}
      {showComments && comments.length > 0 && (
        <div className="px-3 pb-1 border-t border-ig-border/50 pt-1 animate-slide-up">
          {comments.map((c) => (
            <Comment key={c._id} comment={c} onDelete={handleCommentDelete} />
          ))}
        </div>
      )}

      {/* ── Add Comment ──────────────────────────────────────────────── */}
      <div className="border-t border-ig-border px-3 py-2 flex items-center gap-2">
        {_user && (
          <img
            src={avatarUrl(_user.avatar)}
            alt="You"
            className="w-7 h-7 rounded-full object-cover shrink-0"
          />
        )}
        <form onSubmit={handleAddComment} className="flex flex-1 items-center gap-2">
          <input
            type="text"
            value={textComment}
            onChange={(e) => setTextComment(e.target.value)}
            placeholder="Add a comment…"
            maxLength={300}
            className="flex-1 text-sm bg-transparent outline-none placeholder-ig-secondary py-1"
          />
          {textComment.trim() && (
            <button
              type="submit"
              disabled={isSubmitting}
              className="text-sm font-semibold text-ig-purple hover:text-ig-purple-dark disabled:opacity-50 transition-colors shrink-0"
            >
              {isSubmitting ? "…" : "Post"}
            </button>
          )}
        </form>
      </div>
    </article>
  );
});

export default PostCard;

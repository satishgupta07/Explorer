import React, { memo, useState, useCallback } from "react";
import moment from "moment";
import conf from "../../config/conf";
import { apiFetch } from "../../utils/apiFetch";
import { useAuth } from "../../contexts/AuthContext";
import { useToast } from "../../contexts/ToastContext";
import { avatarUrl } from "../../utils/cloudinary";

/**
 * Single comment row.
 *
 * - Memoised with React.memo so re-renders are skipped when siblings change.
 * - Shows a trash icon for the comment author — clicking it deletes the comment
 *   optimistically and fires DELETE /api/v1/comments/:id.
 */
const Comment = memo(function Comment({ comment, onDelete }) {
  const { user, token } = useAuth();
  const { toast }       = useToast();
  const jwtToken = token || localStorage.getItem("token");
  const _user    = user  || JSON.parse(localStorage.getItem("user") || "null");

  const [deleting, setDeleting] = useState(false);

  const isAuthor = _user?._id === comment.author?._id;

  const handleDelete = useCallback(async () => {
    if (deleting) return;
    setDeleting(true);
    // Optimistic removal — parent removes comment from list immediately.
    onDelete?.(comment._id);
    try {
      const res = await apiFetch(`${conf.serverUrl}/comments/${comment._id}`, {
        method:  "DELETE",
        headers: { Authorization: `Bearer ${jwtToken}` },
      });
      if (!res.ok) throw new Error("Delete failed");
    } catch (err) {
      // Roll back: re-add the comment by notifying parent with a special signal.
      onDelete?.(comment._id, comment); // second arg = restore
      toast.error("Could not delete comment. Please try again.");
      console.error("Comment delete error:", err);
    } finally {
      setDeleting(false);
    }
  }, [deleting, comment, jwtToken, onDelete, toast]);

  return (
    <div className="flex gap-3 py-2 animate-fade-in group">
      <img
        src={avatarUrl(comment.author.avatar)}
        alt={comment.author.name}
        className="w-7 h-7 rounded-full object-cover shrink-0 mt-0.5"
        loading="lazy"
      />
      <div className="flex-1 min-w-0">
        <div className="flex items-baseline gap-2 flex-wrap">
          <span className="text-sm font-semibold text-ig-text">
            {comment.author.name}
          </span>
          <span className="text-sm text-ig-text break-words">
            {comment.content}
          </span>
        </div>
        <p className="text-[11px] text-ig-secondary mt-0.5">
          {moment(comment.createdAt).fromNow()}
        </p>
      </div>

      {/* Delete button — only visible to the comment's author */}
      {isAuthor && (
        <button
          onClick={handleDelete}
          disabled={deleting}
          aria-label="Delete comment"
          className="shrink-0 self-start mt-1 p-1 rounded-full opacity-0 group-hover:opacity-100 hover:bg-red-50 text-ig-secondary hover:text-ig-red transition-all disabled:opacity-50"
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" strokeWidth={1.8} className="w-3.5 h-3.5">
            <path strokeLinecap="round" strokeLinejoin="round"
              d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
          </svg>
        </button>
      )}
    </div>
  );
});

export default Comment;

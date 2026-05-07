import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { useFollow } from "../../contexts/FollowContext";
import { SuggestedUserSkeleton } from "../Skeleton/SidebarSkeleton";
import conf from "../../config/conf";
import { avatarUrl } from "../../utils/cloudinary";
import { apiFetch } from "../../utils/apiFetch";

/**
 * Right sidebar widget — shows up to 5 users the current user isn't following.
 * Follow state is read from FollowContext so the button reflects reality on
 * mount and stays in sync with toggles made elsewhere (UserProfile, etc.).
 */
function SuggestedUsers() {
  const { token } = useAuth();
  const jwtToken = token || localStorage.getItem("token");
  const { isFollowing, toggleFollow } = useFollow();

  const [users,   setUsers]   = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!jwtToken) return;

    const controller = new AbortController();

    apiFetch(`${conf.serverUrl}/users/suggestions`, {
      headers: { Authorization: `Bearer ${jwtToken}` },
      signal: controller.signal,
    })
      .then((r) => r.json())
      .then((res) => {
        if (res.data) setUsers(res.data);
      })
      .catch((err) => {
        if (err.name !== "AbortError") console.error("Suggestions fetch failed:", err);
      })
      .finally(() => setLoading(false));

    return () => controller.abort();
  }, [jwtToken]);

  const handleFollow = (user) => {
    // Fire-and-forget — context handles optimistic update and rollback.
    toggleFollow(user).catch(() => {});
  };

  return (
    <div className="card-rounded p-4 animate-fade-in">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-ig-secondary">Suggested for you</h3>
        <button className="text-xs font-semibold text-ig-text hover:text-ig-secondary transition-colors">
          See All
        </button>
      </div>

      {loading ? (
        <div className="space-y-1">
          {[...Array(4)].map((_, i) => <SuggestedUserSkeleton key={i} />)}
        </div>
      ) : users.length === 0 ? (
        <p className="text-ig-secondary text-sm text-center py-4">
          No suggestions available.
        </p>
      ) : (
        <div className="space-y-1">
          {users.map((u) => {
            const isFollowed = isFollowing(u._id);
            return (
              <div key={u._id} className="flex items-center gap-3 py-2">
                <Link to={`/profile/${u._id}`} className="shrink-0">
                  <img
                    src={avatarUrl(u.avatar)}
                    alt={u.name}
                    className="w-9 h-9 rounded-full object-cover"
                  />
                </Link>
                <div className="flex-1 min-w-0">
                  <Link
                    to={`/profile/${u._id}`}
                    className="text-sm font-semibold text-ig-text hover:underline truncate block"
                  >
                    {u.name}
                  </Link>
                  <p className="text-xs text-ig-secondary">
                    {u.followers?.length ?? 0} followers
                  </p>
                </div>
                <button
                  onClick={() => handleFollow(u)}
                  className={`text-xs font-semibold px-3 py-1 rounded-lg border transition-colors ${
                    isFollowed
                      ? "border-ig-border text-ig-text hover:bg-gray-50"
                      : "border-ig-purple text-ig-purple hover:bg-ig-purple-light"
                  }`}
                >
                  {isFollowed ? "Unfollow" : "Follow"}
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default SuggestedUsers;

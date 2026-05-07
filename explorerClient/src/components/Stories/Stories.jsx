import React from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { useFollow } from "../../contexts/FollowContext";
import { avatarUrl } from "../../utils/cloudinary";

/**
 * Horizontal scrollable stories strip — Instagram-style gradient rings.
 *
 * Shows the logged-in user's avatar ("Your Story") followed by the real
 * avatars of people they follow. Reads the following list from FollowContext
 * so it stays in sync with follow toggles made in the sidebar or on profiles.
 */
function Stories() {
  const { user } = useAuth();
  const { followingUsers, isReady } = useFollow();
  const navigate = useNavigate();

  const _user     = user || JSON.parse(localStorage.getItem("user") || "null");
  const following = followingUsers;
  const loading   = !isReady;

  return (
    <div
      className="card sm:rounded-lg mb-4 px-4 py-3 flex gap-4 overflow-x-auto scrollbar-hide"
      style={{ scrollbarWidth: "none" }}
    >
      {/* Current user — "Your Story" */}
      {_user && (
        <button
          onClick={() => navigate("/profile")}
          className="flex flex-col items-center gap-1 shrink-0 group"
        >
          <div className="story-ring">
            <div className="bg-white rounded-full p-[2px]">
              <img
                src={avatarUrl(_user.avatar)}
                alt="Your story"
                className="w-14 h-14 rounded-full object-cover"
              />
            </div>
          </div>
          <span className="text-[11px] text-ig-secondary font-medium max-w-[60px] truncate">
            Your story
          </span>
        </button>
      )}

      {/* Loading skeletons */}
      {loading && (
        <>
          {[...Array(4)].map((_, i) => (
            <div key={i} className="flex flex-col items-center gap-1 shrink-0">
              <div className="skeleton w-[60px] h-[60px] rounded-full" />
              <div className="skeleton w-10 h-2 rounded mt-1" />
            </div>
          ))}
        </>
      )}

      {/* Followed users */}
      {!loading && following.map((u) => (
        <button
          key={u._id}
          onClick={() => navigate(`/profile/${u._id}`)}
          className="flex flex-col items-center gap-1 shrink-0"
        >
          <div className="story-ring">
            <div className="bg-white rounded-full p-[2px]">
              <img
                src={avatarUrl(u.avatar)}
                alt={u.name}
                className="w-14 h-14 rounded-full object-cover bg-gray-100"
              />
            </div>
          </div>
          <span className="text-[11px] text-ig-secondary font-medium max-w-[60px] truncate">
            {u.name}
          </span>
        </button>
      ))}

      {/* Empty state — user follows no one yet */}
      {!loading && following.length === 0 && (
        <p className="text-xs text-ig-secondary self-center pl-2">
          Follow people to see them here
        </p>
      )}
    </div>
  );
}

export default Stories;

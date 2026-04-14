import React, { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { apiFetch } from "../../utils/apiFetch";
import conf from "../../config/conf";
import { avatarUrl } from "../../utils/cloudinary";

/**
 * Horizontal scrollable stories strip — Instagram-style gradient rings.
 *
 * Shows the logged-in user's avatar ("Your Story") followed by the real
 * avatars of people they follow. Tapping a followed user navigates to their
 * profile. Falls back to a minimal skeleton while the following list loads.
 */
function Stories() {
  const { user, token } = useAuth();
  const navigate = useNavigate();
  const stripRef = useRef(null);

  const _user    = user  || JSON.parse(localStorage.getItem("user") || "null");
  const jwtToken = token || localStorage.getItem("token");

  const [following, setFollowing] = useState([]);
  const [loading,   setLoading]   = useState(true);

  useEffect(() => {
    if (!jwtToken) { setLoading(false); return; }
    let cancelled = false;

    apiFetch(`${conf.serverUrl}/users/following`, {
      headers: { Authorization: `Bearer ${jwtToken}` },
    })
      .then((r) => r.json())
      .then((data) => {
        if (!cancelled) setFollowing(data.data ?? []);
      })
      .catch(() => {})
      .finally(() => { if (!cancelled) setLoading(false); });

    return () => { cancelled = true; };
  }, [jwtToken]);

  return (
    <div
      ref={stripRef}
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

import React, { useState, useEffect, useCallback } from "react";
import { useParams } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import conf from "../config/conf";
import { avatarUrl, postImageUrl } from "../utils/cloudinary";
import { apiFetch } from "../utils/apiFetch";

/**
 * Another user's public profile — identical grid layout to ProfilePage
 * plus a Follow / Unfollow toggle button.
 */
function UserProfile() {
  const [profile,   setProfile]   = useState(null);
  const [isFollowing, setIsFollowing] = useState(false);
  const [followLoading, setFollowLoading] = useState(false);
  const [selected,  setSelected]  = useState(null);
  const { userid }                = useParams();
  const { token }                 = useAuth();
  const jwtToken                  = token || localStorage.getItem("token");

  const fetchProfile = useCallback(async (signal) => {
    try {
      const res  = await apiFetch(`${conf.serverUrl}/users/profile/${userid}`, {
        headers: { Authorization: `Bearer ${jwtToken}` },
        signal,
      });
      const data = await res.json();
      if (data.data) {
        setProfile(data.data);
        setIsFollowing(data.data.isUserInFollowers);
      }
    } catch (err) {
      if (err.name !== "AbortError") console.error("Profile fetch error:", err);
    }
  }, [userid, jwtToken]);

  useEffect(() => {
    const ctrl = new AbortController();
    fetchProfile(ctrl.signal);
    return () => ctrl.abort();
  }, [fetchProfile]);

  const handleFollow = useCallback(async () => {
    setFollowLoading(true);
    // Optimistic toggle
    setIsFollowing((v) => !v);
    try {
      await apiFetch(`${conf.serverUrl}/users/follow-user/${profile.user._id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${jwtToken}` },
      });
      // Refresh counts after follow action.
      fetchProfile(new AbortController().signal);
    } catch (err) {
      setIsFollowing((v) => !v); // roll back
      console.error("Follow/unfollow error:", err);
    } finally {
      setFollowLoading(false);
    }
  }, [profile, jwtToken, fetchProfile]);

  // ── Loading skeleton ──────────────────────────────────────────────────────

  if (!profile) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-8 animate-fade-in">
        <div className="flex items-center gap-8 sm:gap-16">
          <div className="skeleton w-24 h-24 sm:w-28 sm:h-28 rounded-full shrink-0" />
          <div className="flex-1 space-y-3">
            <div className="skeleton h-5 w-32 rounded-full" />
            <div className="flex gap-6">
              {[0,1,2].map(i => <div key={i} className="skeleton h-8 w-16 rounded" />)}
            </div>
          </div>
        </div>
        <div className="border-t border-ig-border mt-8" />
        <div className="profile-grid mt-1">
          {[...Array(9)].map((_, i) => <div key={i} className="skeleton aspect-square" />)}
        </div>
      </div>
    );
  }

  const { user, posts, followers, following } = profile;

  return (
    <div className="max-w-3xl mx-auto px-0 sm:px-4 pb-8 animate-fade-in">

      {/* ── Profile Header ─────────────────────────────────────────── */}
      <div className="flex items-center gap-8 sm:gap-16 px-4 sm:px-0 py-8">
        {/* Avatar */}
        <div className={isFollowing ? "story-ring shrink-0" : "shrink-0"}>
          <div className={isFollowing ? "bg-white rounded-full p-[3px]" : ""}>
            <img
              src={avatarUrl(user.avatar)}
              alt={user.name}
              className="w-20 h-20 sm:w-28 sm:h-28 rounded-full object-cover"
            />
          </div>
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center flex-wrap gap-3 mb-3">
            <h2 className="text-xl font-semibold text-ig-text">{user.name}</h2>
            <button
              onClick={handleFollow}
              disabled={followLoading}
              className={`px-5 py-1.5 rounded-lg text-sm font-semibold transition-all ${
                isFollowing
                  ? "border border-ig-border text-ig-text hover:bg-gray-50"
                  : "bg-ig-purple text-white hover:bg-ig-purple-dark"
              } disabled:opacity-60`}
            >
              {followLoading ? "…" : isFollowing ? "Following" : "Follow"}
            </button>
          </div>
          <div className="flex gap-6 sm:gap-10 text-ig-text">
            <div>
              <span className="font-semibold">{posts.length}</span>
              <span className="text-sm text-ig-secondary ml-1">posts</span>
            </div>
            <div>
              <span className="font-semibold">{followers.length}</span>
              <span className="text-sm text-ig-secondary ml-1">followers</span>
            </div>
            <div>
              <span className="font-semibold">{following.length}</span>
              <span className="text-sm text-ig-secondary ml-1">following</span>
            </div>
          </div>
        </div>
      </div>

      <div className="border-t border-ig-border" />

      {/* Tab bar */}
      <div className="flex justify-center">
        <button className="flex items-center gap-1.5 px-4 py-3 border-t-2 border-ig-text text-xs font-semibold text-ig-text tracking-wider uppercase">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" strokeWidth={2} className="w-3.5 h-3.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z" />
          </svg>
          Posts
        </button>
      </div>

      {/* ── Post Grid ──────────────────────────────────────────────── */}
      {posts.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-ig-border mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.774 48.774 0 00-5.232 0 2.192 2.192 0 00-1.736 1.039l-.821 1.316z" />
          </svg>
          <p className="font-semibold text-ig-text">No Posts Yet</p>
        </div>
      ) : (
        <div className="profile-grid mt-0.5">
          {posts.map((post) => (
            <button
              key={post._id}
              onClick={() => setSelected(post)}
              className="aspect-square overflow-hidden group relative bg-gray-100"
            >
              <img
                src={postImageUrl(post.image)}
                alt="Post"
                loading="lazy"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/25 transition-colors flex items-center justify-center">
                <span className="text-white font-semibold text-sm opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                    <path d="M11.645 20.91l-.007-.003-.022-.012a15.247 15.247 0 01-.383-.218 25.18 25.18 0 01-4.244-3.17C4.688 15.36 2.25 12.174 2.25 8.25 2.25 5.322 4.714 3 7.688 3A5.5 5.5 0 0112 5.052 5.5 5.5 0 0116.313 3c2.973 0 5.437 2.322 5.437 5.25 0 3.925-2.438 7.111-4.739 9.256a25.175 25.175 0 01-4.244 3.17 15.247 15.247 0 01-.383.219l-.022.012-.007.004-.003.001a.752.752 0 01-.704 0l-.003-.001z" />
                  </svg>
                  {post.likeCount}
                </span>
              </div>
            </button>
          ))}
        </div>
      )}

      {/* ── Post Detail Modal ───────────────────────────────────────── */}
      {selected && (
        <>
          <div className="fixed inset-0 z-50 bg-black/70 animate-fade-in" onClick={() => setSelected(null)} />
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl w-full max-w-sm shadow-2xl animate-slide-up overflow-hidden" onClick={(e) => e.stopPropagation()}>
              <img src={postImageUrl(selected.image)} alt="Post" className="w-full object-cover max-h-80" />
              <div className="p-4">
                <p className="text-sm">
                  <span className="font-semibold">{user.name} </span>
                  {selected.title}
                </p>
                <p className="text-xs text-ig-secondary mt-1">
                  {selected.likeCount} likes · {selected.commentCount} comments
                </p>
              </div>
              <div className="px-4 pb-4">
                <button onClick={() => setSelected(null)} className="btn-outline w-full">Close</button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default UserProfile;

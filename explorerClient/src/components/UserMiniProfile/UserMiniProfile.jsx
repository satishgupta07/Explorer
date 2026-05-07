import React from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { useFollow } from "../../contexts/FollowContext";
import { UserMiniProfileSkeleton } from "../Skeleton/SidebarSkeleton";
import { avatarUrl } from "../../utils/cloudinary";

/**
 * Left sidebar widget showing the logged-in user's avatar, name, and quick stats.
 * Following count is sourced from FollowContext so it updates instantly when
 * the user follows/unfollows someone elsewhere in the app.
 */
function UserMiniProfile() {
  const { user } = useAuth();
  const { followingCount } = useFollow();
  const _user = user || JSON.parse(localStorage.getItem("user") || "null");

  if (!_user) return <UserMiniProfileSkeleton />;

  const stats = [
    { label: "Posts",     value: "—" },
    { label: "Followers", value: _user.followers?.length ?? 0 },
    { label: "Following", value: followingCount },
  ];

  return (
    <div className="card-rounded p-4 animate-fade-in">
      {/* Avatar + name */}
      <div className="flex items-center gap-3">
        <div className="story-ring shrink-0">
          <div className="bg-white rounded-full p-[2px]">
            <img
              src={avatarUrl(_user.avatar)}
              alt={_user.name}
              className="w-12 h-12 rounded-full object-cover"
            />
          </div>
        </div>
        <div className="min-w-0">
          <p className="font-semibold text-ig-text text-sm truncate">{_user.name}</p>
          <p className="text-ig-secondary text-xs truncate">{_user.email}</p>
        </div>
      </div>

      {/* Divider */}
      <div className="border-t border-ig-border my-3" />

      {/* Stats row */}
      <div className="flex justify-around text-center">
        {stats.map(({ label, value }) => (
          <div key={label}>
            <p className="font-bold text-ig-text text-sm">{value}</p>
            <p className="text-ig-secondary text-xs">{label}</p>
          </div>
        ))}
      </div>

      {/* View profile link */}
      <Link
        to="/profile"
        className="mt-4 block w-full text-center py-1.5 rounded-lg border border-ig-border text-sm font-semibold text-ig-text hover:bg-gray-50 transition-colors"
      >
        View Profile
      </Link>

      {/* Footer links */}
      <div className="mt-4 flex flex-wrap gap-x-2 gap-y-1">
        {["About", "Help", "Privacy", "Terms"].map((item) => (
          <span key={item} className="text-ig-secondary text-[11px] cursor-pointer hover:underline">
            {item}
          </span>
        ))}
      </div>
      <p className="text-ig-secondary text-[11px] mt-1">© 2025 Explorer</p>
    </div>
  );
}

export default UserMiniProfile;

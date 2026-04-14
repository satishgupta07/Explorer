import React from "react";

/**
 * Shimmer skeleton for a single post card.
 * Mirrors the PostCard structure so the layout shift is minimal when real
 * content loads.
 */
function PostSkeleton() {
  return (
    <div className="card sm:rounded-lg mb-4 animate-fade-in">
      {/* Header */}
      <div className="flex items-center gap-3 p-3">
        <div className="skeleton w-9 h-9 rounded-full shrink-0" />
        <div className="flex-1 space-y-1.5">
          <div className="skeleton h-3 w-28 rounded-full" />
          <div className="skeleton h-2.5 w-16 rounded-full" />
        </div>
      </div>

      {/* Image */}
      <div className="skeleton w-full h-72" style={{ borderRadius: 0 }} />

      {/* Actions */}
      <div className="flex gap-4 px-3 pt-3 pb-2">
        <div className="skeleton w-6 h-6 rounded" />
        <div className="skeleton w-6 h-6 rounded" />
      </div>

      {/* Text lines */}
      <div className="px-3 pb-4 space-y-2">
        <div className="skeleton h-3 w-20 rounded-full" />
        <div className="skeleton h-3 w-full rounded-full" />
        <div className="skeleton h-3 w-3/4 rounded-full" />
        <div className="skeleton h-2.5 w-24 rounded-full mt-1" />
      </div>
    </div>
  );
}

export default PostSkeleton;

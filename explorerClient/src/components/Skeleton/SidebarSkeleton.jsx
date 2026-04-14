import React from "react";

/**
 * Skeleton for the UserMiniProfile left sidebar while the user data loads.
 */
export function UserMiniProfileSkeleton() {
  return (
    <div className="card-rounded p-4 animate-fade-in">
      <div className="flex items-center gap-3">
        <div className="skeleton w-14 h-14 rounded-full shrink-0" />
        <div className="flex-1 space-y-2">
          <div className="skeleton h-3.5 w-28 rounded-full" />
          <div className="skeleton h-2.5 w-20 rounded-full" />
        </div>
      </div>
      <div className="flex justify-around mt-5">
        {[0, 1, 2].map((i) => (
          <div key={i} className="flex flex-col items-center gap-1.5">
            <div className="skeleton h-4 w-10 rounded-full" />
            <div className="skeleton h-2.5 w-14 rounded-full" />
          </div>
        ))}
      </div>
    </div>
  );
}

/**
 * Skeleton for a single suggested-user row.
 */
export function SuggestedUserSkeleton() {
  return (
    <div className="flex items-center gap-3 py-2 animate-fade-in">
      <div className="skeleton w-9 h-9 rounded-full shrink-0" />
      <div className="flex-1 space-y-1.5">
        <div className="skeleton h-3 w-24 rounded-full" />
        <div className="skeleton h-2.5 w-16 rounded-full" />
      </div>
      <div className="skeleton h-6 w-14 rounded-lg" />
    </div>
  );
}

import React from "react";
import Posts from "../components/Posts/Posts";
import UserMiniProfile from "../components/UserMiniProfile/UserMiniProfile";
import SuggestedUsers from "../components/SuggestedUsers/SuggestedUsers";

/**
 * Main feed — three-column layout on desktop, single column on mobile.
 *
 * Desktop (md+):
 *   [UserMiniProfile 3/12] | [Posts feed 5/12] | [SuggestedUsers 4/12]
 *
 * Mobile:
 *   Sidebars are hidden; Posts fill full width.
 *   BottomNav (in App.jsx) provides access to Profile.
 */
function Home() {
  return (
    <div className="max-w-5xl mx-auto px-3 sm:px-4 py-4 feed-area">
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">

        {/* Left sidebar — hidden on mobile */}
        <aside className="hidden md:block md:col-span-3 space-y-4">
          <div className="sticky top-20">
            <UserMiniProfile />
          </div>
        </aside>

        {/* Center — feed (widened from 5 → 6 columns) */}
        <main className="md:col-span-6 min-w-0">
          <Posts />
        </main>

        {/* Right sidebar — hidden on mobile (narrowed from 4 → 3 columns) */}
        <aside className="hidden md:block md:col-span-3 space-y-4">
          <div className="sticky top-20">
            <SuggestedUsers />
          </div>
        </aside>

      </div>
    </div>
  );
}

export default Home;

import React, { useEffect, useState, useCallback, useRef } from "react";
import CreatePost from "./CreatePost";
import { useAuth } from "../../contexts/AuthContext";
import PostCard from "./PostCard";
import { usePost } from "../../contexts/PostContext";
import conf from "../../config/conf";
import PostSkeleton from "../Skeleton/PostSkeleton";
import Stories from "../Stories/Stories";
import ErrorBoundary from "../ErrorBoundary";
import { apiFetch } from "../../utils/apiFetch";

const PAGE_SIZE     = 10;
const SKELETON_COUNT = 3;

/**
 * Feed component with infinite scroll pagination.
 *
 * Optimisations:
 *  - Pages are fetched lazily as the sentinel div enters the viewport.
 *  - AbortController cancels in-flight requests on unmount.
 *  - Skeleton placeholders on initial load and on "load more".
 *  - apiFetch handles silent JWT token refresh on 401s.
 */
function Posts() {
  const [loading,       setLoading]       = useState(true);  // initial page
  const [loadingMore,   setLoadingMore]   = useState(false); // subsequent pages
  const [error,         setError]         = useState(null);
  const [page,          setPage]          = useState(1);
  const [hasMore,       setHasMore]       = useState(true);

  const { token }           = useAuth();
  const jwtToken            = token || localStorage.getItem("token");
  const { posts, setPosts } = usePost();

  // Sentinel ref — when this div enters the viewport we load the next page.
  const sentinelRef = useRef(null);

  // ── Fetch a single page ───────────────────────────────────────────────────

  const fetchPage = useCallback(async (pageNum, signal, isFirstPage = false) => {
    isFirstPage ? setLoading(true) : setLoadingMore(true);
    setError(null);
    try {
      const res  = await apiFetch(
        `${conf.serverUrl}/posts/?page=${pageNum}&limit=${PAGE_SIZE}`,
        { headers: { Authorization: `Bearer ${jwtToken}` }, signal }
      );
      if (!res.ok) throw new Error(`Failed to load posts (${res.status})`);
      const data = await res.json();
      const newPosts = data.posts ?? [];

      setPosts((prev) => (isFirstPage ? newPosts : [...prev, ...newPosts]));
      setHasMore(data.hasMore ?? false);
      setPage(pageNum);
    } catch (err) {
      if (err.name !== "AbortError") {
        setError(err.message);
        console.error("Feed fetch error:", err);
      }
    } finally {
      isFirstPage ? setLoading(false) : setLoadingMore(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [jwtToken]);

  // Initial load
  useEffect(() => {
    const ctrl = new AbortController();
    fetchPage(1, ctrl.signal, true);
    return () => ctrl.abort();
  }, [fetchPage]);

  // ── Infinite scroll sentinel ──────────────────────────────────────────────

  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !loadingMore && !loading) {
          fetchPage(page + 1, new AbortController().signal, false);
        }
      },
      { rootMargin: "300px" } // start loading 300px before reaching the bottom
    );

    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [hasMore, loadingMore, loading, page, fetchPage]);

  // Exposed to CreatePost so a fresh post appears at the top immediately.
  // We prepend rather than refetching page 1 so the user's scroll position
  // and any subsequent pages they've already loaded are preserved.
  const handlePostCreated = useCallback((newPost) => {
    if (!newPost) return;
    setPosts((prev) =>
      prev.some((p) => p._id === newPost._id) ? prev : [newPost, ...prev]
    );
  }, [setPosts]);

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <div className="feed-area">
      {/* Stories strip */}
      <Stories />

      {/* Create post bar */}
      <CreatePost onPostCreated={handlePostCreated} />

      {/* Error state */}
      {error && (
        <div className="card sm:rounded-lg p-6 text-center mb-4 animate-fade-in">
          <p className="text-ig-secondary text-sm mb-3">{error}</p>
          <button
            onClick={() => fetchPage(1, new AbortController().signal, true)}
            className="btn-outline"
          >
            Retry
          </button>
        </div>
      )}

      {/* Initial skeleton */}
      {loading && (
        <>
          {[...Array(SKELETON_COUNT)].map((_, i) => (
            <PostSkeleton key={i} />
          ))}
        </>
      )}

      {/* Post list */}
      {!loading && !error && (
        <ErrorBoundary>
          {posts.length === 0 ? (
            <div className="card sm:rounded-lg p-12 text-center animate-fade-in">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto text-ig-border mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                  d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
              </svg>
              <p className="text-ig-secondary text-sm">No posts yet. Be the first!</p>
            </div>
          ) : (
            <>
              {posts.map((post) => <PostCard key={post._id} post={post} />)}

              {/* Load-more skeleton */}
              {loadingMore && (
                <>
                  {[...Array(2)].map((_, i) => (
                    <PostSkeleton key={`more-${i}`} />
                  ))}
                </>
              )}

              {/* Sentinel — observed by IntersectionObserver to trigger next page */}
              {hasMore && <div ref={sentinelRef} className="h-4" aria-hidden />}

              {/* End-of-feed message */}
              {!hasMore && posts.length > 0 && (
                <p className="text-center text-ig-secondary text-sm py-8">
                  You're all caught up!
                </p>
              )}
            </>
          )}
        </ErrorBoundary>
      )}
    </div>
  );
}

export default Posts;

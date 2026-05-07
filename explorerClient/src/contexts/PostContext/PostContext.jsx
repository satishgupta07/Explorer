import { createContext, useContext, useMemo, useState } from "react";

// Global posts state shared between the feed (Posts) and the post card actions
// (like, delete) so both can update the same array without prop drilling.
export const PostContext = createContext({
  posts: [],
  setPosts: () => {},
});

// Convenience hook for consuming PostContext.
export function usePost() {
  return useContext(PostContext);
}

export function PostProvider({ children }) {
  const [posts, setPosts] = useState([]);

  // Memoise so consumers only re-render when `posts` actually changes,
  // not on every parent render (setPosts from useState is already stable).
  const value = useMemo(() => ({ posts, setPosts }), [posts]);

  return <PostContext.Provider value={value}>{children}</PostContext.Provider>;
}

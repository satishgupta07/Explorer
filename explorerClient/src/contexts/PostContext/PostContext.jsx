import { createContext, useContext, useState } from "react";

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

  const value = {
    posts,
    setPosts,
  };

  return <PostContext.Provider value={value}>{children}</PostContext.Provider>;
}

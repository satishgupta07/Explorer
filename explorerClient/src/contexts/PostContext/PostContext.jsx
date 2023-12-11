import { createContext, useContext, useState } from "react";

export const PostContext = createContext({
  posts: [],
  setPosts: () => {},
});

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

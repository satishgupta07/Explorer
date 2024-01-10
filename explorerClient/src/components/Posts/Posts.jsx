import React, { useEffect } from "react";
import CreatePost from "./CreatePost";
import { useAuth } from "../../contexts/AuthContext";
import PostCard from "./PostCard";
import { usePost } from "../../contexts/PostContext";

function Posts() {
  const { token, user } = useAuth();
  const jwtToken = token || localStorage.getItem("token");
  const { posts, setPosts } = usePost();

  useEffect(() => {
    console.log(user);
    console.log(token);
    console.log(jwtToken);
    const fetchPosts = async () => {
      try {
        const response = await fetch("http://localhost:3333/api/v1/posts/", {
          headers: {
            Authorization: "Bearer " + jwtToken,
          },
        });
        if (response.ok) {
          const result = await response.json();
          setPosts(result.posts);
        } else {
          // Handle error scenarios
          console.error("Error fetching posts:", response.statusText);
        }
      } catch (error) {
        // Handle fetch error
        console.error("Error fetching posts:", error);
      }
    };
    fetchPosts();
  }, [jwtToken, setPosts]);

  return (
    <div className="home">
      <CreatePost />
      {posts.map((item) => (
        <PostCard key={item._id} post={item} />
      ))}
    </div>
  );
}

export default Posts;

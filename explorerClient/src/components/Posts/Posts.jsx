import React, { useEffect, useState } from "react";
import CreatePost from "./CreatePost";
import { useAuth } from "../../contexts/AuthContext";
import PostCard from "./PostCard";
import { usePost } from "../../contexts/PostContext";
import conf from "../../config/conf";
import Loader from "../Loader";

function Posts() {
  const [loading, setLoading] = useState(true);
  const { token, user } = useAuth();
  const jwtToken = token || localStorage.getItem("token");
  const { posts, setPosts } = usePost();

  useEffect(() => {
    setLoading(true);
    const fetchPosts = async () => {
      try {
        const response = await fetch(`${conf.serverUrl}/posts/`, {
          headers: {
            Authorization: "Bearer " + jwtToken,
          },
        });
        if (response.ok) {
          const result = await response.json();
          console.log(result);
          setPosts(result.posts);
          setLoading(false);
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
      {loading ? (
        <Loader />
      ) : (
        <>
          {posts.map((item) => (
            <PostCard key={item._id} post={item} />
          ))}
        </>
      )}
    </div>
  );
}

export default Posts;

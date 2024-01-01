import React, { useEffect, useState } from "react";
import CreatePost from "./CreatePost";
import { useAuth } from "../../contexts/AuthContext";
import PostCard from "./PostCard";
import { usePost } from "../../contexts/PostContext";

function Posts() {
  // const [post, setPost] = useState([]);
  const { token } = useAuth();
  const jwtToken = token || localStorage.getItem("token");
  const {posts, setPosts} = usePost();

  useEffect(() => {
    fetch("https://explorer-server.onrender.com/api/v1/posts/", {
      headers: {
        Authorization: "Bearer " + jwtToken,
      },
    })
      .then((res) => res.json())
      .then((result) => {
        setPosts(result.posts);
      });
  }, []);

  return (
    <div className="home">
      <CreatePost />
      {posts.map((item) => {
        return (
          <PostCard key={item._id} post={item}/>
        );
      })}
    </div>
  );
}

export default Posts;

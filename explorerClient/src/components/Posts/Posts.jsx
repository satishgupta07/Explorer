import React, { useEffect, useState } from "react";
import CreatePost from "./CreatePost";
import { useAuth } from "../../contexts";
import PostCard from "./PostCard";

function Posts() {
  const [post, setPost] = useState([]);
  const { token } = useAuth();
  const jwtToken = token || localStorage.getItem("token");

  useEffect(() => {
    fetch("http://localhost:3333/api/v1/posts/", {
      headers: {
        Authorization: "Bearer " + jwtToken,
      },
    })
      .then((res) => res.json())
      .then((result) => {
        setPost(result.posts);
      });
  }, []);

  return (
    <div className="home">
      <CreatePost />
      {post.map((item) => {
        return (
          <PostCard key={item._id} post={item}/>
        );
      })}
    </div>
  );
}

export default Posts;

import React, { useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import { useState } from "react";
import PostCard from "../components/Posts/PostCard";

function ProfilePage() {
  const [post, setPost] = useState([]);
  const { token, user } = useAuth();
  const jwtToken = token || localStorage.getItem("token");
  const _user = user || localStorage.getItem("user");

  useEffect(() => {
    fetch("http://localhost:3333/api/v1/posts/myposts", {
      headers: {
        Authorization: "Bearer " + jwtToken,
      },
    })
      .then((res) => res.json())
      .then((result) => {
        console.log(result);
        setPost(result.posts);
      });
  }, []);

  return (
    <div style={{ maxWidth: "550px", margin: "0px auto" }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-around",
          margin: "18px 0px",
          borderBottom: "1px solid grey",
        }}
      >
        <div>
          <img
            style={{ width: "160px", height: "160px", borderRadius: "80px" }}
            src="https://images.unsplash.com/photo-1555952517-2e8e729e0b44?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=500&q=60"
          />
        </div>
        <div>
          <h4>{_user.name}</h4>
          <div
            style={{
              display: "flex",
              justifyContent: "space-around",
              width: "108%",
            }}
          >
            <h6>40 posts</h6>
            <h6>40 followers</h6>
            <h6>40 following</h6>
          </div>
        </div>
      </div>

      <div className="gallery">
        {post.map((item) => {
          return <PostCard key={item._id} post={item} />;
        })}
      </div>
    </div>
  );
}

export default ProfilePage;

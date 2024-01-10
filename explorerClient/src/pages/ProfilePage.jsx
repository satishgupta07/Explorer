import React, { useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import { useState } from "react";
import PostCard from "../components/Posts/PostCard";

function ProfilePage() {
  const [posts, setPosts] = useState([]);
  const { token, user } = useAuth();
  const jwtToken = token || localStorage.getItem("token");
  const _user = user || JSON.parse(localStorage.getItem("user"));

  useEffect(() => {
    // Check if both token and user are available
    if (jwtToken && _user) {
      fetch("http://localhost:3333/api/v1/posts/myposts", {
        headers: {
          Authorization: "Bearer " + jwtToken,
        },
      })
        .then((res) => res.json())
        .then((result) => {
          console.log(result);
          setPosts(result.posts);
        })
        .catch((error) => {
          console.error("Error fetching posts:", error);
        });
    }
  }, [jwtToken, _user]);

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
            src={_user.avatar}
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
            <h6>{posts.length} posts</h6>
            <h6>{_user.followers.length} followers</h6>
            <h6>{_user.following.length} following</h6>
          </div>
        </div>
      </div>

      <div className="gallery">
        {posts.map((item) => {
          return <PostCard key={item._id} post={item} />;
        })}
      </div>
    </div>
  );
}

export default ProfilePage;

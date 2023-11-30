import React, { useEffect } from "react";
import { myPosts } from "../services/post";
import { useAuth } from "../contexts";
import { useState } from "react";

function ProfilePage() {
  const [post, setPost] = useState([]);
  const { token, user } = useAuth();
  const jwtToken = token || localStorage.getItem("token");

  useEffect(() => {
    fetch("http://localhost:3333/api/v1/posts/myposts", {
      headers: {
        Authorization: "Bearer " + jwtToken,
      },
    })
      .then((res) => res.json())
      .then((result) => {
        console.log(result);
        console.log(user);
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
          <h4>{user.name}</h4>
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
          return (
            <img
              key={item._id}
              className="item"
              src={item.image}
              alt={item.title}
            />
          );
        })}
      </div>
    </div>
  );
}

export default ProfilePage;

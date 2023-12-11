import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import PostCard from "../components/Posts/PostCard";

function UserProfile() {
  const [profile, setProfile] = useState(null);
  const { userid } = useParams();
  const { token } = useAuth();
  const jwtToken = token || localStorage.getItem("token");

  useEffect(() => {
    fetch(`http://localhost:3333/api/v1/users/profile/${userid}`, {
      headers: {
        Authorization: "Bearer " + jwtToken,
      },
    })
      .then((res) => res.json())
      .then((result) => {
        console.log(result);
        setProfile(result.data);
      });
  }, []);

  return (
    <>
      {profile ? (
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
                style={{
                  width: "160px",
                  height: "160px",
                  borderRadius: "80px",
                }}
                src="https://images.unsplash.com/photo-1555952517-2e8e729e0b44?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=500&q=60"
              />
            </div>
            <div>
              <h4>{profile.user.name}</h4>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-around",
                  width: "108%",
                }}
              >
                <h6>{profile.posts.length} posts</h6>
                <h6>40 followers</h6>
                <h6>40 following</h6>
              </div>
            </div>
          </div>

          <div className="gallery">
            {profile.posts.map((item) => {
              return <PostCard key={item._id} post={item} />;
            })}
          </div>
        </div>
      ) : (
        <h2>Loading...!</h2>
      )}
    </>
  );
}

export default UserProfile;

import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import PostCard from "../components/Posts/PostCard";

function UserProfile() {
  const [profile, setProfile] = useState(null);
  const [followButton, setFollowButton] = useState("Follow");
  const { userid } = useParams();
  const { token } = useAuth();
  const jwtToken = token || localStorage.getItem("token");

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = () => {
    fetch(`https://explorer-server.onrender.com/api/v1/users/profile/${userid}`, {
      headers: {
        Authorization: "Bearer " + jwtToken,
      },
    })
      .then((res) => res.json())
      .then((result) => {
        console.log(result.data);
        setProfile(result.data);
        if (result.data.isUserInFollowers) {
          setFollowButton("Unfollow");
        } else {
          setFollowButton("Follow");
        }
      });
  };

  const handleFollow = async (userId) => {
    try {
      const response = await fetch(
        `https://explorer-server.onrender.com/api/v1/users/follow-user/${userId}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: "Bearer " + jwtToken,
          },
        }
      );

      if (!response.ok) {
        throw new Error(
          `Failed to follow/unfollow user: ${response.statusText}`
        );
      }

      const data = await response.json();
      if (data) {
        if (data.message == "Unfollowed successfully") {
          setFollowButton("Follow");
        } else {
          setFollowButton("Unfollow");
        }
        fetchProfile();
      }
    } catch (error) {
      console.error("Error while follow/unfollow user:", error);
    }
  };

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
                <h6>{profile.followers.length} followers</h6>
                <h6>{profile.following.length} following</h6>
              </div>
              <button
                className="mt-10 text-white bg-blue-700 hover:bg-blue-800 focus:outline-none focus:ring-4 focus:ring-blue-300 font-medium rounded-full text-sm px-5 py-2.5 text-center me-2 mb-2"
                onClick={() => handleFollow(profile.user._id)}
              >
                {followButton}
              </button>
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

import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import PostCard from "../components/Posts/PostCard";
import conf from "../config/conf";

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
    fetch(`${conf.serverUrl}/users/profile/${userid}`, {
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
        `${conf.serverUrl}/users/follow-user/${userId}`,
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
                src={profile.user.avatar}
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

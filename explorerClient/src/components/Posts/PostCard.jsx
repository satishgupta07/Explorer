import React, { useState } from "react";
import moment from "moment/moment";
import { useAuth } from "../../contexts/AuthContext";
import Comment from "./Comment";
import { usePost } from "../../contexts/PostContext";
import { useNavigate } from "react-router-dom";

function PostCard({ post }) {
  const [isLiked, setIsLiked] = useState(post.isLiked);
  const [likeCount, setLikeCount] = useState(post.likeCount);
  const [commentCount, setCommentCount] = useState(post.commentCount);
  const [showComment, setShowComment] = useState(false);
  const [textComment, setTextComment] = useState("");
  const { token, user } = useAuth();
  const jwtToken = token || localStorage.getItem("token");
  const _user = user || localStorage.getItem("user");
  const { posts, setPosts } = usePost();
  const navigate = useNavigate();

  const handleLike = async (_id) => {
    try {
      const response = await fetch(
        `http://localhost:3333/api/v1/posts/post/${_id}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: "Bearer " + jwtToken,
          },
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to like/dislike post: ${response.statusText}`);
      }

      const data = await response.json();
      if (data) {
        setIsLiked(data.data.isLiked);
        setLikeCount((prevCount) =>
          data.data.isLiked ? prevCount + 1 : prevCount - 1
        );
      }
    } catch (error) {
      console.error("Error liking/disliking post:", error);
    }
  };

  const addComment = async (_id) => {
    if (!textComment) {
      return;
    }
    try {
      const response = await fetch(
        `http://localhost:3333/api/v1/comments/post/${_id}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: "Bearer " + jwtToken,
          },
          body: JSON.stringify({ content: textComment }),
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to comment on post: ${response.statusText}`);
      }

      const data = await response.json();
      if (data) {
        console.log(data);
        setShowComment(true);
        setTextComment("");
      }
    } catch (error) {
      console.error("Error while commenting on post:", error);
    }
  };

  const deletePost = (postId) => {
    console.log(postId);
    fetch(`http://localhost:3333/api/v1/posts/deletepost/${postId}`, {
      method: "delete",
      headers: {
        Authorization: "Bearer " + jwtToken,
      },
    })
      .then((res) => res.json())
      .then((result) => {
        console.log(result);
        alert("Post deleted successfully !");
        const newposts = posts.filter((item) => {
          return item._id !== result._id;
        });
        setPosts(newposts);
      });
  };

  return (
    <div className="my-4 p-4 bg-white border border-gray-200 rounded-lg shadow dark:bg-gray-800 dark:border-gray-700">
      <div className="flex items-center pl-2 pr-3 sm:px-3 md:px-4">
        {/* avatar */}
        <img
          src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"
          alt="avatar"
          className="w-10 h-10 rounded-full object-cover cursor-pointer "
          // onClick={() => {
          //   navigate(`profile/${post.postedBy._id}`);
          // }}
        />
        {/* name and time post */}
        <div className={`ml-2 font-bold`}>
          <div
            className="flex items-center gap-x-1 cursor-pointer"
            onClick={() => {
              _user._id === post.postedBy._id
                ? navigate(`/profile`)
                : navigate(`/profile/${post.postedBy._id}`);
            }}
          >
            {post.postedBy.name}
          </div>

          <div className="font-[400] text-[13px] dark:text-[#B0B3B8] flex items-center gap-x-1 ">
            {moment(post.createdAt).fromNow()}
          </div>
        </div>
        {post.postedBy._id == _user._id && (
          <button
            className="ml-auto shrink-0"
            onClick={() => deletePost(post._id)}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 30 30"
              className="h-5 w-5"
            >
              <path d="M 14.984375 2.4863281 A 1.0001 1.0001 0 0 0 14 3.5 L 14 4 L 8.5 4 A 1.0001 1.0001 0 0 0 7.4863281 5 L 6 5 A 1.0001 1.0001 0 1 0 6 7 L 24 7 A 1.0001 1.0001 0 1 0 24 5 L 22.513672 5 A 1.0001 1.0001 0 0 0 21.5 4 L 16 4 L 16 3.5 A 1.0001 1.0001 0 0 0 14.984375 2.4863281 z M 6 9 L 7.7929688 24.234375 C 7.9109687 25.241375 8.7633438 26 9.7773438 26 L 20.222656 26 C 21.236656 26 22.088031 25.241375 22.207031 24.234375 L 24 9 L 6 9 z" />
            </svg>
          </button>
        )}
      </div>
      <p className="my-4 text-sm sm:text-base">{post.title}</p>
      <div className="my-4 grid grid-cols-[repeat(auto-fit,_minmax(200px,_1fr))] gap-4">
        <img src={post.image} alt="img1" />
      </div>
      <div className="flex gap-x-4">
        <button
          className="group inline-flex items-center gap-x-1 outline-none after:content-[attr(data-like-count)] focus:after:content-[attr(data-like-count-alt)] hover:text-[#ae7aff] focus:text-[#ae7aff]"
          onClick={() => handleLike(post._id)}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth="1.5"
            stroke="currentColor"
            aria-hidden="true"
            className={`h-5 w-5 group-focus ${isLiked ? "fill-[#ae7aff]" : ""}`}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z"
            ></path>
          </svg>
          <span>{likeCount}</span>
        </button>
        <button
          className="inline-flex items-center gap-x-1 outline-none hover:text-[#ae7aff]"
          onClick={() => {
            setShowComment(!showComment);
          }}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="currentColor"
            aria-hidden="true"
            className="h-5 w-5"
          >
            <path
              fillRule="evenodd"
              d="M4.804 21.644A6.707 6.707 0 006 21.75a6.721 6.721 0 003.583-1.029c.774.182 1.584.279 2.417.279 5.322 0 9.75-3.97 9.75-9 0-5.03-4.428-9-9.75-9s-9.75 3.97-9.75 9c0 2.409 1.025 4.587 2.674 6.192.232.226.277.428.254.543a3.73 3.73 0 01-.814 1.686.75.75 0 00.44 1.223zM8.25 10.875a1.125 1.125 0 100 2.25 1.125 1.125 0 000-2.25zM10.875 12a1.125 1.125 0 112.25 0 1.125 1.125 0 01-2.25 0zm4.875-1.125a1.125 1.125 0 100 2.25 1.125 1.125 0 000-2.25z"
              clipRule="evenodd"
            ></path>
          </svg>
          <span>{commentCount}</span>
        </button>
      </div>
      <div className="flex gap-x-1.5 px-2 sm:px-3 md:px-4 py-1 items-center mt-2">
        <img
          src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"
          alt="user_avatar"
          className="w-8 sm:w-9 h-8 sm:h-9 object-cover shrink-0 rounded-full "
        />
        <form
          className="flex px-2 rounded-full bg-[#F0F2F5] w-full mt-1 items-center dark:bg-[#3A3B3C]"
          onSubmit={(e) => {
            e.preventDefault();
            addComment(post._id);
          }}
        >
          <input
            type="text"
            className="px-2 py-1 sm:py-1.5 border-none focus:ring-0 bg-inherit rounded-full w-full font-medium dark:placeholder:text-[#b0b3b8] "
            placeholder="Write a comment..."
            value={textComment}
            onChange={(e) => {
              setTextComment(e.target.value);
            }}
          />
          <button type="submit" className="flex gap-x-1 sm:gap-x-2">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="currentColor"
              aria-hidden="true"
              className="w-6 text-black"
            >
              <path d="M3.478 2.405a.75.75 0 00-.926.94l2.432 7.905H13.5a.75.75 0 010 1.5H4.984l-2.432 7.905a.75.75 0 00.926.94 60.519 60.519 0 0018.445-8.986.75.75 0 000-1.218A60.517 60.517 0 003.478 2.405z"></path>
            </svg>
          </button>
        </form>
      </div>
      {/* comment box */}
      {showComment && (
        <div className="m-2 p-1 bg-white border border-gray-200 rounded-lg shadow">
          {post.comments.length > 0 ? (
            <>
              {post.comments.map((comment) => (
                <Comment key={comment._id} comment={comment} />
              ))}
            </>
          ) : (
            <h3 className="p-2">No Comments</h3>
          )}
        </div>
        //
      )}
    </div>
  );
}

export default PostCard;

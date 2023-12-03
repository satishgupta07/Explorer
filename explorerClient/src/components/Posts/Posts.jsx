import React, { useEffect, useState } from "react";
import CreatePost from "./CreatePost";
import moment from "moment/moment";
import { useAuth } from "../../contexts";

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
          <div
            className="my-4 p-4 bg-white border border-gray-200 rounded-lg shadow dark:bg-gray-800 dark:border-gray-700"
            key={item._id}
          >
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
              <div className={`ml-2 font-bold `}>
                <div
                  className="flex items-center gap-x-1 cursor-pointer"
                  onClick={() => {
                    navigate(`profile/${post.postedBy._id}`);
                  }}
                >
                  {item.postedBy.name}
                </div>

                <div className="font-[400] text-[13px] dark:text-[#B0B3B8] flex items-center gap-x-1 ">
                  {moment(item.createdAt).fromNow()}
                </div>
              </div>
            </div>
            <p className="my-4 text-sm sm:text-base">{item.title}</p>
            <div className="my-4 grid grid-cols-[repeat(auto-fit,_minmax(200px,_1fr))] gap-4">
              <img src={item.image} alt="img1" />
            </div>
            <div className="flex gap-x-4">
              <button
                className="group inline-flex items-center gap-x-1 outline-none after:content-[attr(data-like-count)] focus:after:content-[attr(data-like-count-alt)] hover:text-[#ae7aff] focus:text-[#ae7aff]"
                data-like-count="102"
                data-like-count-alt="103"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth="1.5"
                  stroke="currentColor"
                  aria-hidden="true"
                  className="h-5 w-5 group-focus:fill-[#ae7aff]"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z"
                  ></path>
                </svg>
              </button>
              <button className="inline-flex items-center gap-x-1 outline-none hover:text-[#ae7aff]">
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
                <span>18</span>
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default Posts;

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
                        className='flex items-center gap-x-1 cursor-pointer'
                        onClick={() => {
                            navigate(`profile/${post.postedBy._id}`);
                        }}>
                        {item.postedBy.name}
                    </div>

                    <div className='font-[400] text-[13px] dark:text-[#B0B3B8] flex items-center gap-x-1 '>
                        {moment(item.createdAt).fromNow()}
                    </div>
                </div>
            </div>
            <div className="card-image">
              <img src={item.image} alt="img1" />
            </div>
            <div className="card-content">
              <i className="material-icons" style={{ color: "red" }}>
                favorite
              </i>
              <h6>{item.title}</h6>
              <div style={{ display: "flex" }}>
                <input type="text" placeholder="add a comment" />
                <button className="btn-floating btn waves-effect waves-light blue">
                  <i className="material-icons">send</i>
                </button>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default Posts;

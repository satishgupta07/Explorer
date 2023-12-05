import moment from "moment";
import React from "react";

function Comment({ comment }) {
  return (
    <div className="flex p-4 border-b">
      <div className="h-10 w-10 shrink-0 sm:h-12 sm:w-12">
        <img
          src="https://images.pexels.com/photos/7775642/pexels-photo-7775642.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1"
          alt="Aurora Starlight"
          className="h-full w-full rounded-full object-cover"
        />
      </div>
      <div className="pl-4 pt-1">
        <div className="mb-2 flex items-center gap-x-2">
          <div className="w-full">
            <h2 className="inline-block font-bold">{comment.author.name}</h2>
            <span className="ml-2 inline-block text-sm text-gray-400">
              {moment(comment.createdAt).fromNow()}
            </span>
          </div>
        </div>
        <p className="mb-4 text-sm sm:text-base">{comment.content}</p>
        <div className="flex gap-x-4">
          <button
            className="group inline-flex items-center gap-x-1 outline-none after:content-[attr(data-like-count)] focus:after:content-[attr(data-like-count-alt)] text-[#ae7aff] focus:text-inherit"
            data-like-count="10"
            data-like-count-alt="9"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth="1.5"
              stroke="currentColor"
              aria-hidden="true"
              className="h-5 w-5 fill-[#ae7aff] group-focus:fill-none"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z"
              ></path>
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}

export default Comment;

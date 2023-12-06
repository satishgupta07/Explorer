import moment from "moment";
import React from "react";

function Comment({ comment }) {
  return (
    <div className="flex p-4 border-b">
      <div className="h-8 w-8 shrink-0 sm:h-9 sm:w-9">
        <img
          src="https://images.pexels.com/photos/7775642/pexels-photo-7775642.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1"
          alt="Aurora Starlight"
          className="h-full w-full rounded-full object-cover"
        />
      </div>
      <div className="pl-4">
        <div className="mb-2 flex items-center gap-x-2">
          <div className="w-full">
            <p className="inline-block font-bold">{comment.author.name}</p>
            <span className="ml-2 inline-block text-sm text-gray-400">
              {moment(comment.createdAt).fromNow()}
            </span>
          </div>
        </div>
        <p className="text-sm sm:text-base">{comment.content}</p>
      </div>
    </div>
  );
}

export default Comment;

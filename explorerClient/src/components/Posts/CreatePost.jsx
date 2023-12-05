import React, { useState, useEffect } from "react";
import conf from "../../config/conf";
import { useAuth } from "../../contexts";

function CreatePost() {
  const [showModal, setShowModal] = useState(false);
  const [title, setTitle] = useState("");
  const [image, setImage] = useState("");
  const [url, setUrl] = useState("");
  const { user, token } = useAuth();
  const jwtToken = token || localStorage.getItem("token");
  const _user = JSON.parse(user || localStorage.getItem("user"));

  useEffect(() => {
    if (url) {
      fetch("http://localhost:3333/api/v1/posts/create-post", {
        method: "post",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + jwtToken,
        },
        body: JSON.stringify({
          title,
          image: url,
        }),
      })
        .then((res) => res.json())
        .then((data) => {
          console.log(data);
          if (data.error) {
            console.log(data.error);
          } else {
            console.log("Created Post Successfully");
            setShowModal(false);
            // history.push("/");
          }
        })
        .catch((err) => {
          console.log(err);
        });
    }
  }, [url]);

  const postDetails = () => {
    const data = new FormData();
    data.append("file", image);
    data.append("upload_preset", conf.cloudinaryUploadPreset);
    data.append("cloud_name", conf.cloudName);
    data.append("folder", "Posts");

    fetch(`https://api.cloudinary.com/v1_1/${conf.cloudName}/image/upload`, {
      method: "post",
      body: data,
    })
      .then((res) => res.json())
      .then((data) => {
        setUrl(data.url);
      })
      .catch((err) => {
        console.log(err);
      });
  };

  return (
    <>
      <button
        className="mb-2 p-2 flex w-full items-center justify-start border border-gray-200 rounded-lg shadow dark:bg-gray-800 dark:border-gray-700"
        onClick={() => setShowModal(true)}
      >
        <img
          className="flex aspect-square h-10 w-10 shrink-0 rounded-full object-cover"
          src="https://images.pexels.com/photos/7775642/pexels-photo-7775642.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1"
          alt="avatar"
        />
        <input
          placeholder="What's on your mind?"
          className="w-full bg-transparent p-2 text-white !outline-none placeholder:text-gray-500 md:p-4"
        />
        <div className="flex gap-x-1 sm:gap-x-2">
          <div className="flex shrink-0 items-center justify-center bg-[#ae7aff] p-1">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="currentColor"
              aria-hidden="true"
              className="w-6 text-black"
            >
              <path d="M3.478 2.405a.75.75 0 00-.926.94l2.432 7.905H13.5a.75.75 0 010 1.5H4.984l-2.432 7.905a.75.75 0 00.926.94 60.519 60.519 0 0018.445-8.986.75.75 0 000-1.218A60.517 60.517 0 003.478 2.405z"></path>
            </svg>
          </div>
        </div>
      </button>
      {/* <button
        className="bg-pink-500 text-white active:bg-pink-600 font-bold uppercase text-sm px-6 py-3 rounded shadow hover:shadow-lg outline-none focus:outline-none mr-1 mb-1 ease-linear transition-all duration-150"
        type="button"
        onClick={() => setShowModal(true)}
      >
        Create Post
      </button> */}
      {showModal ? (
        <>
          <div className="justify-center items-center flex overflow-x-hidden overflow-y-auto fixed inset-0 z-50 outline-none focus:outline-none">
            <div className="relative w-1/2 xl:w-4/12 my-6 mx-auto max-w-3xl">
              {/*content*/}
              <div className="border-0 rounded-lg shadow-lg relative flex flex-col w-full bg-white outline-none focus:outline-none">
                {/*header*/}
                <div className="flex items-start justify-between p-5 border-b border-solid border-blueGray-200 rounded-t">
                  <h3 className="text-3xl font-semibold">Create Post</h3>
                  <button
                    className="text-3xl"
                    onClick={() => setShowModal(false)}
                  >
                    <span className="">×</span>
                  </button>
                </div>
                {/*body*/}
                <div className="relative p-6 flex-auto">
                  <div className="flex items-center">
                    <img
                      className="h-8 w-8 rounded-full"
                      src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"
                      alt=""
                    />
                    <h2 className="ml-4">{_user.name}</h2>
                  </div>
                  <div>
                    <textarea
                      id="message"
                      rows="4"
                      className="mt-4 block p-2.5 w-full text-sm text-gray-900 bg-gray-50 rounded-lg border border-gray-300 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                      placeholder="Write your thoughts here..."
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                    ></textarea>
                  </div>
                  <div className="mt-4 relative flex w-full h-[200px] p-2 rounded-md border dark:border-white/20 group ">
                    <div className="w-full h-full rounded-md flex flex-col items-center justify-center dark:group-hover:bg-[#47494A] relative bg-[#EAEBED]/60 group-hover:bg-[#d9dadc]/60 dark:bg-inherit ">
                      <div>
                        <svg
                          stroke="currentColor"
                          fill="currentColor"
                          strokeWidth="0"
                          viewBox="0 0 24 24"
                          className="w-10 h-10 rounded-full dark:bg-[#5A5C5C] p-1.5 text-black/60 bg-[#D8DADF] "
                          height="1em"
                          width="1em"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path fill="none" d="M0 0h24v24H0z"></path>
                          <path d="M19 7v2.99s-1.99.01-2 0V7h-3s.01-1.99 0-2h3V2h2v3h3v2h-3zm-3 4V8h-3V5H5c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2v-8h-3zM5 19l3-4 2 3 3-4 4 5H5z"></path>
                        </svg>
                      </div>
                      <div className="font-semibold text-[18px] leading-5 text-black/60 dark:text-white/60 ">
                        Add photos
                      </div>
                      <span className="text-[12px] text-[#949698] dark:text-[#b0b3b8] ">
                        or drag and drop
                      </span>
                    </div>
                    <input
                      type="file"
                      accept="image/*"
                      className="absolute w-full h-full top-0 left-0 z-[201] cursor-pointer opacity-0 "
                      onChange={(e) => setImage(e.target.files[0])}
                    />
                  </div>
                </div>
                {/*footer*/}
                <div className="flex items-center justify-end p-6 border-t border-solid border-blueGray-200 rounded-b">
                  <button
                    className="bg-emerald-500 text-white active:bg-emerald-600 font-bold uppercase text-sm px-6 py-3 rounded shadow hover:shadow-lg outline-none focus:outline-none mr-1 mb-1 ease-linear transition-all duration-150"
                    type="button"
                    onClick={() => postDetails()}
                  >
                    Post
                  </button>
                </div>
              </div>
            </div>
          </div>
          <div className="opacity-25 fixed inset-0 z-40 bg-black"></div>
        </>
      ) : null}
    </>
  );
}

export default CreatePost;

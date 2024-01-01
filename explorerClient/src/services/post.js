import axios from "axios";

const URL = "https://explorer-server.onrender.com";

export const createPost = async (data, jwtToken) => {
  try {
    return await axios.post(`${URL}/api/v1/posts/create-post`, data, {
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + jwtToken
      },
    });
  } catch (error) {
    console.log("Error while creating post !!", error);
  }
};

export const myPosts = async (jwtToken) => {
  try {
    return await axios.get(`${URL}/api/v1/posts/myposts`, {
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + jwtToken
      },
    });
  } catch (error) {
    console.log("Error while fetching posts !!", error);
  }
};

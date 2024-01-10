import axios from "axios";
import conf from "../config/conf";

export const createPost = async (data, jwtToken) => {
  try {
    return await axios.post(`${conf.serverUrl}/posts/create-post`, data, {
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + jwtToken,
      },
    });
  } catch (error) {
    console.log("Error while creating post !!", error);
  }
};

export const myPosts = async (jwtToken) => {
  try {
    return await axios.get(`${conf.serverUrl}/posts/myposts`, {
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + jwtToken,
      },
    });
  } catch (error) {
    console.log("Error while fetching posts !!", error);
  }
};

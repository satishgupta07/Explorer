import axios from "axios";

const URL = "http://localhost:3333";

export const createPost = async (data) => {
  try {
    return await axios.post(`${URL}/api/v1/posts/create-post`, data, {
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + localStorage.getItem("jwtToken")
      },
    });
  } catch (error) {
    console.log("Error while creating post !!", error);
  }
};

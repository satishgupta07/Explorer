import axios from "axios";

const URL = "http://localhost:3333";

export const registerUser = async (data) => {
  try {
    return await axios.post(`${URL}/api/v1/users/register`, data, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
  } catch (error) {
    console.log("Error while registering user !!", error);
    throw error;
  }
};

export const authenticateLogin = async (data) => {
  try {
    return await axios.post(`${URL}/api/v1/users/login`, data);
  } catch (error) {
    console.log("Error while login !!", error);
  }
};

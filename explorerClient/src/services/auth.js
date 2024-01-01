import axios from "axios";

const URL = "https://explorer-server.onrender.com";

export const registerUser = async (data) => {
  try {
    return await axios.post(`${URL}/api/v1/users/register`, data);
  } catch (error) {
    console.log("Error while registering user !!", error);
  }
};

export const authenticateLogin = async (data) => {
  try {
    return await axios.post(`${URL}/api/v1/users/login`, data);
  } catch (error) {
    console.log("Error while login !!", error);
  }
};

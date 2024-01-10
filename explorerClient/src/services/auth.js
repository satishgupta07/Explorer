import axios from "axios";
import conf from "../config/conf";

export const registerUser = async (data) => {
  try {
    return await axios.post(`${conf.serverUrl}/users/register`, data, {
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
    return await axios.post(`${conf.serverUrl}/users/login`, data);
  } catch (error) {
    console.log("Error while login !!", error);
  }
};

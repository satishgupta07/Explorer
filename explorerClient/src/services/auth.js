import axios from "axios";
import conf from "../config/conf";

// Send registration data as multipart/form-data so the avatar file is
// included in the same request as the text fields (name, email, password).
// Re-throws on failure so callers receive the real axios error (with .response.data.message).
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

// Plain JSON login — no file upload needed, so no custom Content-Type header.
// Re-throws on failure so callers receive the real axios error (with .response.data.message).
export const authenticateLogin = async (data) => {
  try {
    return await axios.post(`${conf.serverUrl}/users/login`, data);
  } catch (error) {
    console.log("Error while login !!", error);
    throw error;
  }
};

import axios from "axios";

const URL = 'http://localhost:3333';

export const registerUser = async (data) => {
    try {
        return await axios.post(`${URL}/api/user`, data);
    } catch (error) {
        console.log('Error while registering user !!', error);
    }
}
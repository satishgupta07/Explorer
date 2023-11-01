import { User } from "../../models/user.model.js";

const registerUser = async(req, res) => {

    const { name, email, password } = req.body;
    const user = new User({name,email,password});

    const exist = await User.exists({ email: req.body.email });
    if (exist) {
        console.log('This email is already taken.');
    }

    const createdUser = await user.save();

    return res
    .status(201)
    .json({ createdUser });
}

export {registerUser};
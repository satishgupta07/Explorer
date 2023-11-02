import Joi from "joi";
import bcrypt from "bcrypt";
import { User } from "../../models/user.model.js";
import CustomErrorHandler from "../../services/CustomErrorHandler.js";
import JwtService from "../../services/JwtService.js";

const registerUser = async(req, res, next) => {

    // Validation
    const registerSchema = Joi.object({
        name: Joi.string().min(3).max(30).required(),
        email: Joi.string().email().required(),
        password: Joi.string().pattern(new RegExp('^[a-zA-Z0-9]{3,30}$')).required(),
        confirm_password: Joi.ref('password')
    })

    const {error} = registerSchema.validate(req.body);

    if(error) {
        return next(error);
    }

    // check if user is in the database already
    try {
        const exist = await User.exists({ email: req.body.email });
        if (exist) {
            return next(CustomErrorHandler.alreadyExist('This email is already taken.'));
        }
    } catch(err) {
        return next(err);
    }

    const { name, email, password } = req.body;

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    //prepare the model
    const user = new User({
        name,
        email,
        password: hashedPassword
    });

    let access_token;
    try {
        const createdUser = await user.save();

        //Token
        access_token = JwtService.sign({ _id: createdUser._id});
    } catch(err) {
        return next(err);
    }

    return res
    .status(201)
    .json({ access_token });
}

export {registerUser};
import mongoose, { Schema } from "mongoose";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";

const userSchema = new Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    // Cloudinary URL for the user's profile picture.
    avatar: {
      type: String,
      required: true,
    },
    // Stored as a bcrypt hash — never the plain-text password.
    password: { type: String, required: true },
    // Arrays of User ObjectIds representing the social graph.
    followers: [{ type: Schema.Types.ObjectId, ref: "User" }],
    following: [{ type: Schema.Types.ObjectId, ref: "User" }],
    // Persisted refresh token; cleared on logout to invalidate the session.
    refreshToken: {
      type: String,
    },
  },
  { timestamps: true }
);

// Hash the password before every save, but only when the password field has
// actually changed (avoids re-hashing an already-hashed value on unrelated saves).
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();

  this.password = await bcrypt.hash(this.password, 10);
  next();
});

// Compare a plain-text candidate password against the stored hash.
userSchema.methods.isPasswordCorrect = async function (password) {
  return await bcrypt.compare(password, this.password);
};

// Generate a short-lived JWT that the client sends with every API request.
// The payload includes _id, email, and name so the middleware can attach
// the full user object to req.user without an extra DB lookup for basic info.
userSchema.methods.generateAccessToken = function () {
  return jwt.sign(
    {
      _id: this._id,
      email: this.email,
      name: this.name,
    },
    process.env.ACCESS_TOKEN_SECRET
    // {
    //   expiresIn: process.env.ACCESS_TOKEN_EXPIRY,
    // }
  );
};

// Generate a long-lived refresh token containing only the user ID.
// Stored in the DB so it can be invalidated server-side on logout.
userSchema.methods.generateRefreshToken = function () {
  return jwt.sign(
    {
      _id: this._id,
    },
    process.env.REFRESH_TOKEN_SECRET
    // {
    //   expiresIn: process.env.REFRESH_TOKEN_EXPIRY,
    // }
  );
};

export const User = mongoose.model("User", userSchema);

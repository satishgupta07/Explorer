import mongoose, { Schema } from "mongoose";
import { User } from "./user.models.js";


const postSchema = new Schema(
  {
    title: {
      type: String,
      required: true,
    },
    body: {
      type: String,
      required: true,
    },
    image: {
      type: String,
      default: "no photo",
    },
    postedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
    }
  },
  { timestamps: true }
);

export const Post = mongoose.model("Post", postSchema);

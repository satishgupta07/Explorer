import mongoose, { Schema } from "mongoose";

const likeSchema = new Schema(
  {
    postId: {
      type: Schema.Types.ObjectId,
      ref: "Post",
      default: null,
    },
    commentId: {
      type: Schema.Types.ObjectId,
      ref: "Comment",
      default: null,
    },
    likedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
  },
  { timestamps: true }
);

export const SocialLike = mongoose.model("SocialLike", likeSchema);
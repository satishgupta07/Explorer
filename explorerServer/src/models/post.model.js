import mongoose, { Schema } from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";

const postSchema = new Schema(
  {
    // The text body of the post (displayed as the caption/description).
    title: {
      type: String,
      required: true,
    },
    // Cloudinary URL of the post image (uploaded by the client directly to Cloudinary).
    image: {
      type: String,
      required: true,
    },
    // Reference to the User who created this post.
    postedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
  },
  { timestamps: true }
);

// Adds .aggregatePaginate() to the Post model, enabling cursor-based pagination
// over aggregation pipelines for efficient feed loading.
postSchema.plugin(mongooseAggregatePaginate);

export const Post = mongoose.model("Post", postSchema);

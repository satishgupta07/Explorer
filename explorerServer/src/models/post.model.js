import mongoose, { Schema } from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";

const postSchema = new Schema(
  {
    title: {
      type: String,
      required: true,
    },
    image: {
      type: String,
      required: true,
    },
    postedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
  },
  { timestamps: true }
);

// mongooseAggregatePaginate: This is a Mongoose plugin that adds pagination support for MongoDB aggregation queries.
postSchema.plugin(mongooseAggregatePaginate);

export const Post = mongoose.model("Post", postSchema);

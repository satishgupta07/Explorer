import dotenv from "dotenv";
import express from "express";
import connectDB from "./db/index.js";
import userRouter from './routes/user.routes.js';
import cors from "cors";
import postRouter from "./routes/post.routes.js";
import commentRouter from "./routes/comment.routes.js";

dotenv.config({
  path: "./.env",
});

const app = express();
const PORT = process.env.PORT || 3333;

try {
  await connectDB();
} catch (err) {
  console.log("Mongo db connect error: ", err);
}

app.use(express.json());
app.use(cors());

app.use('/api/v1/users', userRouter);
app.use("/api/v1/posts", postRouter);
app.use("/api/v1/comments", commentRouter);

app.listen(PORT, () => {
  console.log(`Server is listening on http://localhost:${PORT}`);
});
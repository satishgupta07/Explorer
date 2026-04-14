import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

const app = express();

// Allow cross-origin requests from the configured frontend origin.
// credentials: true is required so the browser sends/receives cookies (JWT tokens).
app.use(
  cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true,
  })
);

// Parse incoming JSON bodies (posts, comments, etc.) — capped at 16kb to prevent abuse.
app.use(express.json({ limit: "16kb" }));
// Parse URL-encoded form data (e.g. login form submissions).
app.use(express.urlencoded({ extended: true, limit: "16kb" }));
// Serve files from the /public directory (e.g. temporarily stored avatar uploads).
app.use(express.static("public"));
// Parse cookies so JWT tokens stored as cookies can be read in middlewares.
app.use(cookieParser());

// Routes import
import userRouter from "./routes/user.route.js";
import postRouter from "./routes/post.route.js";
import commentRouter from "./routes/comment.route.js";

// Mount routers under versioned API paths.
// All auth/user endpoints:    /api/v1/users/...
// All post endpoints:         /api/v1/posts/...
// All comment endpoints:      /api/v1/comments/...
app.use("/api/v1/users", userRouter);
app.use("/api/v1/posts", postRouter);
app.use("/api/v1/comments", commentRouter);

export { app };

import dotenv from "dotenv";
import connectDB from "./db/index.js";
import { app } from "./app.js";

// Load environment variables from .env before anything else runs,
// so process.env values are available throughout the application.
dotenv.config({
  path: "./.env",
});

// Connect to MongoDB first, then start the HTTP server only if the
// database connection succeeds. Failing fast here prevents the app
// from running in a broken state with no database.
connectDB()
  .then(() => {
    app.listen(process.env.PORT || 8000, () => {
      console.log(`⚙️ Server is running at port : ${process.env.PORT}`);
    });
  })
  .catch((err) => {
    console.log("MONGO db connection failed !!! ", err);
  });

import dotenv from "dotenv";
import express from "express";
import connectDB from "./db/index.js";

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

app.listen(PORT, () => {
  console.log(`Server is listening on http://localhost:${PORT}`);
});

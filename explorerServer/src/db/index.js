import mongoose from "mongoose";

// Exported so other modules can inspect the raw Mongoose connection instance if needed.
export let dbInstance = undefined;

const connectDB = async () => {
  try {
    const connectionInstance = await mongoose.connect(
      `${process.env.MONGODB_URI}`
    );
    dbInstance = connectionInstance;
    console.log(
      `\n☘️  MongoDB Connected! Db host: ${connectionInstance.connection.host}\n`
    );
  } catch (error) {
    console.log("MongoDB connection error: ", error);
    // Exit the process so the server doesn't start without a database.
    process.exit(1);
  }
};

export default connectDB;
import mongoose from "mongoose";
import { Env } from "./env.config";

export const connectToDatabase = async () => {
  try {
    await mongoose.connect(Env.MONGODB_URI);
    console.log("Database is connected");
  } catch (error) {
    console.error("Error connecting to db", error);
    process.exit(1);
  }
};

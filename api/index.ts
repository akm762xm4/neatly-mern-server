import app from "../src/app";
import serverless from "serverless-http";
import mongoose from "mongoose";
import env from "../src/util/validateEnv";

let connected = false;

async function connectDB() {
  if (!connected) {
    try {
      await mongoose.connect(env.MONGO_CONNECTION_STRING!);
      console.log("MongoDB connected (Vercel)");
      connected = true;
    } catch (err) {
      console.error("MongoDB connection error:", err);
    }
  }
}

const handler = async (req: any, res: any) => {
  await connectDB();
  return serverless(app)(req, res);
};

export { handler };

import "dotenv/config";
import env from "./util/validateEnv";
import mongoose from "mongoose";
import app from "./app";

const port = env.PORT;

mongoose
  .connect(env.MONGO_CONNECTION_STRING!)
  .then(() => {
    console.log("Mongoose Connected");
    app.listen(port!, () => {
      console.log("Server is Running on Port " + port);
    });
  })
  .catch(console.error);

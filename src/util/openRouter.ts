import axios from "axios";
import env from "./validateEnv";

const Referer =
  process.env.NODE_ENV === "development"
    ? "http://localhost:3000"
    : "https://neatly-mern-client.vercel.app";

const openRouter = axios.create({
  baseURL: "https://openrouter.ai/api/v1",
  headers: {
    "Content-Type": "application/json",
    Authorization: `Bearer ${env.OPENROUTER_API_KEY}`,
    "HTTP-Referer": Referer,
    "X-Title": "Neatly",
  },
});

export default openRouter;

import { cleanEnv, str, port } from "envalid";
export default cleanEnv(process.env, {
  MONGO_CONNECTION_STRING: str(),
  PORT: port(),
  JWT_SECRET: str(),
  ACCESS_TOKEN_SECRET: str(),
  REFRESH_TOKEN_SECRET: str(),
  REFRESH_COOKIE_NAME: str(),
  OPENROUTER_API_KEY: str(),
});

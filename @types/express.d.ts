import User from "../src/models/user";
declare module "express" {
  interface Request {
    user?: User;
  }
}

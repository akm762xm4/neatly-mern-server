import jwt from "jsonwebtoken"
import env from "./validateEnv"
import { ObjectId } from "mongoose"

const SECRET = env.JWT_SECRET

export const generateToken = (id: string | ObjectId) => {
  return jwt.sign({ id }, SECRET, { expiresIn: "1h" })
}

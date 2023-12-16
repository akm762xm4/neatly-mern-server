import jwt from "jsonwebtoken"
import User from "../models/user"
import env from "../util/validateEnv"
import { NextFunction, Request, Response } from "express"
import createHttpError from "http-errors"

export const requiresAuth = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const token = req.header("Authorization")?.replace("Bearer ", "")

    if (!token) {
      throw createHttpError(401, "Token Required!")
    }

    const decoded = jwt.verify(token, env.JWT_SECRET) as { id: string }

    if (!decoded) {
      throw createHttpError(400, "Invalid token!")
    }

    req.user = await User.findById(decoded.id).exec()

    next()
  } catch (error) {
    next(error)
  }
}

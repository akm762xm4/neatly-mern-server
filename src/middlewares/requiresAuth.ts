import { Request, Response, NextFunction } from "express";
import { verifyAccessToken } from "../util/jwtUtils";
import { ObjectId } from "mongoose";

export interface AuthedRequest extends Request {
  user?: { userId: ObjectId | string };
}

export const requiresAuth = (
  req: AuthedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader)
      return res.status(401).json({ message: "No authorization header" });

    const parts = authHeader.split(" ");
    if (parts.length !== 2 || parts[0] !== "Bearer")
      return res.status(401).json({ message: "Invalid auth header" });

    const token = parts[1];
    try {
      const payload = verifyAccessToken(token);
      req.user = { userId: payload.userId };
      return next();
    } catch (err) {
      return res.status(401).json({ message: "Invalid or expired token" });
    }
  } catch (err) {
    next(err);
  }
};

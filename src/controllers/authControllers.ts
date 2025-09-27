import { NextFunction, Request, Response } from "express";
import { User } from "../models/user";
import {
  signAccessToken,
  signRefreshToken,
  verifyRefreshToken,
} from "../util/jwtUtils";
import env from "../util/validateEnv";

const REFRESH_COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  path: "/api/auth/refresh", // restrict where the cookie is sent
};

export const register = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { name, email, password } = req.body;
    const exists = await User.findOne({ email });
    if (exists)
      return res.status(400).json({ message: "Email already registered" });

    const user = new User({ name, email, passwordHash: password });
    await user.save();

    const accessToken = signAccessToken({ userId: user.id.toString() });
    const refreshToken = signRefreshToken({ userId: user.id.toString() });

    // Store refresh token hashed in DB
    await user.addRefreshToken(refreshToken);

    res.cookie(env.REFRESH_COOKIE_NAME, refreshToken, {
      ...REFRESH_COOKIE_OPTIONS,
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });
    return res.json({
      user: { id: user.id, name: user.name, email: user.email },
      accessToken,
    });
  } catch (err) {
    next(err);
  }
};

export const login = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(401).json({ message: "Invalid credentials" });

    const match = await user.comparePassword(password);
    if (!match) return res.status(401).json({ message: "Invalid credentials" });

    const accessToken = signAccessToken({ userId: user.id.toString() });
    const refreshToken = signRefreshToken({ userId: user.id.toString() });

    await user.addRefreshToken(refreshToken);

    res.cookie(env.REFRESH_COOKIE_NAME, refreshToken, {
      ...REFRESH_COOKIE_OPTIONS,
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });
    return res.json({
      user: { id: user.id, name: user.name, email: user.email },
      accessToken,
    });
  } catch (err) {
    next(err);
  }
};

export const refresh = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const token = req.cookies?.[env.REFRESH_COOKIE_NAME];
    if (!token) return res.status(401).json({ message: "No refresh token" });

    let payload;
    try {
      payload = verifyRefreshToken(token);
    } catch (err) {
      return res.status(401).json({ message: "Invalid refresh token" });
    }

    const user = await User.findById(payload.userId);
    if (!user) return res.status(401).json({ message: "User not found" });

    // Verify token exists in DB (compare hashed values)
    const tokenMatches = await Promise.all(
      user.refreshTokens.map(async (rt) => ({
        rt,
        ok: await (await import("bcrypt")).compare(token, rt.tokenHash),
      }))
    );

    const match = tokenMatches.find((x) => x.ok);
    if (!match) {
      // Token not found -> possible reuse; invalidate all refresh tokens
      user.refreshTokens = [];
      await user.save();
      return res.status(401).json({ message: "Refresh token reuse detected" });
    }

    // Optionally rotate refresh tokens: remove the used one and add a new one
    // remove used token
    await user.removeRefreshTokenByHash(match.rt.tokenHash);

    const newRefreshToken = signRefreshToken({ userId: user.id.toString() });
    await user.addRefreshToken(newRefreshToken);

    const accessToken = signAccessToken({ userId: user.id.toString() });

    res.cookie(env.REFRESH_COOKIE_NAME, newRefreshToken, {
      ...REFRESH_COOKIE_OPTIONS,
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });
    return res.json({
      accessToken,
      user: { id: user.id, name: user.name, email: user.email },
    });
  } catch (err) {
    next(err);
  }
};

export const logout = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const token = req.cookies?.[env.REFRESH_COOKIE_NAME];
    if (token) {
      try {
        const payload = verifyRefreshToken(token);
        const user = await User.findById(payload.userId);
        if (user) {
          // remove the used refresh token on logout
          const tokenMatches = await Promise.all(
            user.refreshTokens.map(async (rt) => ({
              rt,
              ok: await (await import("bcrypt")).compare(token, rt.tokenHash),
            }))
          );
          const match = tokenMatches.find((x) => x.ok);
          if (match) {
            await user.removeRefreshTokenByHash(match.rt.tokenHash);
          }
        }
      } catch (e) {
        // ignore invalid token
      }
    }

    res.clearCookie(env.REFRESH_COOKIE_NAME, { path: "/api/auth/refresh" });
    return res.json({ message: "Logged out" });
  } catch (err) {
    next(err);
  }
};

export const getMe = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.user?.userId;
    if (!userId) return res.status(401).json({ message: "Unauthorized" });
    const user = await User.findById(userId).select(
      "-passwordHash -refreshTokens"
    );
    if (!user) return res.status(404).json({ message: "User not found" });
    return res.json({ id: user.id, name: user.name, email: user.email });
  } catch (err) {
    next(err);
  }
};

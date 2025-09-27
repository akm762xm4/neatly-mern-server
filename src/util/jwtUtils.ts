import jwt, { SignOptions, JwtPayload } from "jsonwebtoken";
import env from "./validateEnv";

const accessTokenOptions: SignOptions = {
  expiresIn: "1h",
};

const refreshTokenOptions: SignOptions = {
  expiresIn: "7d",
};

export interface TokenPayload extends JwtPayload {
  userId: string;
}

export function signAccessToken(payload: object): string {
  return jwt.sign(payload, env.ACCESS_TOKEN_SECRET, accessTokenOptions);
}

export function signRefreshToken(payload: object): string {
  return jwt.sign(payload, env.REFRESH_TOKEN_SECRET, refreshTokenOptions);
}

export function verifyAccessToken(token: string): TokenPayload {
  return jwt.verify(token, env.ACCESS_TOKEN_SECRET) as TokenPayload;
}

export function verifyRefreshToken(token: string): TokenPayload {
  return jwt.verify(token, env.REFRESH_TOKEN_SECRET) as TokenPayload;
}

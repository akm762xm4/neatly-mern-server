import { NextFunction, Request, Response } from "express";
import bcrypt from "bcrypt";
import User from "../models/user";
import createHttpError from "http-errors";
import { generateToken } from "../util/jwtUtils";

export const signup = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const username = req.body.username;
  const email = req.body.email;
  const passwordRaw = req.body.password;
  try {
    if (!username || !email || !passwordRaw) {
      throw createHttpError(400, "Please fill all fields!");
    }

    const existingUser = await User.findOne({ username: username }).exec();
    const existingEmail = await User.findOne({ email: email }).exec();

    if (existingUser || existingEmail) {
      throw createHttpError(409, "Username or email already taken");
    }

    const passwordHashed = await bcrypt.hash(passwordRaw, 10);

    const user = await User.create({
      username,
      email,
      password: passwordHashed,
    });

    res.status(201).json({
      _id: user._id,
      username: user.username,
      email: user.email,
      token: generateToken(user._id.toString()),
    });
  } catch (error) {
    next(error);
  }
};

export const login = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const username = req.body.username;
  const password = req.body.password;

  try {
    if (!username || !password) {
      throw createHttpError(400, "Please fill all fields!");
    }

    const user = await User.findOne({ username: username })
      .select("+email +password")
      .exec();

    if (user) {
      const passwordMatch = await bcrypt.compare(password, user.password);
      if (passwordMatch) {
        res.json({
          _id: user._id,
          username: user.username,
          email: user.email,
          token: generateToken(user._id.toString()),
        });
      } else {
        throw createHttpError(401, "invalid password");
      }
    } else {
      throw createHttpError(400, "User Not Found!");
    }
  } catch (error) {
    next(error);
  }
};

export const getMe = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const user = await User.findById(req.user._id)
      .select("+username +email +_id")
      .exec();

    if (!user) {
      throw createHttpError(400, "User not found,please login again!");
    }

    res.status(200).json(user);
  } catch (error) {
    next(error);
  }
};

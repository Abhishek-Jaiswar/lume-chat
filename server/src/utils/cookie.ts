import { Response } from "express";
import JWT from "jsonwebtoken";
import { Env } from "../config/env.config";

type Time = `${number}${"s" | "m" | "h" | "d" | "w" | "y"}`;
type TCookie = {
  res: Response;
  userId: string;
};

export const setJWTAuthCookie = ({ res, userId }: TCookie) => {
  const payload = { userId };
  const expiresIn = Env.JWT_EXPIRES_IN as Time;
  const token = JWT.sign(payload, Env.JWT_SECRET, {
    audience: ["user"],
    expiresIn: expiresIn || "7d",
  });

  return res.cookie("accessToken", token, {
    maxAge: 7 * 24 * 60 * 60 * 1000,
    httpOnly: true,
    secure: Env.NODE_ENV === "production" ? true : false,
    sameSite: Env.NODE_ENV === "production" ? "strict" : "lax",
  });
};

export const clearJwtAuthCookie = (res: Response) => {
  return res.clearCookie("accessToken", { path: "/" });
};

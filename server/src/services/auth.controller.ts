import { Request, Response } from "express";
import { asyncHandler } from "../middlewares/asyncHandler.middleware";
import { loginSchema, registerSchema } from "../validators/auth.validator";
import { clearJwtAuthCookie, setJWTAuthCookie } from "../utils/cookie";
import { HTTPSTATUS } from "../config/http.config";
import { loginService, registerService } from "./auth.service";

export const registerController = asyncHandler(
  async (req: Request, res: Response) => {
    const body = registerSchema.parse(req.body);

    const user = await registerService(body);

    const userId = user._id.toString();

    return setJWTAuthCookie({
      res,
      userId,
    })
      .status(HTTPSTATUS.CREATED)
      .json({
        message: "User created and logged in succesfully",
        success: true,
      });
  }
);

export const loginController = asyncHandler(
  async (req: Request, res: Response) => {
    const body = loginSchema.parse(req.body);

    const user = await loginService(body);

    const userId = user._id.toString();

    return setJWTAuthCookie({
      res,
      userId,
    })
      .status(HTTPSTATUS.OK)
      .json({
        message: "User logged in successfully",
        success: true,
      });
  }
);

export const logoutController = asyncHandler(
  async (req: Request, res: Response) => {
    return clearJwtAuthCookie(res).status(HTTPSTATUS.OK).json({
      message: "User logout successfully.",
      success: true,
    });
  }
);

export const authStatusController = asyncHandler(
  async (req: Request, res: Response) => {
    const user = req.user;
    return res.status(HTTPSTATUS.OK).json({
      message: "Authenticated user",
      success: true,
      user: user,
    });
  }
);

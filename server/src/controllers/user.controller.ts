import { Request, Response } from "express";
import { asyncHandler } from "../middlewares/asyncHandler.middleware";
import { HTTPSTATUS } from "../config/http.config";
import { getUsersService, updateUserService } from "../services/user.service";

export const getUsersController = asyncHandler(
  async (req: Request, res: Response) => {
    const userId = req.user?._id;

    const users = await getUsersService(userId)

    return res.status(HTTPSTATUS.OK).json({
      message: "Users retrieved successfully",
      success: true,
      users
    });
  }
);

export const updateUserController = asyncHandler(
  async (req: Request, res: Response) => {
    const userId = req.user?._id;
    const { name, avatar, about, wallpaper } = req.body;
    console.log("@@UPDATE_USER", { userId, name, about, wallpaper });

    const user = await updateUserService(userId, { name, avatar, about, wallpaper });

    return res.status(HTTPSTATUS.OK).json({
      message: "User updated successfully",
      success: true,
      user
    });
  }
);

import cloudinary from "../config/cloudinary.config";
import { User } from "../models/user.model";
import { NotFoundException } from "../utils/app-error";

export const findUserByIdService = async (userId: string) => {
  return await User.findById(userId);
};

export const getUsersService = async (userId: string) => {
  const users = await User.find({ _id: { $ne: userId } }).select("-password");

  return users;
};

export const updateUserService = async (
  userId: string,
  body: { name?: string; avatar?: string; about?: string; wallpaper?: string }
) => {
  const { name, avatar, about, wallpaper } = body;

  const user = await User.findById(userId);
  if (!user) {
    console.log("@@USER_NOT_FOUND_IN_SERVICE", { userId });
    throw new NotFoundException("User not found");
  }

  if (name) user.name = name;
  if (about) user.about = about;
  if (wallpaper) user.wallpaper = wallpaper;

  if (avatar) {
    const uploadRes = await cloudinary.uploader.upload(avatar, {
      folder: "avatars",
    });
    user.avatar = uploadRes.secure_url;
  }

  await user.save();
  return user;
};

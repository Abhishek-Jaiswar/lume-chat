import { v2 as cloudinary, v2 } from "cloudinary";
import { Env } from "./env.config";

cloudinary.config({
  cloud_name: Env.CLOUD_NAME,
  api_key: Env.CLOUDINARY_API_KEY,
  api_secret: Env.CLOUDINARY_API_SECRET,
});

export default cloudinary;

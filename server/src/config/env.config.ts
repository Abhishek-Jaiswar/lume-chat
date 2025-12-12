import { getEnv } from "../utils/get-env";

export const Env = {
  NODE_ENV: getEnv("NODE_ENV", "development"),
  PORT: getEnv("PORT", "8000"),
  MONGODB_URI: getEnv("MONGO_URI"),
  JWT_SECRET: getEnv("JWT_SECRET", "default_jwt_secret"),
  JWT_EXPIRES_IN: getEnv("JWT_EXPIRES_IN", "1d"),
  FRONTEND_URL: getEnv("FRONTEND_URL", "http://localhost:5173"),
  CLOUD_NAME: getEnv("CLOUD_NAME"),
  CLOUDINARY_URL: getEnv("CLOUDINARY_URL"),
  CLOUDINARY_API_KEY: getEnv("CLOUDINARY_API_KEY"),
  CLOUDINARY_API_SECRET: getEnv("CLOUDINARY_API_SECRET"),
} as const;

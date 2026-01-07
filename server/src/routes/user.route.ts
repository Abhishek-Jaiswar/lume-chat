import { Router } from "express";
import { passportAuthenticateJwt } from "../config/passport.config";
import { getUsersController, updateUserController } from "../controllers/user.controller";

const userRoutes = Router();

userRoutes.get("/all", passportAuthenticateJwt, getUsersController);
userRoutes.put("/update", passportAuthenticateJwt, updateUserController);

export default userRoutes;

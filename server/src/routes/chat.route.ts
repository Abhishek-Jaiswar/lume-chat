import { Router } from "express";
import { passportAuthenticateJwt } from "../config/passport.config";
import {
  createChatController,
  getSingleChatController,
  getUserChatController,
} from "../controllers/chat.controller";

const chatRoutes = Router()
  .use(passportAuthenticateJwt)
  .post("/create", createChatController)
  .get("/all", getUserChatController)
  .get("/:id", getSingleChatController);

export default chatRoutes;

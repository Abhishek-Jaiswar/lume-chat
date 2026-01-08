import { Router } from "express";
import { passportAuthenticateJwt } from "../config/passport.config";
import {
  createChatController,
  deleteChatController,
  getSingleChatController,
  getUserChatController,
} from "../controllers/chat.controller";
import {
  deleteMessageController,
  sendMessageController,
} from "../controllers/message.controller";

const chatRoutes = Router()
  .use(passportAuthenticateJwt)
  .post("/create", createChatController)
  .post("/message/send", sendMessageController)
  .get("/all", getUserChatController)
  .delete("/:id", deleteChatController)
  .get("/:id", getSingleChatController)
  .delete("/message/:messageId", deleteMessageController);

export default chatRoutes;

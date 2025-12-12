import "dotenv/config";
import cors from "cors";
import express from "express";
import passport from "passport";
import cookieParser from "cookie-parser";
import { Env } from "./config/env.config";
import { Request, Response } from "express";
import { asyncHandler } from "./middlewares/asyncHandler.middleware";
import { HTTPSTATUS } from "./config/http.config";
import { errorHandler } from "./middlewares/errorHandler.middleware";
import { connectToDatabase } from "./config/database.config";
import "./config/passport.config";
import router from "./routes";

const app = express();

app.use(express.json({limit: "10mb"}));
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));
app.use(
  cors({
    origin: Env.FRONTEND_URL,
    credentials: true,
  })
);

app.use(passport.initialize());

app.get(
  "/health",
  asyncHandler(async (req: Request, res: Response) => {
    return res.status(HTTPSTATUS.OK).json({
      message: "good",
      status: "OK",
    });
  })
);

app.use('/api', router)

app.use(errorHandler);

app.listen(Env.PORT, async () => {
  await connectToDatabase();
  console.log(`Server is listening on port: http://localhost:${Env.PORT}`);
});

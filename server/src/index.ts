import "dotenv/config";
import express from "express";
import { Request, Response } from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import { Env } from "./config/env.config";
import { asyncHandler } from "./middlewares/asyncHandler.middleware";
import { HTTPSTATUS } from "./config/http.config";
import { errorHandler } from "./middlewares/errorHandler.middleware";
import { connectToDatabase } from "./config/database.config";

const app = express();

app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));
app.use(
  cors({
    origin: Env.FRONTEND_URL,
    credentials: true,
  })
);

app.get(
  "/health",
  asyncHandler(async (req: Request, res: Response) => {
    return res.status(HTTPSTATUS.OK).json({
      message: "good",
      status: "OK",
    });
  })
);

app.use(errorHandler);

app.listen(Env.PORT, async () => {
  await connectToDatabase();
  console.log(`Server is listening on port: http://localhost:${Env.PORT}`);
});

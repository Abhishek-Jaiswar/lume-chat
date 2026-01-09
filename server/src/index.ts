import "dotenv/config";
import cors from "cors";
import express from "express";
import passport from "passport";
import cookieParser from "cookie-parser";
import http from 'http'
import { Env } from "./config/env.config";
import { Request, Response } from "express";
import { asyncHandler } from "./middlewares/asyncHandler.middleware";
import { HTTPSTATUS } from "./config/http.config";
import { errorHandler } from "./middlewares/errorHandler.middleware";
import { connectToDatabase } from "./config/database.config";
import "./config/passport.config";
import router from "./routes";
import { initilizeSocket } from "./lib/socket";
import path from "path";

const app = express();
const server = http.createServer(app)

initilizeSocket(server)

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

app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

app.get("/api/test-route", (req, res) => res.json({ status: "ok", message: "API is working" }));

app.use('/api', router)

if (Env.NODE_ENV === "production" ) {
  const clientPath = path.resolve(__dirname, '../../client/dist');
  app.use(express.static(clientPath));

  app.get(/^(?!\/api).*/, (req: Request, res: Response) => {
    res.sendFile(path.join(clientPath, 'index.html'))
  });
}

app.use(errorHandler);

(async () => {
  try {
    await connectToDatabase();
    server.listen(Env.PORT, () => {
      console.log(`Server running on http://localhost:${Env.PORT}`);
    });
  } catch (error) {
    console.error(" Failed to connect to DB", error);
    process.exit(1);
  }
})();


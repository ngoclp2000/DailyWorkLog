import cors from "cors";
import express from "express";
import { CONFIG } from "./config.js";
import { createAuthRouter } from "./api/routes/authRoutes.js";
import { createWorklogRouter } from "./api/routes/worklogRoutes.js";
import { createParseRouter } from "./api/routes/parseRoutes.js";
import { UserRepository } from "./repositories/UserRepository.js";
import { TokenRepository } from "./repositories/TokenRepository.js";
import { WorklogRepository } from "./repositories/WorklogRepository.js";

export const createApp = () => {
  const app = express();

  app.use(
    cors({
      origin: CONFIG.corsOrigin,
      methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
      allowedHeaders: ["Content-Type", "Authorization"]
    })
  );
  app.use(express.json({ limit: "1mb" }));

  const userRepository = new UserRepository();
  const tokenRepository = new TokenRepository();
  const worklogRepository = new WorklogRepository();

  app.use("/auth", createAuthRouter(userRepository, tokenRepository, worklogRepository));
  app.use(createWorklogRouter(userRepository, tokenRepository, worklogRepository));
  app.use(createParseRouter(userRepository, tokenRepository));

  return app;
};

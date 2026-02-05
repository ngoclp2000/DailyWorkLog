import { Router } from "express";
import { ParseController } from "../../controllers/ParseController.js";
import { ParseService } from "../../services/ParseService.js";
import { UserRepository } from "../../repositories/UserRepository.js";
import { TokenRepository } from "../../repositories/TokenRepository.js";
import { authMiddleware } from "../../middleware/authMiddleware.js";

export const createParseRouter = (userRepository: UserRepository, tokenRepository: TokenRepository) => {
  const router = Router();
  const controller = new ParseController(new ParseService());
  const guard = authMiddleware(userRepository, tokenRepository);

  router.post("/parse", guard, controller.parse);
  router.post("/eod-summary", guard, controller.summarize);
  router.post("/smart-inbox", guard, controller.smartInbox);

  return router;
};

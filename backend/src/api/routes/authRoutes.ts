import { Router } from "express";
import { AuthController } from "../../controllers/AuthController.js";
import { AuthService } from "../../services/AuthService.js";
import { UserRepository } from "../../repositories/UserRepository.js";
import { TokenRepository } from "../../repositories/TokenRepository.js";
import { WorklogRepository } from "../../repositories/WorklogRepository.js";
import { authMiddleware } from "../../middleware/authMiddleware.js";

export const createAuthRouter = (
  userRepository: UserRepository,
  tokenRepository: TokenRepository,
  worklogRepository: WorklogRepository
) => {
  const router = Router();
  const authService = new AuthService(userRepository, tokenRepository, worklogRepository);
  const controller = new AuthController(authService);

  router.post("/login", controller.login);
  router.post("/register", controller.register);
  router.post("/logout", authMiddleware(userRepository, tokenRepository), controller.logout);

  return router;
};

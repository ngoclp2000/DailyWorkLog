import { Router } from "express";
import { AuthController } from "../../controllers/AuthController.js";
import { AuthService } from "../../services/AuthService.js";
import { UserRepository } from "../../repositories/UserRepository.js";
import { TokenRepository } from "../../repositories/TokenRepository.js";
import { authMiddleware } from "../../middleware/authMiddleware.js";

export const createAuthRouter = (userRepository: UserRepository, tokenRepository: TokenRepository) => {
  const router = Router();
  const authService = new AuthService(userRepository, tokenRepository);
  const controller = new AuthController(authService);

  router.post("/login", controller.login);
  router.post("/logout", authMiddleware(userRepository, tokenRepository), controller.logout);

  return router;
};

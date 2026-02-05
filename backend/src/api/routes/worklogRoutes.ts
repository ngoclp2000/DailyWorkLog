import { Router } from "express";
import { WorklogController } from "../../controllers/WorklogController.js";
import { WorklogService } from "../../services/WorklogService.js";
import { WorklogRepository } from "../../repositories/WorklogRepository.js";
import { UserRepository } from "../../repositories/UserRepository.js";
import { TokenRepository } from "../../repositories/TokenRepository.js";
import { authMiddleware } from "../../middleware/authMiddleware.js";

export const createWorklogRouter = (
  userRepository: UserRepository,
  tokenRepository: TokenRepository,
  worklogRepository: WorklogRepository
) => {
  const router = Router();
  const controller = new WorklogController(new WorklogService(worklogRepository));

  router.get("/worklog", authMiddleware(userRepository, tokenRepository), controller.getWorklog);
  router.post("/worklog/items", authMiddleware(userRepository, tokenRepository), controller.createItem);
  router.put("/worklog/items/reorder", authMiddleware(userRepository, tokenRepository), controller.reorderItems);

  return router;
};

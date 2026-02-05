import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { CONFIG } from "../config.js";
import { UserRepository } from "../repositories/UserRepository.js";
import { TokenRepository } from "../repositories/TokenRepository.js";

export const authMiddleware = (
  userRepository: UserRepository,
  tokenRepository: TokenRepository,
) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    const header = req.headers.authorization;
    if (!header) {
      return res.status(401).json({ error: "Missing Authorization header" });
    }

    const [scheme, token] = header.split(" ");
    if (scheme !== "Bearer" || !token) {
      return res.status(401).json({ error: "Invalid Authorization format" });
    }

    try {
      if (await tokenRepository.isRevoked(token)) {
        return res.status(401).json({ error: "Token revoked" });
      }
    } catch (error) {
      console.error("Token validation error:", error);
      return res.status(500).json({ error: "Failed to validate token" });
    }

    try {
      const payload = jwt.verify(token, CONFIG.jwtSecret) as {
        sub: string;
        email: string;
        name: string;
      };

      try {
        const user = await userRepository.findById(payload.sub);
        if (!user) {
          return res.status(401).json({ error: "User not found" });
        }

        req.user = user;
        req.token = token;
        return next();
      } catch (error) {
        return res.status(500).json({ error: "Failed to load user" });
      }
    } catch (error) {
      return res.status(401).json({ error: "Invalid token" });
    }
  };
};

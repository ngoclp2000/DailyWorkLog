import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { randomUUID } from "crypto";
import { CONFIG } from "../config.js";
import { UserRepository } from "../repositories/UserRepository.js";
import { TokenRepository } from "../repositories/TokenRepository.js";
import { User } from "../models/User.js";

export interface AuthResult {
  token: string;
  user: Pick<User, "id" | "email" | "name">;
}

export class AuthService {
  constructor(
    private userRepository: UserRepository,
    private tokenRepository: TokenRepository
  ) {}

  login(email: string, password: string): AuthResult {
    const user = this.userRepository.findByEmail(email);
    if (!user || !bcrypt.compareSync(password, user.passwordHash)) {
      throw new Error("Invalid credentials");
    }

    const token = jwt.sign(
      {
        sub: user.id,
        email: user.email,
        name: user.name
      },
      CONFIG.jwtSecret,
      {
        expiresIn: "1d",
        jwtid: randomUUID()
      }
    );

    return {
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name
      }
    };
  }

  logout(token: string): void {
    this.tokenRepository.revoke(token);
  }
}

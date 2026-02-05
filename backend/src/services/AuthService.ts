import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { randomUUID } from "crypto";
import { CONFIG } from "../config.js";
import { UserRepository } from "../repositories/UserRepository.js";
import { TokenRepository } from "../repositories/TokenRepository.js";
import { WorklogRepository } from "../repositories/WorklogRepository.js";
import { User } from "../models/User.js";

export interface AuthResult {
  token: string;
  user: Pick<User, "id" | "email" | "name">;
}

export class AuthService {
  constructor(
    private userRepository: UserRepository,
    private tokenRepository: TokenRepository,
    private worklogRepository: WorklogRepository,
  ) {}

  private buildAuthResult(user: User): AuthResult {
    const token = jwt.sign(
      {
        sub: user.id,
        email: user.email,
        name: user.name,
      },
      CONFIG.jwtSecret,
      {
        expiresIn: "1d",
        jwtid: randomUUID(),
      },
    );

    return {
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
      },
    };
  }

  async login(email: string, password: string): Promise<AuthResult> {
    const user = await this.userRepository.findByEmail(email);
    if (!user || !bcrypt.compareSync(password, user.passwordHash)) {
      throw new Error("Invalid credentials");
    }

    // Ensure default columns exist for legacy users
    await this.worklogRepository.createDefaultColumns(user.id);

    return this.buildAuthResult(user);
  }

  async register(
    name: string,
    email: string,
    password: string,
  ): Promise<AuthResult> {
    const existing = await this.userRepository.findByEmail(email);
    if (existing) {
      throw new Error("Email already exists");
    }
    const passwordHash = await bcrypt.hash(password, 10);
    const user: User = {
      id: randomUUID(),
      email,
      name,
      passwordHash,
    };
    await this.userRepository.create(user);
    await this.worklogRepository.createDefaultColumns(user.id);
    return this.buildAuthResult(user);
  }

  async logout(token: string): Promise<void> {
    await this.tokenRepository.revoke(token);
  }
}

import { randomUUID } from "crypto";
import bcrypt from "bcryptjs";
import { User } from "../models/User.js";

const seedPassword = "password123";

export class UserRepository {
  private users: User[] = [
    {
      id: randomUUID(),
      email: "demo@dailyworklog.vn",
      name: "Demo User",
      passwordHash: bcrypt.hashSync(seedPassword, 10)
    }
  ];

  findByEmail(email: string): User | undefined {
    return this.users.find((user) => user.email === email);
  }

  findById(id: string): User | undefined {
    return this.users.find((user) => user.id === id);
  }
}

import { User } from "../models/User.js";
import { db } from "../db.js";
import type { RowDataPacket } from "mysql2/promise";

export class UserRepository {
  async findByEmail(email: string): Promise<User | null> {
    const [rows] = await db.query<RowDataPacket[]>(
      "SELECT id, email, name, password_hash AS passwordHash FROM dwl_users WHERE email = ? LIMIT 1",
      [email]
    );
    if (!rows.length) return null;
    const row = rows[0] as {
      id: string;
      email: string;
      name: string;
      passwordHash: string;
    };
    return {
      id: row.id,
      email: row.email,
      name: row.name,
      passwordHash: row.passwordHash
    };
  }

  async findById(id: string): Promise<User | null> {
    const [rows] = await db.query<RowDataPacket[]>(
      "SELECT id, email, name, password_hash AS passwordHash FROM dwl_users WHERE id = ? LIMIT 1",
      [id]
    );
    if (!rows.length) return null;
    const row = rows[0] as {
      id: string;
      email: string;
      name: string;
      passwordHash: string;
    };
    return {
      id: row.id,
      email: row.email,
      name: row.name,
      passwordHash: row.passwordHash
    };
  }

  async create(user: User): Promise<User> {
    await db.query(
      "INSERT INTO dwl_users (id, email, name, password_hash) VALUES (?, ?, ?, ?)",
      [user.id, user.email, user.name, user.passwordHash]
    );
    return user;
  }
}

import { db } from "../db.js";
import type { RowDataPacket } from "mysql2/promise";

export class TokenRepository {
  async revoke(token: string): Promise<void> {
    await db.query("INSERT INTO dwl_revoked_tokens (token) VALUES (?)", [token]);
  }

  async isRevoked(token: string): Promise<boolean> {
    const [rows] = await db.query<RowDataPacket[]>(
      "SELECT token FROM dwl_revoked_tokens WHERE token = ? LIMIT 1",
      [token]
    );
    return rows.length > 0;
  }
}

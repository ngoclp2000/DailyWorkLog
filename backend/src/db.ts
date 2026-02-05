import mysql from "mysql2/promise";
import { CONFIG } from "./config.js";

export const db = mysql.createPool({
  uri: CONFIG.db.url,
  waitForConnections: true,
  connectionLimit: 10,
  dateStrings: true
});

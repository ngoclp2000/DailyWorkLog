import { Request, Response } from "express";
import { AuthService } from "../services/AuthService.js";

export class AuthController {
  constructor(private authService: AuthService) {}

  login = async (req: Request, res: Response) => {
    const rawEmail = typeof req.body?.email === "string" ? req.body.email : "";
    const email = rawEmail.trim().toLowerCase();
    const password = typeof req.body?.password === "string" ? req.body.password : "";
    if (!email || !password) {
      return res.status(400).json({ error: "Missing email or password" });
    }

    try {
      const result = await this.authService.login(email, password);
      return res.json(result);
    } catch (error) {
      return res.status(401).json({ error: "Invalid credentials" });
    }
  };

  register = async (req: Request, res: Response) => {
    const rawName = typeof req.body?.name === "string" ? req.body.name : "";
    const rawEmail = typeof req.body?.email === "string" ? req.body.email : "";
    const password = typeof req.body?.password === "string" ? req.body.password : "";
    const name = rawName.trim();
    const email = rawEmail.trim().toLowerCase();

    if (!name || !email || !password) {
      return res.status(400).json({ error: "Missing name, email, or password" });
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({ error: "Invalid email" });
    }
    if (password.length < 6) {
      return res.status(400).json({ error: "Password must be at least 6 characters" });
    }

    try {
      const result = await this.authService.register(name, email, password);
      return res.status(201).json(result);
    } catch (error) {
      if (error instanceof Error && error.message === "Email already exists") {
        return res.status(409).json({ error: "Email already exists" });
      }
      return res.status(500).json({ error: "Unable to register user" });
    }
  };

  logout = async (req: Request, res: Response) => {
    const token = req.token;
    if (!token) {
      return res.status(400).json({ error: "Missing token" });
    }
    await this.authService.logout(token);
    return res.json({ message: "Logged out" });
  };
}

import { Request, Response } from "express";
import { AuthService } from "../services/AuthService.js";

export class AuthController {
  constructor(private authService: AuthService) {}

  login = (req: Request, res: Response) => {
    const { email, password } = req.body ?? {};
    if (!email || !password) {
      return res.status(400).json({ error: "Missing email or password" });
    }

    try {
      const result = this.authService.login(email, password);
      return res.json(result);
    } catch (error) {
      return res.status(401).json({ error: "Invalid credentials" });
    }
  };

  logout = (req: Request, res: Response) => {
    const token = req.token;
    if (!token) {
      return res.status(400).json({ error: "Missing token" });
    }
    this.authService.logout(token);
    return res.json({ message: "Logged out" });
  };
}

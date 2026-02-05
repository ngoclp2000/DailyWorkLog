import { Request, Response } from "express";
import { WorklogService } from "../services/WorklogService.js";

export class WorklogController {
  constructor(private worklogService: WorklogService) {}

  getWorklog = (req: Request, res: Response) => {
    const { start, end } = req.query ?? {};
    const user = req.user;
    if (!user) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const columns = this.worklogService.getColumns({
      userId: user.id,
      assigneeName: user.name,
      now: new Date().toISOString(),
      start: typeof start === "string" ? start : undefined,
      end: typeof end === "string" ? end : undefined
    });

    return res.json({ columns });
  };
}

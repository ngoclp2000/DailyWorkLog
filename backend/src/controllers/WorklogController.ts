import { Request, Response } from "express";
import { WorklogService } from "../services/WorklogService.js";

export class WorklogController {
  constructor(private worklogService: WorklogService) {}

  getWorklog = async (req: Request, res: Response) => {
    const { start, end } = req.query ?? {};
    const user = req.user;
    if (!user) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    try {
      const columns = await this.worklogService.getColumns({
        userId: user.id,
        assigneeName: user.name,
        start: typeof start === "string" ? start : undefined,
        end: typeof end === "string" ? end : undefined,
      });

      return res.json({ columns });
    } catch (error) {
      console.error("getWorklog error:", error);
      return res.status(500).json({ error: "Failed to fetch worklog" });
    }
  };

  createItem = async (req: Request, res: Response) => {
    const user = req.user;
    if (!user) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    const { columnId, title, dueDate, important } = req.body ?? {};
    if (!columnId || !title) {
      return res.status(400).json({ error: "Missing columnId or title" });
    }

    try {
      const item = await this.worklogService.createItem({
        userId: user.id,
        assigneeName: user.name,
        columnId,
        title,
        dueDate: typeof dueDate === "string" ? dueDate : undefined,
        important: Boolean(important),
      });

      return res.status(201).json({ item });
    } catch (error) {
      console.error("createItem error:", error);
      return res.status(500).json({ error: "Failed to create item" });
    }
  };

  reorderItems = async (req: Request, res: Response) => {
    const user = req.user;
    if (!user) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    const { columns } = req.body ?? {};
    if (!Array.isArray(columns)) {
      return res.status(400).json({ error: "Missing columns payload" });
    }
    const normalized = columns
      .map((column) => ({
        columnId: column?.columnId,
        itemIds: Array.isArray(column?.itemIds) ? column.itemIds : [],
      }))
      .filter((column) => typeof column.columnId === "string");

    try {
      await this.worklogService.reorderItems({
        userId: user.id,
        columns: normalized,
      });
    } catch (error) {
      return res.status(500).json({ error: "Failed to reorder items" });
    }

    return res.json({ ok: true });
  };
}

import { Request, Response } from "express";
import { ParseService } from "../services/ParseService.js";

export class ParseController {
  constructor(private parseService: ParseService) {}

  parse = (req: Request, res: Response) => {
    const { now, transcript, known_projects = [], known_people = [] } = req.body ?? {};
    if (!now || !transcript) {
      return res.status(400).json({ error: "Missing now or transcript" });
    }
    return res.json(this.parseService.parseTranscript({ now, transcript, known_projects, known_people }));
  };

  summarize = (req: Request, res: Response) => {
    const { date, items = [] } = req.body ?? {};
    if (!date) {
      return res.status(400).json({ error: "Missing date" });
    }
    return res.json(this.parseService.summarizeEod({ date, items }));
  };

  smartInbox = (req: Request, res: Response) => {
    const { item, known_projects = [], recent_items = [] } = req.body ?? {};
    if (!item) {
      return res.status(400).json({ error: "Missing item" });
    }
    return res.json(this.parseService.smartInbox({ item, known_projects, recent_items }));
  };
}

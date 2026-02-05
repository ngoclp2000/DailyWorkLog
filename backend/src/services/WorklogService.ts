import dayjs from "dayjs";
import { WorklogRepository } from "../repositories/WorklogRepository.js";
import { WorklogColumn } from "../models/Worklog.js";

export class WorklogService {
  constructor(private worklogRepository: WorklogRepository) {}

  getColumns({
    userId,
    assigneeName,
    now,
    start,
    end
  }: {
    userId: string;
    assigneeName: string;
    now: string;
    start?: string;
    end?: string;
  }): WorklogColumn[] {
    const startDate = start ? dayjs(start) : null;
    const endDate = end ? dayjs(end) : null;
    const columns = this.worklogRepository.buildColumns(userId, assigneeName, now);
    if (!startDate || !endDate) return columns;

    return columns.map((column) => ({
      ...column,
      items: column.items.filter((item) => {
        if (!item.dueDate) return false;
        const due = dayjs(item.dueDate);
        return (due.isAfter(startDate) || due.isSame(startDate)) && (due.isBefore(endDate) || due.isSame(endDate));
      })
    }));
  }
}

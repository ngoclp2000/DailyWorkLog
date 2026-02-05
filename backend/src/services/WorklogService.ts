import { WorklogRepository, WorklogItemRecord } from "../repositories/WorklogRepository.js";
import { WorklogColumn } from "../models/Worklog.js";

export class WorklogService {
  constructor(private worklogRepository: WorklogRepository) {}

  async getColumns({
    userId,
    assigneeName,
    start,
    end
  }: {
    userId: string;
    assigneeName: string;
    start?: string;
    end?: string;
  }): Promise<WorklogColumn[]> {
    const columns = await this.worklogRepository.listColumns(userId);
    const items = await this.worklogRepository.listItems(userId, start, end);
    const columnMap = new Map<string, WorklogColumn>(
      columns.map((column) => [column.id, { ...column, items: [] }])
    );
    for (const item of items) {
      const column = columnMap.get(item.columnId);
      if (!column) continue;
      column.items.push(stripItemRecord(item));
    }
    return columns.map((column) => columnMap.get(column.id) ?? column);
  }

  async createItem({
    userId,
    assigneeName,
    columnId,
    title,
    dueDate,
    important
  }: {
    userId: string;
    assigneeName: string;
    columnId: string;
    title: string;
    dueDate?: string;
    important: boolean;
  }) {
    return this.worklogRepository.createItem({
      userId,
      columnId,
      title,
      assignee: assigneeName,
      dueDate,
      important
    });
  }

  async reorderItems({
    userId,
    columns
  }: {
    userId: string;
    columns: Array<{ columnId: string; itemIds: string[] }>;
  }) {
    await this.worklogRepository.reorderItems(userId, columns);
  }
}

function stripItemRecord(item: WorklogItemRecord) {
  return {
    id: item.id,
    title: item.title,
    meta: item.meta,
    assignee: item.assignee,
    time: item.time,
    tag: item.tag,
    tagType: item.tagType,
    dueDate: item.dueDate,
    important: item.important
  };
}

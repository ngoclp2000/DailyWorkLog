import dayjs from "dayjs";
import { randomUUID } from "crypto";
import type { RowDataPacket } from "mysql2/promise";
import { db } from "../db.js";
import { WorklogColumn, WorklogItem } from "../models/Worklog.js";

type ColumnRow = RowDataPacket & {
  id: string;
  title: string;
  position: number;
};

type ItemRow = RowDataPacket & {
  id: string;
  column_id: string;
  title: string;
  meta: string | null;
  assignee: string;
  time: string;
  tag: string | null;
  tag_type: string | null;
  due_date: string | null;
  important: number;
  position: number | null;
};

const DEFAULT_COLUMNS = [
  { id: "backlog", title: "Cần làm", position: 0 },
  { id: "doing", title: "Đang làm", position: 1 },
  { id: "done", title: "Hoàn tất", position: 2 }
];

export type WorklogItemRecord = WorklogItem & {
  columnId: string;
  position: number;
};

export class WorklogRepository {
  async createDefaultColumns(userId: string): Promise<void> {
    const [rows] = await db.query<RowDataPacket[]>(
      "SELECT COUNT(*) as count FROM dwl_worklog_template_columns WHERE user_id = ?",
      [userId]
    );
    const count = Number((rows[0] as { count: number } | undefined)?.count ?? 0);
    if (count > 0) return;

    const placeholders = DEFAULT_COLUMNS.map(() => "(?, ?, ?, ?)").join(", ");
    const params = DEFAULT_COLUMNS.flatMap((column) => [
      userId,
      column.id,
      column.title,
      column.position
    ]);
    await db.query(
      `INSERT INTO dwl_worklog_template_columns (user_id, id, title, position) VALUES ${placeholders}`,
      params
    );
  }

  async listColumns(userId: string): Promise<WorklogColumn[]> {
    const [rows] = await db.query<ColumnRow[]>(
      "SELECT id, title, position FROM dwl_worklog_template_columns WHERE user_id = ? ORDER BY position ASC",
      [userId]
    );
    return rows.map((row) => ({
      id: row.id,
      title: row.title,
      items: []
    }));
  }

  async listItems(userId: string, start?: string, end?: string): Promise<WorklogItemRecord[]> {
    const params: Array<string> = [userId];
    let sql =
      "SELECT id, column_id, title, meta, assignee, time, tag, tag_type, due_date, important, position " +
      "FROM dwl_worklog_items WHERE user_id = ?";
    if (start && end) {
      sql += " AND due_date BETWEEN ? AND ?";
      params.push(toSqlDate(start), toSqlDate(end));
    }
    sql += " ORDER BY column_id ASC, position ASC, created_at ASC";

    const [rows] = await db.query<ItemRow[]>(sql, params);
    return rows.map((row) => ({
      id: row.id,
      columnId: row.column_id,
      title: row.title,
      meta: row.meta ?? undefined,
      assignee: row.assignee,
      time: row.time,
      tag: row.tag ?? undefined,
      tagType: row.tag_type ?? undefined,
      dueDate: row.due_date ? new Date(row.due_date).toISOString() : undefined,
      important: Boolean(row.important),
      position: row.position ?? 0
    }));
  }

  async createItem({
    userId,
    columnId,
    title,
    assignee,
    dueDate,
    important
  }: {
    userId: string;
    columnId: string;
    title: string;
    assignee: string;
    dueDate?: string;
    important: boolean;
  }): Promise<WorklogItemRecord> {
    const id = randomUUID();
    const [rows] = await db.query<RowDataPacket[]>(
      "SELECT COALESCE(MAX(position), -1) AS maxPos FROM dwl_worklog_items WHERE user_id = ? AND column_id = ?",
      [userId, columnId]
    );
    const maxPos = Number((rows[0] as { maxPos: number | null })?.maxPos ?? -1);
    const position = maxPos + 1;
    const time = dueDate ? dayjs(dueDate).format("HH:mm") : dayjs().format("HH:mm");
    const dueDateValue = dueDate ? toSqlDate(dueDate) : null;

    await db.query(
      "INSERT INTO dwl_worklog_items (id, user_id, column_id, title, meta, assignee, time, tag, tag_type, due_date, important, position) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
      [id, userId, columnId, title, null, assignee, time, null, null, dueDateValue, important ? 1 : 0, position]
    );

    return {
      id,
      columnId,
      title,
      meta: undefined,
      assignee,
      time,
      tag: undefined,
      tagType: undefined,
      dueDate: dueDateValue ? new Date(dueDateValue).toISOString() : undefined,
      important,
      position
    };
  }

  async reorderItems(
    userId: string,
    columns: Array<{ columnId: string; itemIds: string[] }>
  ): Promise<void> {
    const conn = await db.getConnection();
    try {
      await conn.beginTransaction();
      for (const column of columns) {
        for (let index = 0; index < column.itemIds.length; index += 1) {
          const itemId = column.itemIds[index];
          await conn.query(
            "UPDATE dwl_worklog_items SET column_id = ?, position = ? WHERE id = ? AND user_id = ?",
            [column.columnId, index, itemId, userId]
          );
        }
      }
      await conn.commit();
    } catch (error) {
      await conn.rollback();
      throw error;
    } finally {
      conn.release();
    }
  }
}

function toSqlDate(value: string) {
  return dayjs(value).format("YYYY-MM-DD HH:mm:ss");
}

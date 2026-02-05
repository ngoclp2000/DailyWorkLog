import { WorklogTemplateColumn, WorklogColumn } from "../models/Worklog.js";

const DEFAULT_TEMPLATE: WorklogTemplateColumn[] = [
  {
    id: "backlog",
    title: "Cần làm",
    items: [
      {
        id: "item-1",
        title: "Chuẩn bị checklist kickoff dự án",
        meta: "Gọi khách hàng, note yêu cầu chính",
        assignee: "",
        time: "09:15",
        tag: "High",
        tagType: "warning",
        dueOffsetDays: 0,
        important: true
      },
      {
        id: "item-2",
        title: "Review bản thiết kế UI/UX",
        meta: "Figma: Mobile + Desktop",
        assignee: "",
        time: "10:30",
        tag: "Design",
        tagType: "info",
        dueOffsetDays: 1
      }
    ]
  },
  {
    id: "doing",
    title: "Đang làm",
    items: [
      {
        id: "item-3",
        title: "Tối ưu flow check-in DailyWorkLog",
        meta: "Kéo thả, thêm nhanh, gợi ý timeline",
        assignee: "",
        time: "11:00",
        tag: "Focus",
        tagType: "success",
        dueOffsetDays: 2
      }
    ]
  },
  {
    id: "done",
    title: "Hoàn tất",
    items: [
      {
        id: "item-4",
        title: "Sync nhanh với team backend",
        meta: "Cập nhật API & timeline",
        assignee: "",
        time: "08:45",
        dueOffsetDays: -1
      }
    ]
  }
];

export class WorklogRepository {
  private templates = new Map<string, WorklogTemplateColumn[]>();

  getTemplateForUser(userId: string, assigneeName: string): WorklogTemplateColumn[] {
    const existing = this.templates.get(userId);
    if (existing) return existing;

    const template = DEFAULT_TEMPLATE.map((column) => ({
      ...column,
      items: column.items.map((item) => ({
        ...item,
        assignee: assigneeName
      }))
    }));
    this.templates.set(userId, template);
    return template;
  }

  buildColumns(userId: string, assigneeName: string, nowIso: string): WorklogColumn[] {
    const base = new Date(nowIso);
    const template = this.getTemplateForUser(userId, assigneeName);
    return template.map((column) => ({
      id: column.id,
      title: column.title,
      items: column.items.map((item) => {
        const dueDate = new Date(base);
        dueDate.setDate(dueDate.getDate() + item.dueOffsetDays);
        return {
          id: item.id,
          title: item.title,
          meta: item.meta,
          assignee: item.assignee,
          time: item.time,
          tag: item.tag,
          tagType: item.tagType,
          dueDate: dueDate.toISOString(),
          important: item.important ?? false
        };
      })
    }));
  }
}

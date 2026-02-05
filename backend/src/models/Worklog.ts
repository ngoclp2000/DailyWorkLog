export interface WorklogItem {
  id: string;
  title: string;
  meta?: string;
  assignee: string;
  time: string;
  tag?: string;
  tagType?: string;
  dueDate?: string;
  important: boolean;
}

export interface WorklogColumn {
  id: string;
  title: string;
  items: WorklogItem[];
}

export interface WorklogTemplateItem {
  id: string;
  title: string;
  meta?: string;
  assignee: string;
  time: string;
  tag?: string;
  tagType?: string;
  dueOffsetDays: number;
  important?: boolean;
}

export interface WorklogTemplateColumn {
  id: string;
  title: string;
  items: WorklogTemplateItem[];
}

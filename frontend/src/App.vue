<template>
  <n-config-provider :theme-overrides="themeOverrides">
    <n-layout class="app">
      <n-layout-header class="hero" bordered>
        <div class="hero-copy">
          <n-text class="eyebrow" depth="3">Daily Worklog</n-text>
          <n-h1 class="hero-title">Bảng kéo-thả log công việc mỗi ngày</n-h1>
          <n-text depth="3">
            Kéo thả thẻ giữa các cột và lọc theo khoảng ngày để xem kế hoạch công việc.
          </n-text>
        </div>
        <div class="status">
          <n-tag type="info" size="small">Hôm nay: {{ todayLabel }}</n-tag>
          <n-button secondary size="small" @click="exportLog">Export log</n-button>
        </div>
      </n-layout-header>

      <n-layout-content class="content">
        <section class="toolbar">
          <div class="toolbar-left">
            <n-input
              v-model:value="newItemTitle"
              placeholder="Thêm việc mới (ví dụ: Review PR / Gọi khách hàng)"
              size="large"
            />
            <n-button type="primary" size="large" @click="addItem">Thêm việc</n-button>
            <div class="quick-controls">
              <n-date-picker v-model:value="newItemDueDate" type="date" size="large" />
              <div class="important-toggle">
                <span class="toggle-label">Quan trọng</span>
                <n-switch v-model:value="newItemImportant" size="medium" />
              </div>
            </div>
          </div>
          <div class="toolbar-right">
            <n-input
              v-model:value="dailyNote"
              type="textarea"
              placeholder="Ghi chú nhanh về mục tiêu hôm nay, blockers, hoặc kế hoạch tương lai"
              :autosize="{ minRows: 2, maxRows: 3 }"
            />
          </div>
        </section>

        <section class="filters">
          <div class="filters-left">
            <div class="date-picker">
              <span class="filters-label">Chọn khoảng ngày xem</span>
              <n-date-picker v-model:value="selectedRange" type="daterange" size="medium" />
            </div>
            <n-button size="small" secondary @click="setTodayRange">Hôm nay</n-button>
          </div>
          <n-alert
            v-if="importantSummary.count"
            type="warning"
            class="important-alert"
            title="Việc quan trọng sắp tới"
            closable
          >
            Có {{ importantSummary.count }} việc quan trọng trong 3 ngày tới (gần nhất:
            {{ importantSummary.nearest }}).
          </n-alert>
        </section>

        <section class="board">
          <article v-for="column in columns" :key="column.id" class="lane">
            <header class="lane-header">
              <div>
                <n-text class="lane-title">{{ column.title }}</n-text>
                <n-text depth="3" class="lane-subtitle">{{ column.subtitle }}</n-text>
              </div>
              <n-tag size="small" round>{{ column.items.length }}</n-tag>
            </header>

            <Draggable
              v-model="column.items"
              item-key="id"
              class="lane-body"
              group="worklog"
              :animation="220"
              ghost-class="drag-ghost"
              chosen-class="drag-chosen"
              drag-class="drag-dragging"
            >
              <template #item="{ element }">
                <n-card v-if="isItemVisible(element)" class="work-card" :bordered="false">
                  <div class="card-header">
                    <n-text class="card-title">{{ element.title }}</n-text>
                    <div class="card-tags">
                      <n-tag v-if="element.important" size="tiny" type="error">Quan trọng</n-tag>
                      <n-tag v-if="element.tag" size="tiny" :type="element.tagType">
                        {{ element.tag }}
                      </n-tag>
                    </div>
                  </div>
                  <n-text depth="3" class="card-meta">{{ element.meta }}</n-text>
                  <div class="card-footer">
                    <n-tag size="small" type="info" round>{{ element.assignee }}</n-tag>
                    <div class="card-due">
                      <n-tag v-if="element.dueDate" size="tiny" type="warning">
                        {{ formatDate(element.dueDate) }}
                      </n-tag>
                      <n-text depth="3">{{ element.time }}</n-text>
                    </div>
                  </div>
                </n-card>
              </template>
              <template #footer>
                <div v-if="!visibleCount(column.items)" class="empty-state">
                  <n-text depth="3">Kéo thả thẻ vào đây</n-text>
                </div>
              </template>
            </Draggable>
          </article>
        </section>
      </n-layout-content>
    </n-layout>
  </n-config-provider>
</template>

<script setup lang="ts">
import {
  NButton,
  NCard,
  NConfigProvider,
  NH1,
  NInput,
  NLayout,
  NLayoutContent,
  NLayoutHeader,
  NDatePicker,
  NAlert,
  NSwitch,
  NTag,
  NText,
  type GlobalThemeOverrides
} from "naive-ui";
import { computed, reactive, ref } from "vue";
import Draggable from "vuedraggable";

type WorkItem = {
  id: string;
  title: string;
  meta: string;
  assignee: string;
  time: string;
  tag?: string;
  tagType?: "info" | "success" | "warning" | "error";
  dueDate?: string;
  important?: boolean;
};

type WorkColumn = {
  id: string;
  title: string;
  subtitle: string;
  items: WorkItem[];
};

const todayLabel = new Date().toLocaleDateString("vi-VN", {
  weekday: "long",
  year: "numeric",
  month: "long",
  day: "numeric"
});

const newItemTitle = ref("");
const dailyNote = ref("Ưu tiên: hoàn thành demo DailyWorkLog và gửi cập nhật EOD.");
const selectedRange = ref<[number, number] | null>([
  startOfDay(new Date()).getTime(),
  startOfDay(new Date()).getTime()
]);
const newItemDueDate = ref<number | null>(Date.now());
const newItemImportant = ref(false);

const columns = reactive<WorkColumn[]>([
  {
    id: "backlog",
    title: "Inbox",
    subtitle: "Việc mới cần làm rõ",
    items: [
      {
        id: "item-1",
        title: "Chuẩn bị checklist kickoff dự án",
        meta: "Gọi khách hàng, note yêu cầu chính",
        assignee: "You",
        time: "09:15",
        tag: "High",
        tagType: "warning",
        dueDate: new Date().toISOString(),
        important: true
      },
      {
        id: "item-2",
        title: "Review bản thiết kế UI/UX",
        meta: "Figma: Mobile + Desktop",
        assignee: "You",
        time: "10:30",
        tag: "Design",
        tagType: "info",
        dueDate: new Date(Date.now() + 86400000).toISOString()
      }
    ]
  },
  {
    id: "doing",
    title: "Đang làm",
    subtitle: "Việc đang chạy",
    items: [
      {
        id: "item-3",
        title: "Tối ưu flow check-in DailyWorkLog",
        meta: "Kéo thả, thêm nhanh, gợi ý timeline",
        assignee: "You",
        time: "11:00",
        tag: "Focus",
        tagType: "success",
        dueDate: new Date(Date.now() + 2 * 86400000).toISOString()
      }
    ]
  },
  {
    id: "done",
    title: "Hoàn thành",
    subtitle: "Việc đã xong hôm nay",
    items: [
      {
        id: "item-4",
        title: "Sync nhanh với team backend",
        meta: "Cập nhật API & timeline",
        assignee: "You",
        time: "08:45",
        dueDate: new Date(Date.now() - 86400000).toISOString()
      }
    ]
  }
]);

const importantSummary = computed(() => {
  const { startDate } = getSelectedRange();
  const endDate = new Date(startDate);
  endDate.setDate(startDate.getDate() + 3);
  const items = columns.flatMap((column) => column.items);
  const upcoming = items
    .filter((item) => item.important && item.dueDate)
    .map((item) => ({ ...item, due: new Date(item.dueDate as string) }))
    .filter((item) => item.due >= startDate && item.due <= endDate)
    .sort((a, b) => a.due.getTime() - b.due.getTime());
  return {
    count: upcoming.length,
    nearest: upcoming[0] ? formatDate(upcoming[0].dueDate as string) : ""
  };
});

const themeOverrides: GlobalThemeOverrides = {
  common: {
    primaryColor: "#2563eb",
    primaryColorHover: "#1d4ed8",
    borderRadius: "14px",
    fontFamily: "\"Roboto\", system-ui, sans-serif"
  },
  Card: {
    borderRadius: "18px",
    color: "#ffffff"
  },
  Input: {
    borderRadius: "12px"
  },
  Button: {
    borderRadius: "12px"
  }
};

function startOfDay(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function endOfDay(date: Date) {
  const end = new Date(date.getFullYear(), date.getMonth(), date.getDate() + 1);
  end.setMilliseconds(end.getMilliseconds() - 1);
  return end;
}

function isSameDay(a: Date, b: Date) {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

function getSelectedRange() {
  if (!selectedRange.value) {
    const today = new Date();
    return {
      startDate: startOfDay(today),
      endDate: endOfDay(today)
    };
  }
  const [start, end] = selectedRange.value;
  return {
    startDate: startOfDay(new Date(start)),
    endDate: endOfDay(new Date(end))
  };
}

function setTodayRange() {
  const today = new Date();
  selectedRange.value = [startOfDay(today).getTime(), startOfDay(today).getTime()];
}

function isItemVisible(item: WorkItem) {
  const { startDate, endDate } = getSelectedRange();
  if (!item.dueDate) return false;
  const due = new Date(item.dueDate);
  if (isSameDay(startDate, endDate)) {
    return isSameDay(due, startDate);
  }
  return due >= startDate && due <= endDate;
}

function visibleCount(items: WorkItem[]) {
  return items.filter((item) => isItemVisible(item)).length;
}

function formatDate(value: string) {
  return new Date(value).toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit" });
}

function addItem() {
  const title = newItemTitle.value.trim();
  if (!title) return;
  const item: WorkItem = {
    id: `item-${Date.now()}`,
    title,
    meta: "Nhấn vào thẻ để cập nhật chi tiết",
    assignee: "You",
    time: new Date().toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" }),
    tag: "New",
    tagType: "info",
    dueDate: newItemDueDate.value ? new Date(newItemDueDate.value).toISOString() : undefined,
    important: newItemImportant.value
  };
  columns[0].items.unshift(item);
  newItemTitle.value = "";
}

function exportLog() {
  const snapshot = columns.map((column) => ({
    column: column.title,
    items: column.items.map((item) => item.title)
  }));
  const summary = JSON.stringify({ date: todayLabel, note: dailyNote.value, snapshot }, null, 2);
  navigator.clipboard?.writeText(summary);
}
</script>

<style scoped>
:global(body) {
  margin: 0;
  font-family: "Roboto", system-ui, sans-serif;
  background: #eef2ff;
  color: #0f172a;
}

.app {
  min-height: 100vh;
  background: radial-gradient(circle at top, #e0e7ff 0%, #f8fafc 55%, #eef2ff 100%);
}

.hero {
  padding: 32px 32px 20px;
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 24px;
  background: transparent;
}

.hero-copy {
  max-width: 640px;
}

.hero-title {
  margin: 8px 0 6px;
  font-weight: 700;
  font-size: clamp(26px, 3vw, 34px);
}

.eyebrow {
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.2em;
  text-transform: uppercase;
}

.status {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 10px;
}

.content {
  padding: 0 32px 48px;
}

.toolbar {
  display: grid;
  grid-template-columns: minmax(0, 1.35fr) minmax(0, 1fr);
  gap: 18px;
  margin-bottom: 18px;
}

.toolbar-left {
  display: flex;
  gap: 12px;
  align-items: center;
  flex-wrap: wrap;
}

.toolbar-right :deep(textarea) {
  border-radius: 12px;
  min-height: 72px;
}

.quick-controls {
  display: flex;
  gap: 12px;
  align-items: center;
}

.important-toggle {
  display: flex;
  gap: 8px;
  align-items: center;
  padding: 6px 10px;
  background: rgba(255, 255, 255, 0.8);
  border-radius: 999px;
  box-shadow: inset 0 0 0 1px rgba(148, 163, 184, 0.3);
}

.toggle-label {
  font-size: 12px;
  font-weight: 600;
  color: #334155;
}

.filters {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 16px;
  margin-bottom: 18px;
  flex-wrap: wrap;
}

.filters-left {
  display: flex;
  align-items: center;
  gap: 16px;
  flex-wrap: wrap;
}

.filters-label {
  font-size: 12px;
  font-weight: 600;
  color: #475569;
}

.date-picker {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.important-alert {
  max-width: 360px;
  border-radius: 16px;
}

.board {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
  gap: 16px;
}

.lane {
  background: rgba(255, 255, 255, 0.92);
  border-radius: 18px;
  padding: 16px;
  min-height: 420px;
  box-shadow: 0 18px 40px rgba(15, 23, 42, 0.08);
}

.lane-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 16px;
  gap: 8px;
}

.lane-title {
  font-weight: 700;
  font-size: 16px;
}

.lane-subtitle {
  font-size: 12px;
}

.lane-body {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.work-card {
  cursor: grab;
  box-shadow: 0 12px 30px rgba(15, 23, 42, 0.12);
  border-radius: 16px;
  padding: 12px;
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.96), rgba(248, 250, 252, 0.9));
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.work-card:active {
  cursor: grabbing;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 6px;
}

.card-title {
  font-weight: 600;
}

.card-tags {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
  justify-content: flex-end;
}

.card-meta {
  font-size: 13px;
  margin-bottom: 12px;
}

.card-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 12px;
}

.card-due {
  display: flex;
  align-items: center;
  gap: 8px;
}

.empty-state {
  border: 2px dashed rgba(148, 163, 184, 0.5);
  border-radius: 14px;
  padding: 18px;
  text-align: center;
}

.drag-ghost {
  opacity: 0.6;
  box-shadow: none;
  transform: scale(0.98);
}

.drag-chosen {
  box-shadow: 0 18px 40px rgba(37, 99, 235, 0.18);
  transform: scale(1.02);
}

.drag-dragging {
  cursor: grabbing;
}

@media (max-width: 900px) {
  .hero {
    flex-direction: column;
  }

  .status {
    align-items: flex-start;
  }

  .toolbar {
    grid-template-columns: 1fr;
  }

  .toolbar-left {
    flex-direction: column;
    align-items: stretch;
  }

  .quick-controls {
    flex-direction: column;
    align-items: stretch;
  }
}
</style>

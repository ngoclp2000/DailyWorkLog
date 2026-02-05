<template>
  <n-config-provider :theme-overrides="themeOverrides">
    <n-layout class="app">
      <n-layout-header class="hero" bordered>
        <div>
          <n-text class="eyebrow" depth="3">Daily Worklog</n-text>
          <n-h1 class="hero-title">Bảng kéo-thả log công việc mỗi ngày</n-h1>
          <n-text depth="3">
            Kéo thả thẻ sang các cột để cập nhật trạng thái. Ghi chú nhanh ở header và xuất log cuối ngày.
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
          </div>
          <div class="toolbar-right">
            <n-input v-model:value="dailyNote" type="textarea" :autosize="{ minRows: 2, maxRows: 3 }" />
          </div>
        </section>

        <section class="board">
          <article
            v-for="column in columns"
            :key="column.id"
            class="lane"
            :class="{ 'lane--over': dragOverColumn === column.id }"
            @dragover.prevent="onDragOver(column.id)"
            @dragleave="onDragLeave"
            @drop="onDrop($event, column.id)"
          >
            <header class="lane-header">
              <div>
                <n-text class="lane-title">{{ column.title }}</n-text>
                <n-text depth="3" class="lane-subtitle">{{ column.subtitle }}</n-text>
              </div>
              <n-tag size="small" round>{{ column.items.length }}</n-tag>
            </header>

            <div class="lane-body">
              <n-card
                v-for="item in column.items"
                :key="item.id"
                class="work-card"
                :bordered="false"
                draggable="true"
                @dragstart="onDragStart($event, item.id, column.id)"
                @dragend="onDragEnd"
              >
                <div class="card-header">
                  <n-text class="card-title">{{ item.title }}</n-text>
                  <n-tag v-if="item.tag" size="tiny" :type="item.tagType">{{ item.tag }}</n-tag>
                </div>
                <n-text depth="3" class="card-meta">{{ item.meta }}</n-text>
                <div class="card-footer">
                  <n-tag size="small" type="info" round>{{ item.assignee }}</n-tag>
                  <n-text depth="3">{{ item.time }}</n-text>
                </div>
              </n-card>
              <div v-if="!column.items.length" class="empty-state">
                <n-text depth="3">Kéo thả thẻ vào đây</n-text>
              </div>
            </div>
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
  NTag,
  NText,
  type GlobalThemeOverrides
} from "naive-ui";
import { reactive, ref } from "vue";

type WorkItem = {
  id: string;
  title: string;
  meta: string;
  assignee: string;
  time: string;
  tag?: string;
  tagType?: "info" | "success" | "warning" | "error";
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
const dragOverColumn = ref<string | null>(null);

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
        tagType: "warning"
      },
      {
        id: "item-2",
        title: "Review bản thiết kế UI/UX",
        meta: "Figma: Mobile + Desktop",
        assignee: "You",
        time: "10:30",
        tag: "Design",
        tagType: "info"
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
        tagType: "success"
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
        time: "08:45"
      }
    ]
  }
]);

const themeOverrides: GlobalThemeOverrides = {
  common: {
    primaryColor: "#2563eb",
    primaryColorHover: "#1d4ed8",
    borderRadius: "14px"
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

function onDragStart(event: DragEvent, itemId: string, columnId: string) {
  const payload = JSON.stringify({ itemId, columnId });
  event.dataTransfer?.setData("text/plain", payload);
  event.dataTransfer?.setDragImage(new Image(), 0, 0);
}

function onDragOver(columnId: string) {
  dragOverColumn.value = columnId;
}

function onDragLeave() {
  dragOverColumn.value = null;
}

function onDrop(event: DragEvent, targetColumnId: string) {
  const payload = event.dataTransfer?.getData("text/plain");
  dragOverColumn.value = null;
  if (!payload) return;
  const { itemId, columnId } = JSON.parse(payload) as { itemId: string; columnId: string };
  if (columnId === targetColumnId) return;
  moveItem(itemId, columnId, targetColumnId);
}

function onDragEnd() {
  dragOverColumn.value = null;
}

function moveItem(itemId: string, fromColumnId: string, toColumnId: string) {
  const fromColumn = columns.find((column) => column.id === fromColumnId);
  const toColumn = columns.find((column) => column.id === toColumnId);
  if (!fromColumn || !toColumn) return;
  const itemIndex = fromColumn.items.findIndex((item) => item.id === itemId);
  if (itemIndex === -1) return;
  const [item] = fromColumn.items.splice(itemIndex, 1);
  toColumn.items.unshift(item);
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
    tagType: "info"
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
  font-family: "Inter", system-ui, sans-serif;
  background: #f3f4f6;
  color: #111827;
}

.app {
  min-height: 100vh;
  background: radial-gradient(circle at top, #eef2ff 0%, #f8fafc 55%, #f3f4f6 100%);
}

.hero {
  padding: 32px 32px 20px;
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 24px;
  background: transparent;
}

.hero-title {
  margin: 8px 0 6px;
  font-weight: 700;
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
  grid-template-columns: minmax(0, 1.2fr) minmax(0, 1fr);
  gap: 16px;
  margin-bottom: 24px;
}

.toolbar-left {
  display: flex;
  gap: 12px;
  align-items: center;
}

.toolbar-right :deep(textarea) {
  border-radius: 12px;
  min-height: 72px;
}

.board {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
  gap: 16px;
}

.lane {
  background: rgba(255, 255, 255, 0.8);
  border-radius: 18px;
  padding: 16px;
  min-height: 420px;
  box-shadow: 0 12px 30px rgba(15, 23, 42, 0.08);
  transition: border 0.2s ease, box-shadow 0.2s ease;
  border: 2px dashed transparent;
}

.lane--over {
  border-color: rgba(37, 99, 235, 0.6);
  box-shadow: 0 16px 40px rgba(37, 99, 235, 0.12);
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
  box-shadow: 0 10px 26px rgba(15, 23, 42, 0.1);
  border-radius: 16px;
  padding: 12px;
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

.empty-state {
  border: 2px dashed rgba(148, 163, 184, 0.5);
  border-radius: 14px;
  padding: 18px;
  text-align: center;
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
}
</style>

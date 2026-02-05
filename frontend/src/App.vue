<template>
  <n-config-provider :theme-overrides="themeOverrides">
    <n-layout class="app">
      <n-layout-header class="hero" bordered>
        <div class="hero-copy">
          <n-text class="eyebrow" depth="3">Daily Worklog</n-text>
          <n-h1 class="hero-title">Bảng kéo-thả công việc mỗi ngày</n-h1>
          <n-text depth="3">
            Kéo thả thẻ giữa các cột và lọc theo ngày để theo dõi tiến độ.
          </n-text>
        </div>
        <div class="status">
          <template v-if="isAuthenticated">
            <n-tag type="success" size="small">Xin chào, {{ authDisplayName }}</n-tag>
            <n-tag type="info" size="small">Hôm nay: {{ todayLabel }}</n-tag>
            <div class="status-actions">
              <n-button secondary size="small" @click="exportLog">Xuất báo cáo</n-button>
              <n-button tertiary size="small" @click="handleLogout">Đăng xuất</n-button>
            </div>
          </template>
          <template v-else>
            <n-tag type="info" size="small">Hôm nay: {{ todayLabel }}</n-tag>
            <n-text depth="3" class="login-prompt">Vui lòng đăng nhập để xem bảng công việc.</n-text>
          </template>
        </div>
      </n-layout-header>

      <n-layout-content class="content">
        <section v-if="!isAuthenticated" class="login">
          <n-card class="login-card" :bordered="false">
            <div class="auth-toggle">
              <n-button
                size="small"
                :type="authMode === 'login' ? 'primary' : 'tertiary'"
                @click="switchAuthMode('login')"
              >
                Đăng nhập
              </n-button>
              <n-button
                size="small"
                :type="authMode === 'register' ? 'primary' : 'tertiary'"
                @click="switchAuthMode('register')"
              >
                Đăng ký
              </n-button>
            </div>
            <n-h2 class="login-title">{{ authMode === "login" ? "Đăng nhập" : "Đăng ký" }}</n-h2>
            <n-text depth="3" class="login-subtitle">
              {{ authMode === "login" ? "Nhập thông tin tài khoản để truy cập bảng công việc." : "Tạo tài khoản mới để bắt đầu." }}
            </n-text>
            <div v-if="authMode === 'login'" class="login-fields">
              <div class="input-stack">
                <n-text class="field-label">Email</n-text>
                <n-input
                  v-model:value="loginEmail"
                  placeholder="email@domain.com"
                  size="large"
                  :status="loginErrors.email ? 'error' : undefined"
                />
                <n-text v-if="loginErrors.email" class="field-error">{{ loginErrors.email }}</n-text>
              </div>
              <div class="input-stack">
                <n-text class="field-label">Mật khẩu</n-text>
                <n-input
                  v-model:value="loginPassword"
                  type="password"
                  show-password-on="click"
                  placeholder="••••••••"
                  size="large"
                  :status="loginErrors.password ? 'error' : undefined"
                  @keyup.enter="handleLogin"
                />
                <n-text v-if="loginErrors.password" class="field-error">
                  {{ loginErrors.password }}
                </n-text>
              </div>
            </div>
            <div v-else class="login-fields">
              <div class="input-stack">
                <n-text class="field-label">Họ và tên</n-text>
                <n-input
                  v-model:value="registerName"
                  placeholder="Nguyễn Văn A"
                  size="large"
                  :status="registerErrors.name ? 'error' : undefined"
                />
                <n-text v-if="registerErrors.name" class="field-error">{{ registerErrors.name }}</n-text>
              </div>
              <div class="input-stack">
                <n-text class="field-label">Email</n-text>
                <n-input
                  v-model:value="registerEmail"
                  placeholder="email@domain.com"
                  size="large"
                  :status="registerErrors.email ? 'error' : undefined"
                />
                <n-text v-if="registerErrors.email" class="field-error">{{ registerErrors.email }}</n-text>
              </div>
              <div class="input-stack">
                <n-text class="field-label">Mật khẩu</n-text>
                <n-input
                  v-model:value="registerPassword"
                  type="password"
                  show-password-on="click"
                  placeholder="Tối thiểu 6 ký tự"
                  size="large"
                  :status="registerErrors.password ? 'error' : undefined"
                />
                <n-text v-if="registerErrors.password" class="field-error">
                  {{ registerErrors.password }}
                </n-text>
              </div>
              <div class="input-stack">
                <n-text class="field-label">Nhập lại mật khẩu</n-text>
                <n-input
                  v-model:value="registerConfirm"
                  type="password"
                  show-password-on="click"
                  placeholder="Nhập lại mật khẩu"
                  size="large"
                  :status="registerErrors.confirm ? 'error' : undefined"
                  @keyup.enter="handleRegister"
                />
                <n-text v-if="registerErrors.confirm" class="field-error">
                  {{ registerErrors.confirm }}
                </n-text>
              </div>
            </div>
            <n-button
              type="primary"
              size="large"
              :loading="authMode === 'login' ? loginLoading : registerLoading"
              @click="authMode === 'login' ? handleLogin() : handleRegister()"
            >
              {{ authMode === "login" ? "Đăng nhập" : "Tạo tài khoản" }}
            </n-button>
            <n-alert
              v-if="authMode === 'login' ? loginErrors.general : registerErrors.general"
              type="error"
              class="login-alert"
              :title="authMode === 'login' ? 'Không thể đăng nhập' : 'Không thể đăng ký'"
            >
              {{ authMode === "login" ? loginErrors.general : registerErrors.general }}
            </n-alert>
            <div class="auth-footer">
              <n-text depth="3">
                {{ authMode === "login" ? "Chưa có tài khoản?" : "Đã có tài khoản?" }}
              </n-text>
              <n-button
                text
                size="small"
                class="auth-link"
                @click="switchAuthMode(authMode === 'login' ? 'register' : 'login')"
              >
                {{ authMode === "login" ? "Đăng ký ngay" : "Đăng nhập" }}
              </n-button>
            </div>
          </n-card>
        </section>

        <template v-else>
          <section class="toolbar">
            <div class="toolbar-left">
              <div class="input-stack">
                <n-input
                  v-model:value="newItemTitle"
                  placeholder="Thêm việc mới (ví dụ: Review PR / Gọi khách hàng)"
                  size="large"
                  :status="newItemError ? 'error' : undefined"
                  @keyup.enter="addItem"
                />
                <n-text v-if="newItemError" class="field-error">{{ newItemError }}</n-text>
              </div>
              <n-button type="primary" size="large" @click="addItem">Thêm việc</n-button>
              <div class="quick-controls">
              <n-date-picker v-model:value="newItemDueDate" type="datetime" size="large" />
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
                </div>
                <n-tag size="small" round>{{ visibleCount(column.items) }}</n-tag>
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
                @end="handleDragEnd"
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
        </template>
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
  NH2,
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
import { computed, onMounted, ref, watch } from "vue";
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
  items: WorkItem[];
};

type AuthUser = {
  id: string;
  email: string;
  name: string;
};

type LoginErrors = {
  email?: string;
  password?: string;
  general?: string;
};

type RegisterErrors = {
  name?: string;
  email?: string;
  password?: string;
  confirm?: string;
  general?: string;
};

const API_BASE = import.meta.env.VITE_API_BASE ?? "http://localhost:3001";
const AUTH_STORAGE_KEY = "dwl_auth";
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const todayLabel = new Date().toLocaleDateString("vi-VN", {
  weekday: "long",
  year: "numeric",
  month: "long",
  day: "numeric"
});

const authToken = ref<string | null>(null);
const authUser = ref<AuthUser | null>(null);
const authMode = ref<"login" | "register">("login");
const loginEmail = ref("");
const loginPassword = ref("");
const loginLoading = ref(false);
const loginErrors = ref<LoginErrors>({});
const registerName = ref("");
const registerEmail = ref("");
const registerPassword = ref("");
const registerConfirm = ref("");
const registerLoading = ref(false);
const registerErrors = ref<RegisterErrors>({});

const newItemTitle = ref("");
const newItemError = ref("");
const dailyNote = ref("");
const selectedRange = ref<[number, number] | null>([
  startOfDay(new Date()).getTime(),
  startOfDay(new Date()).getTime()
]);
const newItemDueDate = ref<number | null>(Date.now());
const newItemImportant = ref(false);

const columns = ref<WorkColumn[]>([]);
const hasServerColumns = ref(false);

const fallbackColumns: WorkColumn[] = [
  { id: "backlog", title: "Cần làm", items: [] },
  { id: "doing", title: "Đang làm", items: [] },
  { id: "done", title: "Hoàn tất", items: [] }
];

const isAuthenticated = computed(() => Boolean(authToken.value));
const authDisplayName = computed(() => {
  if (!authUser.value) return "User";
  return authUser.value.name || authUser.value.email || "User";
});

const importantSummary = computed(() => {
  const { startDate } = getSelectedRange();
  const endDate = new Date(startDate);
  endDate.setDate(startDate.getDate() + 3);
  const items = columns.value.flatMap((column) => column.items);
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
  return new Date(value).toLocaleString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false
  });
}

function validateLogin() {
  const errors: LoginErrors = {};
  const email = loginEmail.value.trim();
  const password = loginPassword.value;
  if (!email) {
    errors.email = "Vui lòng nhập email.";
  } else if (!EMAIL_REGEX.test(email)) {
    errors.email = "Email không hợp lệ.";
  }
  if (!password) {
    errors.password = "Vui lòng nhập mật khẩu.";
  }
  loginErrors.value = errors;
  return Object.keys(errors).length === 0;
}

function switchAuthMode(mode: "login" | "register") {
  authMode.value = mode;
  loginErrors.value = {};
  registerErrors.value = {};
}

function validateRegister() {
  const errors: RegisterErrors = {};
  const name = registerName.value.trim();
  const email = registerEmail.value.trim();
  const password = registerPassword.value;
  const confirm = registerConfirm.value;

  if (!name) {
    errors.name = "Vui lòng nhập họ tên.";
  }
  if (!email) {
    errors.email = "Vui lòng nhập email.";
  } else if (!EMAIL_REGEX.test(email)) {
    errors.email = "Email không hợp lệ.";
  }
  if (!password) {
    errors.password = "Vui lòng nhập mật khẩu.";
  } else if (password.length < 6) {
    errors.password = "Mật khẩu cần tối thiểu 6 ký tự.";
  }
  if (!confirm) {
    errors.confirm = "Vui lòng nhập lại mật khẩu.";
  } else if (password && password !== confirm) {
    errors.confirm = "Mật khẩu nhập lại không khớp.";
  }

  registerErrors.value = errors;
  return Object.keys(errors).length === 0;
}

function setSession(token: string, user: AuthUser) {
  authToken.value = token;
  authUser.value = user;
  localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify({ token, user }));
}

function clearSession() {
  authToken.value = null;
  authUser.value = null;
  localStorage.removeItem(AUTH_STORAGE_KEY);
}

function restoreSession() {
  const raw = localStorage.getItem(AUTH_STORAGE_KEY);
  if (!raw) return;
  try {
    const parsed = JSON.parse(raw);
    if (parsed?.token && parsed?.user) {
      authToken.value = parsed.token;
      authUser.value = parsed.user;
    }
  } catch (error) {
    localStorage.removeItem(AUTH_STORAGE_KEY);
  }
}

async function handleLogin() {
  if (!validateLogin()) return;
  loginLoading.value = true;
  loginErrors.value = {};
  try {
    const response = await fetch(`${API_BASE}/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        email: loginEmail.value.trim(),
        password: loginPassword.value
      })
    });
    if (!response.ok) {
      const data = await response.json().catch(() => ({}));
      throw new Error(data.error || "Đăng nhập thất bại.");
    }
    const data = await response.json();
    setSession(data.token, data.user);
    loginPassword.value = "";
    await loadColumns();
  } catch (error) {
    loginErrors.value = {
      general: error instanceof Error ? error.message : "Đăng nhập thất bại."
    };
  } finally {
    loginLoading.value = false;
  }
}

async function handleRegister() {
  if (!validateRegister()) return;
  registerLoading.value = true;
  registerErrors.value = {};
  try {
    const response = await fetch(`${API_BASE}/auth/register`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        name: registerName.value.trim(),
        email: registerEmail.value.trim(),
        password: registerPassword.value
      })
    });
    if (!response.ok) {
      const data = await response.json().catch(() => ({}));
      throw new Error(data.error || "Đăng ký thất bại.");
    }
    const data = await response.json();
    setSession(data.token, data.user);
    registerPassword.value = "";
    registerConfirm.value = "";
    await loadColumns();
  } catch (error) {
    registerErrors.value = {
      general: error instanceof Error ? error.message : "Đăng ký thất bại."
    };
  } finally {
    registerLoading.value = false;
  }
}

async function handleLogout() {
  if (!authToken.value) return;
  try {
    await fetch(`${API_BASE}/auth/logout`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${authToken.value}`
      }
    });
  } catch (error) {
    console.error(error);
  } finally {
    clearSession();
    columns.value = [];
    hasServerColumns.value = false;
  }
}

async function addItem() {
  if (!authToken.value) return;
  const title = newItemTitle.value.trim();
  if (!title) {
    newItemError.value = "Vui lòng nhập tiêu đề công việc.";
    return;
  }
  newItemError.value = "";
  if (!hasServerColumns.value || !columns.value.length) {
    newItemError.value = "Chưa có cột công việc trên hệ thống để thêm.";
    return;
  }

  try {
    const response = await fetch(`${API_BASE}/worklog/items`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${authToken.value}`
      },
      body: JSON.stringify({
        columnId: columns.value[0].id,
        title,
        dueDate: newItemDueDate.value ? new Date(newItemDueDate.value).toISOString() : undefined,
        important: newItemImportant.value
      })
    });
    if (response.status === 401) {
      handleUnauthorized("Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.");
      return;
    }
    if (!response.ok) {
      const data = await response.json().catch(() => ({}));
      throw new Error(data.error || "Không thể thêm công việc.");
    }
    newItemTitle.value = "";
    await loadColumns();
  } catch (error) {
    newItemError.value = error instanceof Error ? error.message : "Không thể thêm công việc.";
  }
}

function exportLog() {
  const snapshot = columns.value.map((column) => ({
    column: column.title,
    items: column.items.map((item) => item.title)
  }));
  const summary = JSON.stringify({ date: todayLabel, note: dailyNote.value, snapshot }, null, 2);
  navigator.clipboard?.writeText(summary);
}

async function persistBoardOrder() {
  if (!authToken.value) return;
  if (!hasServerColumns.value) return;
  const payload = {
    columns: columns.value.map((column) => ({
      columnId: column.id,
      itemIds: column.items.map((item) => item.id)
    }))
  };
  try {
    const response = await fetch(`${API_BASE}/worklog/items/reorder`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${authToken.value}`
      },
      body: JSON.stringify(payload)
    });
    if (response.status === 401) {
      handleUnauthorized("Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.");
      return;
    }
    if (!response.ok) {
      throw new Error("Không thể lưu thứ tự công việc.");
    }
  } catch (error) {
    console.error(error);
  }
}

function handleDragEnd() {
  persistBoardOrder();
}

function handleUnauthorized(message: string) {
  clearSession();
  columns.value = [];
  hasServerColumns.value = false;
  authMode.value = "login";
  registerErrors.value = {};
  loginErrors.value = { general: message };
}

async function loadColumns() {
  if (!authToken.value) return;
  try {
    const { startDate, endDate } = getSelectedRange();
    const lookahead = new Date(startDate);
    lookahead.setDate(startDate.getDate() + 3);
    const apiEnd = endDate > lookahead ? endDate : lookahead;
    const params = new URLSearchParams({
      start: startDate.toISOString(),
      end: apiEnd.toISOString()
    });
    const response = await fetch(`${API_BASE}/worklog?${params.toString()}`, {
      headers: {
        Authorization: `Bearer ${authToken.value}`
      }
    });
    if (response.status === 401) {
      handleUnauthorized("Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.");
      return;
    }
    if (!response.ok) {
      throw new Error("Failed to fetch worklog");
    }
    const data = await response.json();
    if (Array.isArray(data.columns) && data.columns.length > 0) {
      columns.value = data.columns;
      hasServerColumns.value = true;
    } else {
      columns.value = createEmptyColumns();
      hasServerColumns.value = false;
    }
  } catch (error) {
    console.error(error);
    columns.value = createEmptyColumns();
    hasServerColumns.value = false;
  }
}

watch(selectedRange, () => {
  if (isAuthenticated.value) {
    loadColumns();
  }
});

watch(newItemTitle, (value) => {
  if (newItemError.value && value.trim()) {
    newItemError.value = "";
  }
});

watch(loginEmail, () => {
  if (loginErrors.value.email || loginErrors.value.general) {
    loginErrors.value = { ...loginErrors.value, email: undefined, general: undefined };
  }
});

watch(loginPassword, () => {
  if (loginErrors.value.password || loginErrors.value.general) {
    loginErrors.value = { ...loginErrors.value, password: undefined, general: undefined };
  }
});

watch(registerName, () => {
  if (registerErrors.value.name || registerErrors.value.general) {
    registerErrors.value = { ...registerErrors.value, name: undefined, general: undefined };
  }
});

watch(registerEmail, () => {
  if (registerErrors.value.email || registerErrors.value.general) {
    registerErrors.value = { ...registerErrors.value, email: undefined, general: undefined };
  }
});

watch(registerPassword, () => {
  if (registerErrors.value.password || registerErrors.value.general) {
    registerErrors.value = { ...registerErrors.value, password: undefined, general: undefined };
  }
});

watch(registerConfirm, () => {
  if (registerErrors.value.confirm || registerErrors.value.general) {
    registerErrors.value = { ...registerErrors.value, confirm: undefined, general: undefined };
  }
});

onMounted(() => {
  restoreSession();
  if (authToken.value) {
    loadColumns();
  }
});

function createEmptyColumns(): WorkColumn[] {
  return fallbackColumns.map((column) => ({
    id: column.id,
    title: column.title,
    items: []
  }));
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
  text-align: right;
}

.status-actions {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
  justify-content: flex-end;
}

.login-prompt {
  max-width: 220px;
}

.content {
  padding: 0 32px 48px;
}

.login {
  display: grid;
  place-items: center;
  padding: 48px 12px 24px;
}

.login-card {
  width: min(420px, 100%);
  border-radius: 22px;
  padding: 26px;
  box-shadow: 0 20px 44px rgba(15, 23, 42, 0.16);
  background: rgba(255, 255, 255, 0.92);
}

.auth-toggle {
  display: inline-flex;
  gap: 8px;
  padding: 6px;
  border-radius: 999px;
  background: rgba(226, 232, 240, 0.7);
  margin-bottom: 16px;
}

.auth-footer {
  margin-top: 14px;
  display: flex;
  align-items: center;
  gap: 6px;
}

.auth-link {
  font-weight: 600;
}

.login-title {
  margin: 0 0 6px;
}

.login-subtitle {
  margin-bottom: 18px;
  display: inline-block;
}

.login-fields {
  display: grid;
  gap: 14px;
  margin-bottom: 18px;
}

.login-alert {
  margin-top: 16px;
  border-radius: 14px;
}

.mono {
  font-family: "Courier New", ui-monospace, monospace;
  font-weight: 600;
}

.field-label {
  font-size: 12px;
  font-weight: 600;
  color: #475569;
}

.field-error {
  font-size: 12px;
  color: #dc2626;
}

.input-stack {
  display: flex;
  flex-direction: column;
  gap: 6px;
  min-width: 240px;
}

.toolbar {
  display: grid;
  grid-template-columns: minmax(0, 1.35fr) minmax(0, 1fr);
  gap: 18px;
  margin-bottom: 18px;
  padding: 16px;
  background: rgba(255, 255, 255, 0.86);
  border-radius: 20px;
  box-shadow: 0 14px 30px rgba(15, 23, 42, 0.08);
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
  padding: 12px 16px;
  background: rgba(255, 255, 255, 0.8);
  border-radius: 18px;
  box-shadow: 0 10px 24px rgba(15, 23, 42, 0.06);
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
  padding: 8px;
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
    text-align: left;
  }

  .status-actions {
    justify-content: flex-start;
  }

  .toolbar {
    grid-template-columns: 1fr;
  }

  .toolbar-left {
    flex-direction: column;
    align-items: stretch;
  }

  .input-stack {
    width: 100%;
  }

  .quick-controls {
    flex-direction: column;
    align-items: stretch;
  }
}
</style>

<template>
  <n-config-provider :theme-overrides="themeOverrides">
    <n-layout class="app">
      <n-layout-header class="hero" bordered>
        <div>
          <n-text class="eyebrow" depth="3">Daily Worklog AI</n-text>
          <n-h1 class="hero-title">Speech-to-worklog playground</n-h1>
          <n-text depth="3">
            Dùng nhanh ba prompt: Parse transcript, EOD summary, Smart Inbox. Backend chạy ở cổng 3001.
          </n-text>
        </div>
        <div class="status">
          <n-tag :type="backendStatusType" size="small">{{ backendStatusLabel }}</n-tag>
          <n-button secondary size="small" @click="checkBackend">Check backend</n-button>
        </div>
      </n-layout-header>

      <n-layout-content class="content">
        <n-grid x-gap="16" y-gap="16" cols="1 900:2">
          <n-grid-item>
            <n-card title="Prompt 1 — Parse transcript" class="card" :bordered="false">
              <n-form label-placement="top" :show-feedback="false">
                <n-grid x-gap="16" y-gap="12" cols="1 640:2">
                  <n-grid-item>
                    <n-form-item label="Now (ISO)">
                      <n-input v-model:value="parseForm.now" placeholder="2024-07-05T09:00:00+08:00" />
                    </n-form-item>
                  </n-grid-item>
                  <n-grid-item>
                    <n-form-item label="Known projects (JSON)">
                      <n-input v-model:value="parseForm.knownProjects" type="textarea" :autosize="{ minRows: 3 }" />
                    </n-form-item>
                  </n-grid-item>
                  <n-grid-item>
                    <n-form-item label="Known people (JSON)">
                      <n-input v-model:value="parseForm.knownPeople" type="textarea" :autosize="{ minRows: 3 }" />
                    </n-form-item>
                  </n-grid-item>
                  <n-grid-item span="2">
                    <n-form-item label="Transcript">
                      <n-input
                        v-model:value="parseForm.transcript"
                        type="textarea"
                        :autosize="{ minRows: 4 }"
                        placeholder="Ví dụ: Đã fix xong bug login hôm nay, mai làm report."
                      />
                    </n-form-item>
                  </n-grid-item>
                </n-grid>
              </n-form>
              <div class="actions">
                <n-button type="primary" @click="runParse">Parse</n-button>
              </div>
              <n-code v-if="parseOutput" :code="parseOutput" language="json" class="output" />
            </n-card>
          </n-grid-item>

          <n-grid-item>
            <n-card title="Prompt 2 — EOD summary" class="card" :bordered="false">
              <n-form label-placement="top" :show-feedback="false">
                <n-grid x-gap="16" y-gap="12" cols="1">
                  <n-grid-item>
                    <n-form-item label="Date">
                      <n-input v-model:value="summaryForm.date" type="date" />
                    </n-form-item>
                  </n-grid-item>
                  <n-grid-item>
                    <n-form-item label="Items JSON">
                      <n-input v-model:value="summaryForm.items" type="textarea" :autosize="{ minRows: 4 }" />
                    </n-form-item>
                  </n-grid-item>
                </n-grid>
              </n-form>
              <div class="actions">
                <n-button type="primary" @click="runSummary">Generate summary</n-button>
              </div>
              <n-code v-if="summaryOutput" :code="summaryOutput" language="json" class="output" />
            </n-card>
          </n-grid-item>

          <n-grid-item span="2">
            <n-card title="Prompt 3 — Smart Inbox" class="card" :bordered="false">
              <n-form label-placement="top" :show-feedback="false">
                <n-grid x-gap="16" y-gap="12" cols="1 700:3">
                  <n-grid-item span="2">
                    <n-form-item label="Item JSON">
                      <n-input v-model:value="inboxForm.item" type="textarea" :autosize="{ minRows: 3 }" />
                    </n-form-item>
                  </n-grid-item>
                  <n-grid-item>
                    <n-form-item label="Known projects (JSON)">
                      <n-input v-model:value="inboxForm.knownProjects" type="textarea" :autosize="{ minRows: 3 }" />
                    </n-form-item>
                  </n-grid-item>
                  <n-grid-item>
                    <n-form-item label="Recent items (JSON)">
                      <n-input v-model:value="inboxForm.recentItems" type="textarea" :autosize="{ minRows: 3 }" />
                    </n-form-item>
                  </n-grid-item>
                </n-grid>
              </n-form>
              <div class="actions">
                <n-button type="primary" @click="runInbox">Suggest action</n-button>
              </div>
              <n-code v-if="inboxOutput" :code="inboxOutput" language="json" class="output" />
            </n-card>
          </n-grid-item>
        </n-grid>
      </n-layout-content>
    </n-layout>
  </n-config-provider>
</template>

<script setup lang="ts">
import {
  NButton,
  NCard,
  NCode,
  NConfigProvider,
  NForm,
  NFormItem,
  NGrid,
  NGridItem,
  NH1,
  NInput,
  NLayout,
  NLayoutContent,
  NLayoutHeader,
  NTag,
  NText,
  type GlobalThemeOverrides
} from "naive-ui";
import { computed, reactive, ref } from "vue";

const backendStatus = ref<"idle" | "online" | "offline">("idle");

const parseForm = reactive({
  now: new Date().toISOString(),
  transcript: "",
  knownProjects: "[]",
  knownPeople: "[]"
});

const summaryForm = reactive({
  date: new Date().toISOString().slice(0, 10),
  items: "[]"
});

const inboxForm = reactive({
  item: "{}",
  knownProjects: "[]",
  recentItems: "[]"
});

const parseOutput = ref("");
const summaryOutput = ref("");
const inboxOutput = ref("");

const backendStatusLabel = computed(() => {
  if (backendStatus.value === "online") return "Backend online";
  if (backendStatus.value === "offline") return "Backend offline";
  return "Backend unknown";
});

const backendStatusType = computed(() => {
  if (backendStatus.value === "online") return "success";
  if (backendStatus.value === "offline") return "error";
  return "default";
});

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

async function checkBackend() {
  try {
    const response = await fetch("http://localhost:3001/parse", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ now: new Date().toISOString(), transcript: "ping" })
    });
    backendStatus.value = response.ok ? "online" : "offline";
  } catch (error) {
    backendStatus.value = "offline";
  }
}

async function runParse() {
  parseOutput.value = "";
  const payload = {
    now: parseForm.now,
    transcript: parseForm.transcript,
    known_projects: safeParse(parseForm.knownProjects, []),
    known_people: safeParse(parseForm.knownPeople, [])
  };
  parseOutput.value = await postJson("http://localhost:3001/parse", payload);
}

async function runSummary() {
  summaryOutput.value = "";
  const payload = {
    date: summaryForm.date,
    items: safeParse(summaryForm.items, [])
  };
  summaryOutput.value = await postJson("http://localhost:3001/eod-summary", payload);
}

async function runInbox() {
  inboxOutput.value = "";
  const payload = {
    item: safeParse(inboxForm.item, {}),
    known_projects: safeParse(inboxForm.knownProjects, []),
    recent_items: safeParse(inboxForm.recentItems, [])
  };
  inboxOutput.value = await postJson("http://localhost:3001/smart-inbox", payload);
}

async function postJson(url: string, payload: unknown) {
  try {
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    const text = await response.text();
    return prettyJson(text);
  } catch (error) {
    return JSON.stringify({ error: "Cannot reach backend" }, null, 2);
  }
}

function safeParse<T>(value: string, fallback: T): T {
  try {
    return JSON.parse(value) as T;
  } catch (error) {
    return fallback;
  }
}

function prettyJson(raw: string) {
  try {
    return JSON.stringify(JSON.parse(raw), null, 2);
  } catch (error) {
    return raw;
  }
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
  padding: 32px 32px 24px;
  display: flex;
  justify-content: space-between;
  align-items: center;
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

.card {
  box-shadow: 0 12px 30px rgba(15, 23, 42, 0.08);
}

.actions {
  display: flex;
  justify-content: flex-end;
  margin-top: 8px;
}

.output {
  margin-top: 16px;
  border-radius: 12px;
  background: #0f172a;
  color: #e2e8f0;
}
</style>

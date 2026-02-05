<template>
  <div class="app">
    <header class="hero">
      <div>
        <p class="eyebrow">Daily Worklog AI</p>
        <h1>Speech-to-worklog playground</h1>
        <p class="subtitle">
          Dùng nhanh ba prompt: Parse transcript, EOD summary, Smart Inbox. Backend chạy ở cổng 3001.
        </p>
      </div>
      <div class="status">
        <span :class="['badge', backendStatus]">{{ backendStatusLabel }}</span>
        <button class="ghost" type="button" @click="checkBackend">Check backend</button>
      </div>
    </header>

    <section class="card">
      <h2>Prompt 1 — Parse transcript</h2>
      <div class="grid">
        <label>
          <span>Now (ISO)</span>
          <input v-model="parseForm.now" type="text" placeholder="2024-07-05T09:00:00+08:00" />
        </label>
        <label>
          <span>Known projects (JSON)</span>
          <textarea v-model="parseForm.knownProjects" rows="3"></textarea>
        </label>
        <label>
          <span>Known people (JSON)</span>
          <textarea v-model="parseForm.knownPeople" rows="3"></textarea>
        </label>
        <label class="full">
          <span>Transcript</span>
          <textarea v-model="parseForm.transcript" rows="4" placeholder="Ví dụ: Đã fix xong bug login hôm nay, mai làm report."></textarea>
        </label>
      </div>
      <div class="actions">
        <button type="button" @click="runParse">Parse</button>
      </div>
      <pre class="output" v-if="parseOutput">{{ parseOutput }}</pre>
    </section>

    <section class="card">
      <h2>Prompt 2 — EOD summary</h2>
      <div class="grid">
        <label>
          <span>Date</span>
          <input v-model="summaryForm.date" type="date" />
        </label>
        <label class="full">
          <span>Items JSON</span>
          <textarea v-model="summaryForm.items" rows="4"></textarea>
        </label>
      </div>
      <div class="actions">
        <button type="button" @click="runSummary">Generate summary</button>
      </div>
      <pre class="output" v-if="summaryOutput">{{ summaryOutput }}</pre>
    </section>

    <section class="card">
      <h2>Prompt 3 — Smart Inbox</h2>
      <div class="grid">
        <label class="full">
          <span>Item JSON</span>
          <textarea v-model="inboxForm.item" rows="3"></textarea>
        </label>
        <label>
          <span>Known projects (JSON)</span>
          <textarea v-model="inboxForm.knownProjects" rows="3"></textarea>
        </label>
        <label>
          <span>Recent items (JSON)</span>
          <textarea v-model="inboxForm.recentItems" rows="3"></textarea>
        </label>
      </div>
      <div class="actions">
        <button type="button" @click="runInbox">Suggest action</button>
      </div>
      <pre class="output" v-if="inboxOutput">{{ inboxOutput }}</pre>
    </section>
  </div>
</template>

<script setup lang="ts">
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
  background: #f5f7fb;
  color: #162238;
}

.app {
  max-width: 1000px;
  margin: 0 auto;
  padding: 32px 24px 64px;
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.hero {
  background: white;
  padding: 24px;
  border-radius: 16px;
  box-shadow: 0 10px 30px rgba(15, 23, 42, 0.08);
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 24px;
}

.eyebrow {
  font-size: 12px;
  font-weight: 600;
  letter-spacing: 0.2em;
  color: #5f6b7c;
  margin: 0 0 8px;
  text-transform: uppercase;
}

h1 {
  margin: 0 0 8px;
  font-size: 28px;
}

.subtitle {
  margin: 0;
  color: #4a5568;
}

.status {
  display: flex;
  flex-direction: column;
  gap: 12px;
  align-items: flex-end;
}

.badge {
  padding: 6px 12px;
  border-radius: 999px;
  font-size: 12px;
  font-weight: 600;
  background: #e2e8f0;
  color: #3b4b63;
}

.badge.online {
  background: #dcfce7;
  color: #166534;
}

.badge.offline {
  background: #fee2e2;
  color: #991b1b;
}

.card {
  background: white;
  padding: 24px;
  border-radius: 16px;
  box-shadow: 0 10px 30px rgba(15, 23, 42, 0.08);
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 16px;
}

label {
  display: flex;
  flex-direction: column;
  gap: 8px;
  font-size: 13px;
  font-weight: 600;
  color: #4a5568;
}

label.full {
  grid-column: 1 / -1;
}

input,
textarea {
  padding: 10px 12px;
  border-radius: 10px;
  border: 1px solid #cbd5f5;
  font-size: 14px;
  font-family: "Inter", system-ui, sans-serif;
}

textarea {
  resize: vertical;
}

.actions {
  display: flex;
  justify-content: flex-end;
}

button {
  border: none;
  background: #2563eb;
  color: white;
  padding: 10px 18px;
  border-radius: 10px;
  font-weight: 600;
  cursor: pointer;
}

button.ghost {
  background: #e2e8f0;
  color: #1f2937;
}

.output {
  background: #0f172a;
  color: #e2e8f0;
  padding: 16px;
  border-radius: 12px;
  font-size: 12px;
  overflow-x: auto;
}
</style>

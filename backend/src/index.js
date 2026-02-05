import cors from "cors";
import express from "express";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc.js";
import timezone from "dayjs/plugin/timezone.js";

dayjs.extend(utc);
dayjs.extend(timezone);

const app = express();
app.use(
  cors({
    origin: ["http://localhost:3000"],
    methods: ["GET", "POST"],
    allowedHeaders: ["Content-Type"]
  })
);
app.use(express.json({ limit: "1mb" }));

const TIMEZONE = "Asia/Singapore";

const ENTRY_RULES = [
  { type: "done", keywords: ["xong", "đã", "hoàn thành", "fix xong", "merge rồi", "done", "finished", "completed"] },
  { type: "in_progress", keywords: ["đang", "chưa", "dở", "tiếp tục", "in progress", "ongoing"] },
  { type: "todo", keywords: ["cần", "phải", "làm", "todo", "mai làm", "need to", "to do"] },
  { type: "blocker", keywords: ["bị lỗi", "kẹt", "block", "chưa biết", "đụng", "không chạy", "blocked", "issue"] }
];

const PRIORITY_RULES = [
  { value: 5, keywords: ["gấp", "khẩn", "urgent", "asap"] },
  { value: 1, keywords: ["low", "thấp", "không gấp"] }
];

const VAGUE_TITLE = /(linh tinh|mấy thứ|vài thứ|stuff|misc)/i;

const TIME_RANGES = [
  { keyword: "sáng", start: "09:00", end: "12:00" },
  { keyword: "chiều", start: "13:00", end: "17:00" },
  { keyword: "tối", start: "19:00", end: "22:00" },
  { keyword: "morning", start: "09:00", end: "12:00" },
  { keyword: "afternoon", start: "13:00", end: "17:00" },
  { keyword: "evening", start: "19:00", end: "22:00" }
];

function detectLanguage(text) {
  const hasVietnamese = /[ăâđêôơưáàảãạấầẩẫậắằẳẵặéèẻẽẹếềểễệíìỉĩịóòỏõọốồổỗộớờởỡợúùủũụứừửữựýỳỷỹỵ]/i.test(text);
  const hasEnglish = /[a-z]/i.test(text);
  if (hasVietnamese && hasEnglish) return "mixed";
  if (hasVietnamese) return "vi";
  return "en";
}

function splitSentences(transcript) {
  return transcript
    .split(/\n|[.!?;]+/)
    .map((s) => s.trim())
    .filter(Boolean);
}

function matchEntryType(sentence) {
  for (const rule of ENTRY_RULES) {
    if (rule.keywords.some((kw) => sentence.toLowerCase().includes(kw))) {
      return rule.type;
    }
  }
  return "note";
}

function matchPriority(sentence) {
  for (const rule of PRIORITY_RULES) {
    if (rule.keywords.some((kw) => sentence.toLowerCase().includes(kw))) {
      return rule.value;
    }
  }
  return 3;
}

function matchProject(sentence, knownProjects) {
  if (!Array.isArray(knownProjects)) return { id: null, name: null };
  const lowered = sentence.toLowerCase();
  const match = knownProjects.find((project) => {
    if (!project?.name) return false;
    return lowered.includes(project.name.toLowerCase());
  });
  if (!match) return { id: null, name: null };
  return { id: match.id ?? null, name: match.name ?? null };
}

function matchPeople(sentence, knownPeople) {
  if (!Array.isArray(knownPeople)) return [];
  const lowered = sentence.toLowerCase();
  return knownPeople
    .filter((person) => person && typeof person === "string")
    .filter((person) => lowered.includes(person.toLowerCase()));
}

function parseTags(sentence) {
  return Array.from(sentence.matchAll(/#([\w-]+)/g)).map((m) => m[1]);
}

function parseRefs(sentence) {
  const ticketMatch = sentence.match(/\b[A-Z]{2,10}-\d+\b/);
  const urlMatch = sentence.match(/https?:\/\/\S+/);
  const repoMatch = sentence.match(/repo\s*[:=]\s*([\w-./]+)/i);
  return {
    ticket: ticketMatch ? ticketMatch[0] : null,
    repo: repoMatch ? repoMatch[1] : null,
    url: urlMatch ? urlMatch[0] : null
  };
}

function resolveRelativeDate(now, keyword) {
  const base = dayjs.tz(now, TIMEZONE);
  if (["mai", "ngày mai", "tomorrow"].includes(keyword)) {
    return base.add(1, "day");
  }
  if (["hôm nay", "today"].includes(keyword)) {
    return base;
  }
  if (["tuần sau", "next week"].includes(keyword)) {
    return base.add(1, "week").startOf("week");
  }
  return base;
}

function parseTime(sentence, now) {
  const lowered = sentence.toLowerCase();
  const timeRange = TIME_RANGES.find((range) => lowered.includes(range.keyword));
  const dateKeyword = ["mai", "ngày mai", "tomorrow", "hôm nay", "today", "tuần sau", "next week"].find((kw) =>
    lowered.includes(kw)
  );

  if (!timeRange && !dateKeyword) {
    return { mentioned_range: { start: null, end: null }, duration_minutes: null };
  }

  const base = resolveRelativeDate(now, dateKeyword ?? "hôm nay");
  if (!timeRange) {
    const start = base.toISOString();
    return { mentioned_range: { start, end: null }, duration_minutes: null };
  }

  const start = base.format("YYYY-MM-DD") + "T" + timeRange.start + ":00";
  const end = base.format("YYYY-MM-DD") + "T" + timeRange.end + ":00";
  return {
    mentioned_range: {
      start: dayjs.tz(start, TIMEZONE).toISOString(),
      end: dayjs.tz(end, TIMEZONE).toISOString()
    },
    duration_minutes: null
  };
}

function parseDue(sentence, now) {
  const lowered = sentence.toLowerCase();
  if (lowered.includes("mai") || lowered.includes("ngày mai") || lowered.includes("tomorrow")) {
    const dueAt = dayjs.tz(now, TIMEZONE).add(1, "day").hour(9).minute(0).second(0);
    return { due_at: dueAt.toISOString(), due_hint: "tomorrow" };
  }
  if (lowered.includes("trước thứ 6") || lowered.includes("before friday")) {
    return { due_at: null, due_hint: "before Friday" };
  }
  if (lowered.includes("tuần sau") || lowered.includes("next week")) {
    return { due_at: null, due_hint: "next week" };
  }
  return { due_at: null, due_hint: null };
}

function buildFollowups(sentence, now) {
  const lowered = sentence.toLowerCase();
  if (lowered.includes("mai") || lowered.includes("tomorrow")) {
    const dueAt = dayjs.tz(now, TIMEZONE).add(1, "day").hour(9).minute(0).second(0);
    return [{ title: sentence, due_at: dueAt.toISOString() }];
  }
  return [];
}

function parseTranscript({ now, transcript, known_projects, known_people }) {
  const sentences = splitSentences(transcript);
  const items = sentences.map((sentence) => {
    const entryType = matchEntryType(sentence);
    const priority = matchPriority(sentence);
    const project = matchProject(sentence, known_projects);
    const people = matchPeople(sentence, known_people);
    const tags = parseTags(sentence);
    const refs = parseRefs(sentence);
    const time = parseTime(sentence, now);
    const due = parseDue(sentence, now);
    const followups = buildFollowups(sentence, now);

    const confidence = entryType === "note" ? 0.5 : 0.75;

    return {
      title: sentence,
      entry_type: entryType,
      project,
      tags,
      people,
      refs,
      time,
      due,
      priority,
      confidence,
      followups,
      source: {
        from: "speech",
        original_sentence: sentence
      }
    };
  });

  const needsClarification = items.length === 0 || items.some((item) => VAGUE_TITLE.test(item.title));

  return {
    raw: {
      transcript,
      language: detectLanguage(transcript)
    },
    items,
    meta: {
      needs_clarification: needsClarification,
      clarifying_questions: needsClarification ? ["Bạn có thể nói rõ hơn việc cần làm?"] : []
    }
  };
}

function summarizeEod({ date, items }) {
  const done = items.filter((item) => item.entry_type === "done");
  const inProgress = items.filter((item) => item.entry_type === "in_progress");
  const blockers = items.filter((item) => item.entry_type === "blocker");

  const followups = items.flatMap((item) => item.followups || []);
  const tomorrowPlan = [
    ...followups.map((followup) => ({
      title: followup.title,
      reason: "followup",
      priority: 3
    })),
    ...inProgress.map((item) => ({
      title: item.title,
      reason: "in_progress",
      priority: item.priority ?? 3
    }))
  ];

  const highlights = done.slice(0, 3).map((item) => item.title);

  const messageLines = [
    "*Done:*",
    ...done.map((item) => `- ${item.title}`),
    "*In progress:*",
    ...inProgress.map((item) => `- ${item.title}`)
  ];

  return {
    date,
    done: done.map((item) => ({ project: item.project?.name ?? null, title: item.title })),
    in_progress: inProgress.map((item) => ({ project: item.project?.name ?? null, title: item.title })),
    blockers: blockers.map((item) => ({ title: item.title, reason: null })),
    tomorrow_plan: tomorrowPlan,
    highlights,
    metrics: {
      done_count: done.length,
      blocker_count: blockers.length
    },
    message_md: messageLines.join("\n")
  };
}

function smartInbox({ item, known_projects, recent_items }) {
  const title = item?.title ?? "";
  const segments = title.split(/\s+và\s+|\s+&\s+|\s*,\s*/).filter(Boolean);
  if (segments.length > 1) {
    return {
      action: "split",
      suggested_edits: {
        title: null,
        entry_type: null,
        project: null,
        tags: null,
        due_at: null
      },
      split_items: segments.map((segment) => ({ title: segment })),
      question: null
    };
  }

  if (VAGUE_TITLE.test(title)) {
    return {
      action: "ask",
      suggested_edits: {
        title: null,
        entry_type: null,
        project: null,
        tags: null,
        due_at: null
      },
      split_items: [],
      question: "Bạn có thể mô tả rõ hơn task này không?"
    };
  }

  const project = matchProject(title, known_projects ?? []);
  if (project?.name) {
    return {
      action: "edit_suggest",
      suggested_edits: {
        title: null,
        entry_type: null,
        project,
        tags: null,
        due_at: null
      },
      split_items: [],
      question: null
    };
  }

  const recentMatch = (recent_items ?? []).find((recent) => recent.title === title);
  if (recentMatch) {
    return {
      action: "accept",
      suggested_edits: {
        title: null,
        entry_type: null,
        project: null,
        tags: null,
        due_at: null
      },
      split_items: [],
      question: null
    };
  }

  return {
    action: "accept",
    suggested_edits: {
      title: null,
      entry_type: null,
      project: null,
      tags: null,
      due_at: null
    },
    split_items: [],
    question: null
  };
}

app.post("/parse", (req, res) => {
  const { now, transcript, known_projects = [], known_people = [] } = req.body ?? {};
  if (!now || !transcript) {
    return res.status(400).json({ error: "Missing now or transcript" });
  }
  return res.json(parseTranscript({ now, transcript, known_projects, known_people }));
});

app.post("/eod-summary", (req, res) => {
  const { date, items = [] } = req.body ?? {};
  if (!date) {
    return res.status(400).json({ error: "Missing date" });
  }
  return res.json(summarizeEod({ date, items }));
});

app.post("/smart-inbox", (req, res) => {
  const { item, known_projects = [], recent_items = [] } = req.body ?? {};
  if (!item) {
    return res.status(400).json({ error: "Missing item" });
  }
  return res.json(smartInbox({ item, known_projects, recent_items }));
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Backend running on port ${PORT}`);
});

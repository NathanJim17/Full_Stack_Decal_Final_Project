export const T = {
  bg: "oklch(0.965 0.012 75)",
  surface: "oklch(0.99  0.005 80)",
  surface2: "oklch(0.96  0.012 78)",
  border: "oklch(0.88  0.012 75)",
  borderSub: "oklch(0.92  0.008 75)",
  text: "oklch(0.18  0.01  60)",
  muted: "oklch(0.50  0.01  65)",
  faint: "oklch(0.72  0.01  70)",
  accent: "oklch(0.50  0.18  285)",
  accentBg: "oklch(0.95  0.04  285)",
  shadow: "rgba(60,40,20,0.07)",
  shadowMd: "rgba(60,40,20,0.11)",
}

export const TYPE_P = {
  Homework: { bg: "oklch(0.94 0.05 250)", color: "oklch(0.38 0.12 255)", dot: "oklch(0.55 0.14 255)" },
  Exam: { bg: "oklch(0.94 0.05 25)", color: "oklch(0.42 0.14 28)", dot: "oklch(0.60 0.16 28)" },
  Project: { bg: "oklch(0.93 0.05 155)", color: "oklch(0.40 0.12 155)", dot: "oklch(0.57 0.14 155)" },
  Quiz: { bg: "oklch(0.94 0.05 70)", color: "oklch(0.42 0.12 75)", dot: "oklch(0.60 0.14 75)" },
  Lab: { bg: "oklch(0.94 0.04 310)", color: "oklch(0.42 0.12 310)", dot: "oklch(0.58 0.14 310)" },
}

export const COURSES = [
  {
    id: 1,
    code: "CS 189",
    name: "Introduction to Machine Learning",
    prof: "Prof. Jennifer Listgarten",
    color: "oklch(0.50 0.18 285)",
    colorBg: "oklch(0.95 0.04 285)",
    assignments: 12,
    exams: 2,
    progress: 38,
    synced: true,
    deadlines: [
      { id: 1, title: "Homework 1: Linear Algebra", date: "2026-02-14", type: "Homework", daysLeft: 19 },
      { id: 2, title: "Midterm Exam 1", date: "2026-03-05", type: "Exam", daysLeft: 38 },
    ],
  },
  {
    id: 2,
    code: "EE 126",
    name: "Probability & Random Processes",
    prof: "Prof. Kannan Ramchandran",
    color: "oklch(0.52 0.16 155)",
    colorBg: "oklch(0.94 0.04 155)",
    assignments: 8,
    exams: 3,
    progress: 55,
    synced: true,
    deadlines: [
      { id: 3, title: "Problem Set 4", date: "2026-02-18", type: "Homework", daysLeft: 23 },
      { id: 4, title: "Midterm", date: "2026-03-12", type: "Exam", daysLeft: 45 },
    ],
  },
  {
    id: 3,
    code: "CS 162",
    name: "Operating Systems",
    prof: "Prof. Ion Stoica",
    color: "oklch(0.54 0.16 45)",
    colorBg: "oklch(0.95 0.04 60)",
    assignments: 6,
    exams: 2,
    progress: 20,
    synced: false,
    deadlines: [{ id: 5, title: "Project 1: Pintos", date: "2026-02-21", type: "Project", daysLeft: 26 }],
  },
  {
    id: 4,
    code: "EECS 127",
    name: "Optimization Models",
    prof: "Prof. Laurent El Ghaoui",
    color: "oklch(0.52 0.16 310)",
    colorBg: "oklch(0.95 0.04 310)",
    assignments: 10,
    exams: 2,
    progress: 45,
    synced: true,
    deadlines: [
      { id: 6, title: "Homework 3", date: "2026-02-16", type: "Homework", daysLeft: 21 },
      { id: 7, title: "Quiz 1", date: "2026-02-24", type: "Quiz", daysLeft: 29 },
    ],
  },
]

export const ALL_DEADLINES = [
  { id: 2, title: "CS 189 — Homework 1", date: "Feb 14", type: "Homework", daysLeft: 19 },
  { id: 1, title: "EECS 127 — Homework 3", date: "Feb 16", type: "Homework", daysLeft: 21 },
  { id: 3, title: "EE 126 — Problem Set 4", date: "Feb 18", type: "Homework", daysLeft: 23 },
  { id: 4, title: "CS 162 — Project 1: Pintos", date: "Feb 21", type: "Project", daysLeft: 26 },
  { id: 5, title: "EECS 127 — Quiz 1", date: "Feb 24", type: "Quiz", daysLeft: 29 },
  { id: 6, title: "CS 189 — Midterm Exam 1", date: "Mar 5", type: "Exam", daysLeft: 38 },
  { id: 7, title: "EE 126 — Midterm", date: "Mar 12", type: "Exam", daysLeft: 45 },
].sort((a, b) => a.daysLeft - b.daysLeft)

export const NAV_ITEMS = [
  { id: "dashboard", icon: "grid", label: "Dashboard" },
  { id: "courses", icon: "bookOpen", label: "Courses" },
  { id: "calendar", icon: "calendar", label: "Calendar" },
  { id: "docs", icon: "fileText", label: "Documents" },
  { id: "settings", icon: "settings", label: "Settings" },
]

export const NOTIFICATIONS = [
  { msg: "CS 189 sync completed", time: "2m ago", icon: "zap" },
  { msg: "Homework 1 due in 19 days", time: "1h ago", icon: "clock" },
  { msg: "EE 126 syllabus uploaded", time: "3h ago", icon: "upload" },
]

export const QUICK_ACTIONS = [
  { icon: "upload", label: "Upload Document", desc: "Process new document", ac: T.accent, bg: T.accentBg },
  { icon: "link", label: "Open Notion", desc: "Open workspace", ac: "oklch(0.45 0.14 250)", bg: "oklch(0.95 0.04 250)" },
  { icon: "sparkles", label: "Re-extract in Documents", desc: "Retry parsing from docs", ac: "oklch(0.52 0.16 45)", bg: "oklch(0.95 0.04 45)" },
  { icon: "calendar", label: "View Calendar", desc: "See all events", ac: "oklch(0.52 0.16 155)", bg: "oklch(0.95 0.04 155)" },
  { icon: "filePlus", label: "Create Notion Page", desc: "Generate a new page from a document", ac: "oklch(0.52 0.16 310)", bg: "oklch(0.95 0.04 310)" },
]

export const cardStyle = (extra = {}) => ({
  background: T.surface,
  border: `1.5px solid ${T.border}`,
  borderRadius: 14,
  boxShadow: `0 1px 3px ${T.shadow}, 0 4px 16px ${T.shadow}`,
  ...extra,
})

export const btnGhostStyle = {
  display: "inline-flex",
  alignItems: "center",
  gap: 6,
  padding: "6px 13px",
  border: `1.5px solid ${T.border}`,
  borderRadius: 99,
  background: "transparent",
  color: T.muted,
  fontFamily: "'DM Sans', sans-serif",
  fontWeight: 500,
  fontSize: 12,
  cursor: "pointer",
  transition: "all 0.15s ease",
  whiteSpace: "nowrap",
}

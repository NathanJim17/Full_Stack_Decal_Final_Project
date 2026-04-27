export const STATUS_CONFIG = {
  "Uploaded":        { bg: "oklch(0.94 0.04 250)", color: "oklch(0.40 0.12 255)", dot: "oklch(0.55 0.14 255)", icon: "upload"    },
  "Processing":      { bg: "oklch(0.95 0.04 70)",  color: "oklch(0.44 0.12 75)",  dot: "oklch(0.60 0.14 75)",  icon: "loader"    },
  "Ready to review": { bg: "oklch(0.94 0.05 285)", color: "oklch(0.40 0.14 285)", dot: "oklch(0.55 0.16 285)", icon: "eye"       },
  "Synced":          { bg: "oklch(0.93 0.06 155)", color: "oklch(0.38 0.12 155)", dot: "oklch(0.52 0.14 155)", icon: "check"     },
  "Error":           { bg: "oklch(0.95 0.05 28)",  color: "oklch(0.44 0.16 28)",  dot: "oklch(0.58 0.18 28)",  icon: "alertTri"  },
}

export const DOCS = [
  { id: 1, name: "CS189_Syllabus_SP26.pdf",  course: "CS 189",   status: "Ready to review", updated: "Apr 26, 2026", size: "1.2 MB", assignments: 12   },
  { id: 2, name: "EE126_Course_Info.pdf",    course: "EE 126",   status: "Synced",           updated: "Apr 25, 2026", size: "840 KB", assignments: 8    },
  { id: 3, name: "CS162_Syllabus.pdf",       course: "CS 162",   status: "Processing",       updated: "Apr 27, 2026", size: "2.1 MB", assignments: null },
  { id: 4, name: "EECS127_Spring2026.pdf",   course: "EECS 127", status: "Synced",           updated: "Apr 20, 2026", size: "610 KB", assignments: 10   },
  { id: 5, name: "CS189_Lab_Schedule.pdf",   course: "CS 189",   status: "Error",            updated: "Apr 27, 2026", size: "320 KB", assignments: null },
  { id: 6, name: "EE126_ProblemSets.pdf",    course: null,       status: "Uploaded",         updated: "Apr 27, 2026", size: "1.8 MB", assignments: null },
]

export const FILTER_OPTIONS = ["All", "Ready to review", "Synced", "Processing", "Error", "Uploaded"]

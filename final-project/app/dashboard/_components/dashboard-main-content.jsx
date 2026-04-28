"use client"

import { Button } from "@/components/ui/button"
import { QUICK_ACTIONS, T, btnGhostStyle, cardStyle } from "../_lib/dashboard-data"
import { Icon } from "./dashboard-icons"
import { CourseCard, DeadlineRow, MetricCard } from "./dashboard-primitives"

export function DashboardMainContent({
  greeting,
  firstName,
  today,
  semesterLabel,
  courses = [],
  filteredCourses = [],
  search = "",
  coursesLoading = false,
  coursesError = null,
  deadlines = [],
  deadlinesLoading = false,
  deadlinesError = null,
  onOpenCourses,
  onOpenDocuments,
  onOpenCalendar,
  onOpenNotion,
}) {
  const upcomingTasks = deadlines.filter((d) => d.daysLeft > 0).length
  const dueThisWeek = deadlines.filter((d) => d.daysLeft <= 7).length
  return (
    <main style={{ flex: 1, overflowY: "auto", padding: "24px" }}>
      <div style={{ marginBottom: 22 }}>
        <h1 style={{ fontSize: 22, fontWeight: 600, color: T.text, fontFamily: "'Lora', serif", letterSpacing: "-0.02em", marginBottom: 3 }}>
          {greeting}, {firstName} 👋
        </h1>
        <p style={{ fontSize: 13, color: T.muted }}>{semesterLabel} · {today}</p>
      </div>

      <div style={{ display: "flex", gap: 12, marginBottom: 22 }}>
        <MetricCard icon="bookOpen" label="Active Courses" value={courses.length} sub={`${courses.reduce((acc, c) => acc + c.assignments, 0)} Assignments · ${courses.reduce((acc, c) => acc + c.exams, 0)} Exams`} accent={T.accent} iconBg={T.accentBg} />
        <MetricCard icon="clock" label="Upcoming Tasks" value={upcomingTasks} sub={`${dueThisWeek} due this week`} accent="oklch(0.52 0.16 45)" iconBg="oklch(0.95 0.04 45)" />
        <MetricCard
          icon="zap"
          label="Integrations"
          sub=""
          accent="oklch(0.52 0.16 155)"
          iconBg="oklch(0.95 0.04 155)"
          actions={
            <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: 10, width: "100%" }}>
              <a
                href="https://calendar.google.com/"
                target="_blank"
                rel="noreferrer"
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  padding: "10px",
                  minHeight: 30,
                  width: "100%",
                  border: `1.5px solid ${T.border}`,
                  borderRadius: 14,
                  background: T.surface2,
                  textDecoration: "none",
                  color: T.text,
                }}>
                <img src="/google-calendar.png" alt="Google Calendar" style={{ width: 24, height: 24, objectFit: "contain" }} />
                <span style={{ fontSize: 12, fontWeight: 600, lineHeight: 1.25 }}>Google Calendar</span>
              </a>
              <a
                href="https://www.notion.so/"
                target="_blank"
                rel="noreferrer"
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  padding: "10px",
                  minHeight: 30,
                  width: "100%",
                  border: `1.5px solid ${T.border}`,
                  borderRadius: 14,
                  background: T.surface2,
                  textDecoration: "none",
                  color: T.text,
                }}>
                <img src="/notion.png" alt="Notion" style={{ width: 24, height: 24, objectFit: "contain" }} />
                <span style={{ fontSize: 12, fontWeight: 600, lineHeight: 1.25 }}>Notion</span>
              </a>
            </div>
          }
        />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 340px", gap: 18, alignItems: "start" }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
            <h2 style={{ fontSize: 15, fontWeight: 600, color: T.text, fontFamily: "'Lora', serif" }}>Active Classes</h2>
            <Button variant="outline" size="sm" style={btnGhostStyle} onClick={() => onOpenCourses?.()}>
              View all <Icon name="arrowRight" size={11} color="currentColor" />
            </Button>
          </div>

          {coursesLoading ? (
            <div style={cardStyle({ padding: "24px", textAlign: "center", fontSize: 13, color: T.muted })}>
              Loading courses...
            </div>
          ) : coursesError ? (
            <div style={cardStyle({ padding: "24px", textAlign: "center", fontSize: 13, color: "oklch(0.50 0.14 28)" })}>
              Could not load courses: {coursesError}
            </div>
          ) : filteredCourses.length === 0 ? (
            <div style={cardStyle({ padding: "40px 24px", textAlign: "center" })}>
              <Icon name="alertCircle" size={28} color={T.border} />
              <p style={{ marginTop: 10, fontSize: 13, color: T.faint }}>No courses match &ldquo;{search}&rdquo;</p>
            </div>
          ) : (
            filteredCourses.map((c) => (
              <CourseCard
                key={c.id}
                course={c}
                onUploadDocument={onOpenDocuments}
                onViewAllCourses={onOpenCourses}
              />
            ))
          )}
        </div>

        <div>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
            <h2 style={{ fontSize: 15, fontWeight: 600, color: T.text, fontFamily: "'Lora', serif" }}>Upcoming Deadlines</h2>
            <span style={{ fontSize: 10, background: T.accentBg, color: T.accent, padding: "2px 8px", borderRadius: 99, fontWeight: 600 }}>{upcomingTasks}</span>
          </div>

          <div style={cardStyle({ padding: "12px", marginBottom: 18 })}>
            {deadlinesLoading ? (
              <div style={{ padding: "8px 4px", fontSize: 12, color: T.muted }}>Loading deadlines...</div>
            ) : deadlinesError ? (
              <div style={{ padding: "8px 4px", fontSize: 12, color: "oklch(0.50 0.14 28)" }}>
                Could not load deadlines: {deadlinesError}
              </div>
            ) : upcomingTasks === 0 ? (
              <div style={{ padding: "8px 4px", fontSize: 12, color: T.muted }}>No upcoming deadlines.</div>
            ) : (
              deadlines.map((dl, i) => <DeadlineRow key={dl.id} item={dl} index={i} />)
            )}
          </div>

          <h2 style={{ fontSize: 15, fontWeight: 600, color: T.text, fontFamily: "'Lora', serif", marginBottom: 12 }}>Quick Actions</h2>
          <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: 10 }}>
            {QUICK_ACTIONS.map((a) => (
              <Button
                key={a.label}
                variant="outline"
                onClick={() => {
                  if (a.label === "Upload Document") onOpenDocuments?.()
                  if (a.label === "Re-extract in Documents") onOpenDocuments?.()
                  if (a.label === "View Calendar") onOpenCalendar?.()
                  if (a.label === "Open Notion") onOpenNotion?.()
                }}
                style={{ ...cardStyle({ padding: "14px", border: `1.5px solid ${T.borderSub}` }), textAlign: "left", display: "flex", flexDirection: "row", alignItems: "center", justifyContent: "flex-start", gap: 10, fontFamily: "'DM Sans', sans-serif", minHeight: 72 }}>
                <div style={{ width: 32, height: 32, borderRadius: 8, background: a.bg, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <Icon name={a.icon} size={15} color={a.ac} />
                </div>
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontSize: 12, fontWeight: 600, color: T.text }}>{a.label}</div>
                  <div style={{ fontSize: 11, color: T.faint, lineHeight: 1.3 }}>{a.desc}</div>
                </div>
              </Button>
            ))}
          </div>
        </div>
      </div>
    </main>
  )
}

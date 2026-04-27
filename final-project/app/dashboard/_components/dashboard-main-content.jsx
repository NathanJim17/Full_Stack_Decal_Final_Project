"use client"

import { Button } from "@/components/ui/button"
import { ALL_DEADLINES, QUICK_ACTIONS, T, btnGhostStyle, cardStyle } from "../_lib/dashboard-data"
import { Icon } from "./dashboard-icons"
import { CourseCard, DeadlineRow, MetricCard } from "./dashboard-primitives"

export function DashboardMainContent({ greeting, firstName, today, filteredCourses, search }) {
  return (
    <main style={{ flex: 1, overflowY: "auto", padding: "24px" }}>
      <div style={{ marginBottom: 22 }}>
        <h1 style={{ fontSize: 22, fontWeight: 600, color: T.text, fontFamily: "'Lora', serif", letterSpacing: "-0.02em", marginBottom: 3 }}>
          {greeting}, {firstName} 👋
        </h1>
        <p style={{ fontSize: 13, color: T.muted }}>Spring 2026 · Week 4 of 16 · {today}</p>
      </div>

      <div style={{ display: "flex", gap: 12, marginBottom: 22 }}>
        <MetricCard icon="bookOpen" label="Active Courses" value="4" sub="12 Assignments · 4 Exams" accent={T.accent} iconBg={T.accentBg} />
        <MetricCard icon="clock" label="Upcoming Tasks" value="17" sub="2 due this week" accent="oklch(0.52 0.16 45)" iconBg="oklch(0.95 0.04 45)" />
        <MetricCard icon="zap" label="Sync Status" value="Google Calendar Connected" sub="Last sync 2 min ago" dot accent="oklch(0.52 0.16 155)" iconBg="oklch(0.95 0.04 155)" />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 340px", gap: 18, alignItems: "start" }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
            <h2 style={{ fontSize: 15, fontWeight: 600, color: T.text, fontFamily: "'Lora', serif" }}>Active Classes</h2>
            <Button variant="outline" size="sm" style={btnGhostStyle}>
              View all <Icon name="arrowRight" size={11} color="currentColor" />
            </Button>
          </div>

          {filteredCourses.length === 0 ? (
            <div style={cardStyle({ padding: "40px 24px", textAlign: "center" })}>
              <Icon name="alertCircle" size={28} color={T.border} />
              <p style={{ marginTop: 10, fontSize: 13, color: T.faint }}>No courses match &ldquo;{search}&rdquo;</p>
            </div>
          ) : (
            filteredCourses.map((c) => <CourseCard key={c.id} course={c} />)
          )}
        </div>

        <div>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
            <h2 style={{ fontSize: 15, fontWeight: 600, color: T.text, fontFamily: "'Lora', serif" }}>Upcoming Deadlines</h2>
            <span style={{ fontSize: 10, background: T.accentBg, color: T.accent, padding: "2px 8px", borderRadius: 99, fontWeight: 600 }}>{ALL_DEADLINES.length}</span>
          </div>

          <div style={cardStyle({ padding: "12px", marginBottom: 18 })}>
            {ALL_DEADLINES.map((dl, i) => <DeadlineRow key={dl.id} item={dl} index={i} />)}
          </div>

          <h2 style={{ fontSize: 15, fontWeight: 600, color: T.text, fontFamily: "'Lora', serif", marginBottom: 12 }}>Quick Actions</h2>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
            {QUICK_ACTIONS.map((a) => (
              <Button
                key={a.label}
                variant="outline"
                style={{ ...cardStyle({ padding: "14px", border: `1.5px solid ${T.borderSub}` }), textAlign: "left", display: "flex", flexDirection: "column", alignItems: "flex-start", justifyContent: "flex-start", gap: 8, fontFamily: "'DM Sans', sans-serif" }}>
                <div style={{ width: 32, height: 32, borderRadius: 8, background: a.bg, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <Icon name={a.icon} size={15} color={a.ac} />
                </div>
                <div>
                  <div style={{ fontSize: 12, fontWeight: 600, color: T.text }}>{a.label}</div>
                  <div style={{ fontSize: 11, color: T.faint }}>{a.desc}</div>
                </div>
              </Button>
            ))}
          </div>
        </div>
      </div>
    </main>
  )
}

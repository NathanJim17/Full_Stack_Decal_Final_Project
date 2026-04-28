"use client"

import Link from "next/link"
import { useMemo, useState } from "react"
import { Button } from "@/components/ui/button"
import { BadgeP, Progress } from "../dashboard-primitives"
import { Icon } from "../dashboard-icons"
import { T, btnGhostStyle, cardStyle } from "../../_lib/dashboard-data"

function PageShell({ children }) {
  return <main style={{ flex: 1, overflowY: "auto", padding: "24px 28px 32px" }}>{children}</main>
}

function MetricTile({ label, value, subtext, icon }) {
  return (
    <div style={cardStyle({ padding: "16px 18px", minHeight: 104, boxShadow: "0 1px 3px rgba(60,40,20,0.05)" })}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
        <span style={{ fontSize: 11.5, color: T.muted, fontWeight: 600 }}>{label}</span>
        <Icon name={icon} size={13} color={T.accent} />
      </div>
      <div style={{ fontSize: 18, fontWeight: 700, fontFamily: "'Lora', serif", color: T.text, marginBottom: 4 }}>{value}</div>
      <div style={{ fontSize: 11.5, color: T.faint }}>{subtext}</div>
    </div>
  )
}

function SectionCard({ title, children, action = null }) {
  return (
    <section style={cardStyle({ padding: "18px 18px 14px" })}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10, marginBottom: 14 }}>
        <h2 style={{ fontSize: 15, fontWeight: 600, color: T.text, fontFamily: "'Lora', serif" }}>{title}</h2>
        {action}
      </div>
      {children}
    </section>
  )
}

function DocumentStatusSummary({ documents }) {
  const counts = useMemo(() => ({
    "Ready to review": documents.filter((doc) => doc.status === "Ready to review").length,
    Processing: documents.filter((doc) => doc.status === "Processing").length,
    Error: documents.filter((doc) => doc.status === "Error").length,
  }), [documents])

  return (
    <SectionCard title="Document Status">
      <div style={{ display: "grid", gap: 10 }}>
        {Object.entries(counts).map(([label, count]) => (
          <div key={label} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
            <div style={{ display: "inline-flex", alignItems: "center", gap: 8, fontSize: 12, color: T.muted }}>
              <span
                style={{
                  width: 7,
                  height: 7,
                  borderRadius: "50%",
                  background:
                    label === "Ready to review"
                      ? T.accent
                      : label === "Processing"
                        ? "oklch(0.60 0.14 75)"
                        : "oklch(0.58 0.18 28)",
                }}
              />
              {label}
            </div>
            <span style={{ minWidth: 20, height: 20, padding: "0 6px", borderRadius: 99, background: T.surface2, color: T.muted, display: "inline-flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 600 }}>
              {count}
            </span>
          </div>
        ))}
      </div>
    </SectionCard>
  )
}

function DocumentRow({ document }) {
  const documentTypeLabel = document.documentType
    ? document.documentType
        .split("_")
        .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
        .join(" ")
    : "Document"

  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, padding: "12px 0", borderBottom: `1px solid ${T.borderSub}` }}>
      <div>
        <div style={{ fontSize: 12.5, fontWeight: 600, color: T.text }}>{document.name}</div>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 4, flexWrap: "wrap", fontSize: 11.5, color: T.faint }}>
          <span>{documentTypeLabel}</span>
          <span>{document.size}</span>
          <span>{document.updated}</span>
        </div>
      </div>
      <span
        style={{
          fontSize: 11,
          fontWeight: 600,
          borderRadius: 99,
          padding: "4px 9px",
          background:
            document.status === "Ready to review"
              ? T.accentBg
              : document.status === "Processing"
                ? "oklch(0.95 0.04 70)"
                : "oklch(0.95 0.05 28)",
          color:
            document.status === "Ready to review"
              ? T.accent
              : document.status === "Processing"
                ? "oklch(0.44 0.12 75)"
                : "oklch(0.44 0.16 28)",
        }}>
        {document.status}
      </span>
    </div>
  )
}

function DeadlineList({ deadlines }) {
  return (
    <div style={{ display: "grid", gap: 8 }}>
      {deadlines.map((deadline) => (
        <div key={deadline.id} style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 0", borderBottom: `1px solid ${T.borderSub}` }}>
          <div style={{ width: 44, height: 44, borderRadius: 12, border: `1.5px solid ${deadline.daysLeft <= 14 ? "oklch(0.82 0.09 285)" : T.border}`, background: deadline.daysLeft <= 14 ? T.accentBg : T.surface2, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            <span style={{ fontSize: 14, lineHeight: 1, fontWeight: 700, color: deadline.daysLeft <= 14 ? T.accent : T.text }}>{deadline.daysLeft}</span>
            <span style={{ fontSize: 7.5, letterSpacing: "0.05em", color: T.faint }}>DAYS</span>
          </div>
          <div style={{ minWidth: 0, flex: 1 }}>
            <div style={{ fontSize: 13, fontWeight: 500, color: T.text }}>{deadline.title}</div>
            <div style={{ fontSize: 11.5, color: T.faint, marginTop: 3 }}>{deadline.date}</div>
          </div>
          <BadgeP type={deadline.type} small />
        </div>
      ))}
    </div>
  )
}

export function CourseDetailContent({
  course,
  documents,
  deadlines,
  semesterTermLabel,
  onOpenDocuments,
  onOpenCalendar,
  onOpenNotion,
}) {
  const [activeSection, setActiveSection] = useState("deadlines")

  const upcomingDeadlines = deadlines.filter((deadline) => deadline.daysLeft > 0)
  const nextDeadline = upcomingDeadlines[0]
  const assignmentsFound = documents.reduce((sum, document) => sum + (document.assignments || 0), 0)
  const readyCount = documents.filter((document) => document.status === "Ready to review").length

  return (
    <PageShell>
      <div style={{ fontSize: 12, color: T.faint, marginBottom: 12 }}>
        <Link href="/dashboard?tab=courses" style={{ color: "inherit", textDecoration: "none" }}>Courses</Link>
        <span style={{ margin: "0 6px" }}>/</span>
        <span style={{ color: T.muted }}>{course.code}</span>
      </div>

      <section style={{ ...cardStyle({ padding: 0, overflow: "hidden", marginBottom: 18 }), background: `linear-gradient(180deg, ${course.colorBg}, ${T.surface})` }}>
        <div style={{ position: "relative", padding: "26px 24px 16px" }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "5px 11px", borderRadius: 999, background: course.color, color: "#fff", fontSize: 11, fontWeight: 700, marginBottom: 20 }}>
            <span>{course.code}</span>
          </div>
          <div style={{ position: "absolute", top: 10, right: 22, fontFamily: "'Lora', serif", fontSize: 66, lineHeight: 1, fontWeight: 700, color: "rgba(98,80,190,0.10)", letterSpacing: "-0.05em" }}>
            {course.code.split(" ").slice(-1)[0]}
          </div>

          <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 18, flexWrap: "wrap" }}>
            <div>
              <h1 style={{ fontSize: 20, fontWeight: 600, color: T.text, fontFamily: "'Lora', serif", marginBottom: 8 }}>
                {course.name}
              </h1>
              <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap", fontSize: 12, color: T.muted }}>
                <span style={{ display: "inline-flex", alignItems: "center", gap: 5 }}>
                  <Icon name="bookOpen" size={12} color={T.faint} />
                  {course.prof || "Professor not added"}
                </span>
                <span>{semesterTermLabel}</span>
                <span>{course.assignments} assignments</span>
                <span>{course.exams} exams</span>
              </div>
            </div>

            <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
              <Button variant="outline" style={btnGhostStyle} onClick={() => onOpenCalendar?.()}>
                <Icon name="calendar" size={12} color="currentColor" /> Open Calendar
              </Button>
              <Button
                variant="outline"
                style={{
                  ...btnGhostStyle,
                  padding: "8px 14px",
                  borderColor: "oklch(0.72 0.08 285)",
                  background: "linear-gradient(180deg, oklch(0.57 0.18 285), oklch(0.50 0.18 285))",
                  color: "#fff",
                  boxShadow: "0 6px 18px oklch(0.50 0.18 285 / 0.20)",
                }}
                onClick={() => onOpenDocuments?.()}>
                <Icon name="upload" size={12} color="currentColor" /> Upload document
              </Button>
            </div>
          </div>
        </div>

        <div style={{ padding: "0 24px 16px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
            <span style={{ fontSize: 11, color: T.faint }}>Semester progress</span>
            <span style={{ fontSize: 11, fontWeight: 600, color: T.muted }}>{course.progress}%</span>
          </div>
          <Progress value={course.progress} color={course.color} />
        </div>
      </section>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, minmax(0, 1fr))", gap: 10, marginBottom: 18 }}>
        <MetricTile label="Upcoming deadlines" value={upcomingDeadlines.length} subtext={nextDeadline ? `Next: ${nextDeadline.date}` : "No upcoming deadlines"} icon="clock" />
        <MetricTile label="Documents" value={documents.length} subtext={readyCount > 0 ? `${readyCount} ready to review` : "No reviewed documents yet"} icon="fileText" />
        <MetricTile label="Assignments found" value={assignmentsFound} subtext="Extracted from course documents" icon="check" />
        <MetricTile label="Exams tracked" value={course.exams} subtext="Live from your course data" icon="sparkles" />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "minmax(0, 1fr) 250px", gap: 18, alignItems: "start" }}>
        <div>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: 4, borderRadius: 12, background: T.surface, border: `1.5px solid ${T.borderSub}`, marginBottom: 12 }}>
            {[
              { id: "deadlines", label: "Deadlines" },
              { id: "documents", label: "Documents" },
            ].map((tab) => {
              const active = activeSection === tab.id
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveSection(tab.id)}
                  style={{
                    border: "none",
                    background: active ? T.accent : "transparent",
                    color: active ? "#fff" : T.muted,
                    borderRadius: 9,
                    padding: "7px 14px",
                    fontSize: 12,
                    fontWeight: 600,
                    fontFamily: "'DM Sans', sans-serif",
                    cursor: "pointer",
                  }}>
                  {tab.label}
                </button>
              )
            })}
          </div>

          {activeSection === "deadlines" ? (
            <SectionCard
              title="Upcoming deadlines"
              action={<span style={{ fontSize: 11, color: T.accent, background: T.accentBg, borderRadius: 99, padding: "2px 8px", fontWeight: 600 }}>{upcomingDeadlines.length}</span>}>
              {deadlines.length > 0 ? (
                <DeadlineList deadlines={deadlines} />
              ) : (
                <div style={{ padding: "20px 4px", fontSize: 12.5, color: T.muted }}>No deadlines linked to this course yet.</div>
              )}
            </SectionCard>
          ) : (
            <SectionCard
              title="Course documents"
              action={<span style={{ fontSize: 11, color: T.accent, background: T.accentBg, borderRadius: 99, padding: "2px 8px", fontWeight: 600 }}>{documents.length}</span>}>
              {documents.length > 0 ? (
                <div>
                  {documents.map((document) => <DocumentRow key={document.id} document={document} />)}
                </div>
              ) : (
                <div style={{ padding: "20px 4px", fontSize: 12.5, color: T.muted }}>No documents have been assigned to this course yet.</div>
              )}
            </SectionCard>
          )}
        </div>

        <div style={{ display: "grid", gap: 14 }}>
          <SectionCard title="Course Info">
            <div style={{ display: "grid", gap: 12 }}>
              <div style={{ display: "flex", justifyContent: "space-between", gap: 12, fontSize: 12 }}>
                <span style={{ color: T.faint }}>Instructor</span>
                <span style={{ color: T.text, textAlign: "right" }}>{course.prof || "Not added"}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", gap: 12, fontSize: 12 }}>
                <span style={{ color: T.faint }}>Semester</span>
                <span style={{ color: T.text, textAlign: "right" }}>{semesterTermLabel}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", gap: 12, fontSize: 12 }}>
                <span style={{ color: T.faint }}>Assignments</span>
                <span style={{ color: T.text, textAlign: "right" }}>{course.assignments}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", gap: 12, fontSize: 12 }}>
                <span style={{ color: T.faint }}>Exams</span>
                <span style={{ color: T.text, textAlign: "right" }}>{course.exams}</span>
              </div>
              <div style={{ paddingTop: 8, borderTop: `1px solid ${T.borderSub}` }}>
                <div style={{ fontSize: 11.5, color: T.faint, marginBottom: 6 }}>About this course</div>
                <div style={{ fontSize: 12, color: T.muted, lineHeight: 1.55 }}>
                  This course page brings together uploaded documents, extracted assignments, and upcoming deadlines for one class.
                </div>
              </div>
            </div>
          </SectionCard>

          <SectionCard title="Quick Actions">
            <div style={{ display: "grid", gap: 8 }}>
              <Button variant="outline" style={{ ...btnGhostStyle, justifyContent: "space-between", padding: "11px 13px", borderRadius: 12 }} onClick={() => onOpenDocuments?.()}>
                <span style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
                  <Icon name="upload" size={12} color="currentColor" /> Upload document
                </span>
                <Icon name="arrowRight" size={12} color="currentColor" />
              </Button>
              <Button variant="outline" style={{ ...btnGhostStyle, justifyContent: "space-between", padding: "11px 13px", borderRadius: 12 }} onClick={() => onOpenCalendar?.()}>
                <span style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
                  <Icon name="calendar" size={12} color="currentColor" /> Open Google Calendar
                </span>
                <Icon name="arrowRight" size={12} color="currentColor" />
              </Button>
              <Button variant="outline" style={{ ...btnGhostStyle, justifyContent: "space-between", padding: "11px 13px", borderRadius: 12 }} onClick={() => onOpenNotion?.()}>
                <span style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
                  <Icon name="link" size={12} color="currentColor" /> Open in Notion
                </span>
                <Icon name="arrowRight" size={12} color="currentColor" />
              </Button>
            </div>
          </SectionCard>

          <DocumentStatusSummary documents={documents} />
        </div>
      </div>
    </PageShell>
  )
}

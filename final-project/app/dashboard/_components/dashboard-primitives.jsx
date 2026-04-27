"use client"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { T, TYPE_P, btnGhostStyle, cardStyle } from "../_lib/dashboard-data"
import { Icon } from "./dashboard-icons"

export function BadgeP({ type, small }) {
  const p = TYPE_P[type] || TYPE_P.Quiz
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 4,
        background: p.bg,
        color: p.color,
        fontSize: small ? 10 : 11,
        fontWeight: 600,
        letterSpacing: "0.02em",
        padding: small ? "2px 7px" : "3px 9px",
        borderRadius: 99,
        whiteSpace: "nowrap",
      }}>
      <span style={{ width: 5, height: 5, borderRadius: "50%", background: p.dot, flexShrink: 0 }} />
      {type}
    </span>
  )
}

export function Progress({ value, color }) {
  return (
    <div style={{ height: 4, background: T.borderSub, borderRadius: 99, overflow: "hidden" }}>
      <div style={{ height: "100%", width: `${value}%`, background: color, borderRadius: 99, transition: "width 0.6s ease" }} />
    </div>
  )
}

export function CourseCard({ course }) {
  return (
    <Card style={{ ...cardStyle({ padding: "20px 22px", marginBottom: 10 }), animation: "fadeUp 0.35s ease both" }}>
      <div style={{ display: "flex", alignItems: "flex-start", gap: 14 }}>
        <div style={{ width: 44, height: 44, borderRadius: 11, flexShrink: 0, background: course.colorBg, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <span style={{ fontFamily: "'Lora', serif", fontWeight: 700, fontSize: 13, color: course.color }}>{course.code.split(" ")[1]}</span>
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 2 }}>
            <span style={{ fontSize: 14, fontWeight: 600, color: T.text }}>{course.code}</span>
            <span style={{ fontSize: 10, fontWeight: 600, color: course.synced ? "oklch(0.45 0.12 155)" : "oklch(0.50 0.12 45)", background: course.synced ? "oklch(0.92 0.06 155)" : "oklch(0.94 0.06 65)", padding: "1px 7px", borderRadius: 99 }}>
              {course.synced ? "Synced" : "Not synced"}
            </span>
          </div>
          <div style={{ fontSize: 12, color: T.muted, marginBottom: 1 }}>{course.name}</div>
          <div style={{ fontSize: 11, color: T.faint }}>{course.prof}</div>
        </div>
      </div>

      <div style={{ marginTop: 14, marginBottom: 12 }}>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5 }}>
          <span style={{ fontSize: 11, color: T.faint }}>Semester progress</span>
          <span style={{ fontSize: 11, fontWeight: 600, color: T.muted }}>{course.progress}%</span>
        </div>
        <Progress value={course.progress} color={course.color} />
      </div>

      {course.deadlines.length > 0 && (
        <div style={{ marginBottom: 14 }}>
          {course.deadlines.map((dl, i) => (
            <div key={dl.id} style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 10px", background: i === 0 ? T.accentBg : T.surface2, border: `1.5px solid ${i === 0 ? "oklch(0.78 0.09 285)" : T.borderSub}`, borderRadius: 9, marginBottom: i === 0 ? 5 : 0 }}>
              <div style={{ width: 5, height: 5, borderRadius: "50%", background: TYPE_P[dl.type]?.dot || T.faint, flexShrink: 0 }} />
              <span style={{ flex: 1, fontSize: 12, color: T.text, fontWeight: 500 }}>{dl.title}</span>
              <BadgeP type={dl.type} small />
              <span style={{ fontSize: 11, color: T.faint, minWidth: 52, textAlign: "right" }}>
                {new Date(dl.date + "T12:00:00").toLocaleDateString("en-US", { month: "short", day: "numeric" })}
              </span>
            </div>
          ))}
        </div>
      )}

      <div style={{ display: "flex", gap: 7 }}>
        <Button variant="outline" size="sm" style={btnGhostStyle}>
          <Icon name="upload" size={12} color={T.faint} /> Upload Syllabus
        </Button>
        <Button variant="outline" size="sm" style={{ ...btnGhostStyle, marginLeft: "auto" }}>
          View All <Icon name="arrowRight" size={11} color="currentColor" />
        </Button>
      </div>
    </Card>
  )
}

export function DeadlineRow({ item, index }) {
  const urgent = item.daysLeft <= 7
  const soon = item.daysLeft <= 14
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 10,
        padding: "10px 12px",
        borderRadius: 10,
        marginBottom: 6,
        background: urgent ? "oklch(0.97 0.03 28)" : T.surface2,
        border: `1.5px solid ${urgent ? "oklch(0.88 0.06 28)" : T.borderSub}`,
        animation: `fadeUp 0.3s ease ${index * 0.05}s both`,
      }}>
      <div style={{ width: 38, height: 38, borderRadius: 9, flexShrink: 0, background: urgent ? "oklch(0.94 0.07 28)" : soon ? "oklch(0.95 0.04 285)" : T.surface, border: `1.5px solid ${urgent ? "oklch(0.82 0.10 28)" : soon ? "oklch(0.82 0.09 285)" : T.border}`, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
        <span style={{ fontSize: 14, fontWeight: 700, lineHeight: 1, color: urgent ? "oklch(0.52 0.18 28)" : soon ? T.accent : T.text }}>{item.daysLeft}</span>
        <span style={{ fontSize: 8, color: T.faint, letterSpacing: "0.05em", marginTop: 1 }}>DAYS</span>
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 12.5, fontWeight: 500, color: T.text, marginBottom: 2, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{item.title}</div>
        <div style={{ fontSize: 11, color: T.faint }}>{item.date}</div>
      </div>
      <BadgeP type={item.type} small />
    </div>
  )
}

export function MetricCard({ icon, label, value, sub, accent, iconBg, dot }) {
  return (
    <Card style={cardStyle({ padding: "18px 20px", flex: 1, animation: "fadeUp 0.3s ease both" })}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
        <span style={{ fontSize: 12, fontWeight: 600, color: T.muted, letterSpacing: "0.01em" }}>{label}</span>
        <div style={{ width: 30, height: 30, borderRadius: 8, background: iconBg || T.surface2, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <Icon name={icon} size={14} color={accent || T.faint} />
        </div>
      </div>
      {dot ? (
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
          <span style={{ width: 9, height: 9, borderRadius: "50%", flexShrink: 0, display: "inline-block", background: "oklch(0.55 0.16 155)", boxShadow: "0 0 0 3px oklch(0.85 0.08 155 / 0.6)", animation: "craft-pulse 2.5s ease-in-out infinite" }} />
          <span style={{ fontSize: 13, fontWeight: 600, color: "oklch(0.40 0.12 155)" }}>{value}</span>
        </div>
      ) : (
        <div style={{ fontSize: 32, fontWeight: 700, color: T.text, fontFamily: "'Lora', serif", lineHeight: 1, marginBottom: 6 }}>{value}</div>
      )}
      <div style={{ fontSize: 11.5, color: T.faint }}>{sub}</div>
    </Card>
  )
}

"use client"

import { useState } from "react"
import {
  ALL_DEADLINES,
  btnGhostStyle,
  cardStyle,
  COURSES,
  NAV_ITEMS,
  NOTIFICATIONS,
  QUICK_ACTIONS,
  T,
  TYPE_P,
} from "../_lib/dashboard-data"

function Icon({ name, size = 16, color = "currentColor", style = {} }) {
  const paths = {
    calendar: <><rect x="3" y="4" width="18" height="18" rx="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /></>,
    search: <><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></>,
    bell: <><path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9" /><path d="M13.73 21a2 2 0 01-3.46 0" /></>,
    plus: <><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></>,
    upload: <><polyline points="16 16 12 12 8 16" /><line x1="12" y1="12" x2="12" y2="21" /><path d="M20.39 18.39A5 5 0 0018 9h-1.26A8 8 0 103 16.3" /></>,
    zap: <><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" /></>,
    clock: <><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></>,
    sparkles: <><path d="M12 3l1.5 4.5L18 9l-4.5 1.5L12 15l-1.5-4.5L6 9l4.5-1.5z" /><path d="M19 2l.75 2.25L22 5l-2.25.75L19 8l-.75-2.25L16 5l2.25-.75z" /></>,
    arrowRight: <><line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" /></>,
    bookOpen: <><path d="M2 3h6a4 4 0 014 4v14a3 3 0 00-3-3H2z" /><path d="M22 3h-6a4 4 0 00-4 4v14a3 3 0 013-3h7z" /></>,
    grid: <><rect x="3" y="3" width="7" height="7" rx="1" /><rect x="14" y="3" width="7" height="7" rx="1" /><rect x="14" y="14" width="7" height="7" rx="1" /><rect x="3" y="14" width="7" height="7" rx="1" /></>,
    settings: <><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-2 2 2 2 0 01-2-2v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 01-2-2 2 2 0 012-2h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 012-2 2 2 0 012 2v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 012 2 2 2 0 01-2 2h-.09a1.65 1.65 0 00-1.51 1z" /></>,
    link: <><path d="M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71" /><path d="M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71" /></>,
    alertCircle: <><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" /></>,
    fileText: <><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" /><polyline points="14 2 14 8 20 8" /><line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" /></>,
    logOut: <><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" y1="12" x2="9" y2="12" /></>,
  }

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      style={style}>
      {paths[name]}
    </svg>
  )
}

function Badge({ type, small }) {
  const p = TYPE_P[type] || TYPE_P.Quiz
  return (
    <span
      style={{
        display: "inline-flex", alignItems: "center", gap: 4,
        background: p.bg, color: p.color,
        fontSize: small ? 10 : 11, fontWeight: 600, letterSpacing: "0.02em",
        padding: small ? "2px 7px" : "3px 9px", borderRadius: 99,
        whiteSpace: "nowrap",
      }}>
      <span style={{ width: 5, height: 5, borderRadius: "50%", background: p.dot, flexShrink: 0 }} />
      {type}
    </span>
  )
}

function Progress({ value, color }) {
  return (
    <div style={{ height: 4, background: T.borderSub, borderRadius: 99, overflow: "hidden" }}>
      <div style={{ height: "100%", width: `${value}%`, background: color, borderRadius: 99, transition: "width 0.6s ease" }} />
    </div>
  )
}

function CourseCard({ course }) {
  const [hovered, setHovered] = useState(false)
  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        ...cardStyle({
          padding: "20px 22px", marginBottom: 10,
          borderColor: hovered ? T.faint : T.border,
          boxShadow: hovered ? `0 4px 20px ${T.shadowMd}` : `0 1px 3px ${T.shadow}`,
          transition: "box-shadow 0.2s ease, border-color 0.2s ease",
          animation: "fadeUp 0.35s ease both",
        }),
      }}>
      <div style={{ display: "flex", alignItems: "flex-start", gap: 14 }}>
        <div style={{ width: 44, height: 44, borderRadius: 11, flexShrink: 0, background: course.colorBg, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <span style={{ fontFamily: "'Lora', serif", fontWeight: 700, fontSize: 13, color: course.color }}>{course.code.split(" ")[1]}</span>
        </div>

        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 2 }}>
            <span style={{ fontSize: 14, fontWeight: 600, color: T.text }}>{course.code}</span>
            {course.synced
              ? <span style={{ fontSize: 10, fontWeight: 600, color: "oklch(0.45 0.12 155)", background: "oklch(0.92 0.06 155)", padding: "1px 7px", borderRadius: 99 }}>Synced</span>
              : <span style={{ fontSize: 10, fontWeight: 600, color: "oklch(0.50 0.12 45)", background: "oklch(0.94 0.06 65)", padding: "1px 7px", borderRadius: 99 }}>Not synced</span>}
          </div>
          <div style={{ fontSize: 12, color: T.muted, marginBottom: 1 }}>{course.name}</div>
          <div style={{ fontSize: 11, color: T.faint }}>{course.prof}</div>
        </div>

        <div style={{ display: "flex", gap: 12, flexShrink: 0 }}>
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: 17, fontWeight: 700, color: T.text, lineHeight: 1 }}>{course.assignments}</div>
            <div style={{ fontSize: 10, color: T.faint, marginTop: 2 }}>HW</div>
          </div>
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: 17, fontWeight: 700, color: T.text, lineHeight: 1 }}>{course.exams}</div>
            <div style={{ fontSize: 10, color: T.faint, marginTop: 2 }}>Exams</div>
          </div>
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
            <div
              key={dl.id}
              style={{
                display: "flex", alignItems: "center", gap: 10,
                padding: "8px 10px",
                background: i === 0 ? T.accentBg : T.surface2,
                border: `1.5px solid ${i === 0 ? "oklch(0.78 0.09 285)" : T.borderSub}`,
                borderRadius: 9,
                marginBottom: i === 0 ? 5 : 0,
              }}>
              <div style={{ width: 5, height: 5, borderRadius: "50%", background: TYPE_P[dl.type]?.dot || T.faint, flexShrink: 0 }} />
              <span style={{ flex: 1, fontSize: 12, color: T.text, fontWeight: 500 }}>{dl.title}</span>
              <Badge type={dl.type} small />
              <span style={{ fontSize: 11, color: T.faint, minWidth: 52, textAlign: "right" }}>
                {new Date(dl.date + "T12:00:00").toLocaleDateString("en-US", { month: "short", day: "numeric" })}
              </span>
            </div>
          ))}
        </div>
      )}

      <div style={{ display: "flex", gap: 7 }}>
        <button
          style={btnGhostStyle}
          onMouseEnter={(e) => (e.currentTarget.style.borderColor = course.color)}
          onMouseLeave={(e) => (e.currentTarget.style.borderColor = T.border)}>
          <Icon name="upload" size={12} color={T.faint} /> Upload Syllabus
        </button>
        <button
          style={{ ...btnGhostStyle, marginLeft: "auto" }}
          onMouseEnter={(e) => { e.currentTarget.style.background = T.accentBg; e.currentTarget.style.borderColor = T.accent; e.currentTarget.style.color = T.accent }}
          onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.borderColor = T.border; e.currentTarget.style.color = T.muted }}>
          View All <Icon name="arrowRight" size={11} color="currentColor" />
        </button>
      </div>
    </div>
  )
}

function DeadlineRow({ item, index }) {
  const urgent = item.daysLeft <= 7
  const soon = item.daysLeft <= 14
  return (
    <div
      onMouseEnter={(e) => (e.currentTarget.style.boxShadow = `0 2px 8px ${T.shadowMd}`)}
      onMouseLeave={(e) => (e.currentTarget.style.boxShadow = "none")}
      style={{
        display: "flex", alignItems: "center", gap: 10,
        padding: "10px 12px", borderRadius: 10, marginBottom: 6,
        background: urgent ? "oklch(0.97 0.03 28)" : T.surface2,
        border: `1.5px solid ${urgent ? "oklch(0.88 0.06 28)" : T.borderSub}`,
        animation: `fadeUp 0.3s ease ${index * 0.05}s both`,
        transition: "box-shadow 0.15s ease",
        cursor: "default",
      }}>
      <div style={{ width: 38, height: 38, borderRadius: 9, flexShrink: 0, background: urgent ? "oklch(0.94 0.07 28)" : soon ? "oklch(0.95 0.04 285)" : T.surface, border: `1.5px solid ${urgent ? "oklch(0.82 0.10 28)" : soon ? "oklch(0.82 0.09 285)" : T.border}`, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
        <span style={{ fontSize: 14, fontWeight: 700, lineHeight: 1, color: urgent ? "oklch(0.52 0.18 28)" : soon ? T.accent : T.text }}>{item.daysLeft}</span>
        <span style={{ fontSize: 8, color: T.faint, letterSpacing: "0.05em", marginTop: 1 }}>DAYS</span>
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 12.5, fontWeight: 500, color: T.text, marginBottom: 2, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{item.title}</div>
        <div style={{ fontSize: 11, color: T.faint }}>{item.date}</div>
      </div>
      <Badge type={item.type} small />
    </div>
  )
}

function MetricCard({ icon, label, value, sub, accent, iconBg, dot }) {
  return (
    <div style={cardStyle({ padding: "18px 20px", flex: 1, animation: "fadeUp 0.3s ease both" })}>
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
    </div>
  )
}

export function DashboardShell({ user, onLogout }) {
  const [search, setSearch] = useState("")
  const [activeNav, setActiveNav] = useState("dashboard")
  const [notifOpen, setNotifOpen] = useState(false)
  const [avatarOpen, setAvatarOpen] = useState(false)

  const firstName = user?.user_metadata?.full_name?.split(" ")[0] || user?.email?.split("@")[0] || "there"
  const initial = firstName[0].toUpperCase()
  const hour = new Date().getHours()
  const greeting = hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening"
  const today = new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })

  const filteredCourses = COURSES.filter(
    (c) => !search || c.code.toLowerCase().includes(search.toLowerCase()) || c.name.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div
      onClick={() => { setNotifOpen(false); setAvatarOpen(false) }}
      style={{ display: "flex", flexDirection: "column", height: "100vh", background: T.bg, overflow: "hidden", fontFamily: "'DM Sans', sans-serif", color: T.text, WebkitFontSmoothing: "antialiased" }}>
      <nav style={{ height: 58, background: T.surface, borderBottom: `1.5px solid ${T.border}`, display: "flex", alignItems: "center", padding: "0 20px", gap: 16, flexShrink: 0, zIndex: 20, boxShadow: `0 1px 0 ${T.borderSub}` }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
          <div style={{ width: 30, height: 30, borderRadius: 8, background: T.accent, display: "flex", alignItems: "center", justifyContent: "center", boxShadow: `0 1px 4px oklch(0.50 0.18 285 / 0.35)` }}>
            <Icon name="calendar" size={15} color="#fff" />
          </div>
          <span style={{ fontSize: 15, fontWeight: 600, color: T.text, fontFamily: "'Lora', serif", letterSpacing: "-0.01em" }}>Calendar Sync</span>
        </div>

        <div style={{ flex: 1, maxWidth: 440, display: "flex", alignItems: "center", gap: 8, background: T.surface2, border: `1.5px solid ${T.borderSub}`, borderRadius: 99, padding: "0 14px", height: 36 }}>
          <Icon name="search" size={14} color={T.faint} />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onClick={(e) => e.stopPropagation()}
            placeholder="Search courses, assignments..."
            style={{ flex: 1, border: "none", background: "transparent", outline: "none", fontSize: 13, color: T.text, fontFamily: "'DM Sans', sans-serif" }}
          />
        </div>

        <div style={{ flex: 1 }} />

        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <button
            style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "8px 16px", border: "none", borderRadius: 99, background: T.accent, color: "#fff", fontFamily: "'DM Sans', sans-serif", fontWeight: 600, fontSize: 13, cursor: "pointer", transition: "opacity 0.15s", boxShadow: `0 2px 8px oklch(0.50 0.18 285 / 0.28)`, whiteSpace: "nowrap" }}
            onMouseEnter={(e) => (e.currentTarget.style.opacity = "0.88")}
            onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}>
            <Icon name="plus" size={14} color="#fff" /> New Document
          </button>

          <div style={{ position: "relative" }} onClick={(e) => e.stopPropagation()}>
            <button onClick={() => { setNotifOpen((o) => !o); setAvatarOpen(false) }} style={{ width: 36, height: 36, borderRadius: 99, position: "relative", background: notifOpen ? T.accentBg : T.surface2, border: `1.5px solid ${notifOpen ? T.accent : T.borderSub}`, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", transition: "all 0.15s" }}>
              <Icon name="bell" size={15} color={notifOpen ? T.accent : T.faint} />
              <span style={{ position: "absolute", top: 6, right: 6, width: 7, height: 7, borderRadius: "50%", background: "oklch(0.60 0.18 28)", border: `2px solid ${T.surface}` }} />
            </button>

            {notifOpen && (
              <div style={{ position: "absolute", top: 44, right: 0, width: 280, ...cardStyle({ padding: "12px 0", zIndex: 100 }), animation: "fadeUp 0.15s ease" }}>
                <div style={{ padding: "4px 16px 10px", fontSize: 12, fontWeight: 600, color: T.muted, borderBottom: `1px solid ${T.borderSub}` }}>Notifications</div>
                {NOTIFICATIONS.map((n, i) => (
                  <div key={n.msg} style={{ display: "flex", gap: 10, padding: "10px 16px", alignItems: "flex-start", borderBottom: i < NOTIFICATIONS.length - 1 ? `1px solid ${T.borderSub}` : "none" }}>
                    <div style={{ width: 28, height: 28, borderRadius: 7, background: T.accentBg, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                      <Icon name={n.icon} size={13} color={T.accent} />
                    </div>
                    <div>
                      <div style={{ fontSize: 12, color: T.text, fontWeight: 500 }}>{n.msg}</div>
                      <div style={{ fontSize: 11, color: T.faint, marginTop: 2 }}>{n.time}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div style={{ position: "relative" }} onClick={(e) => e.stopPropagation()}>
            <button onClick={() => { setAvatarOpen((o) => !o); setNotifOpen(false) }} style={{ width: 34, height: 34, borderRadius: "50%", background: "oklch(0.88 0.06 285)", border: `2px solid ${avatarOpen ? T.accent : T.border}`, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", transition: "border-color 0.15s" }}>
              <span style={{ fontSize: 12, fontWeight: 700, color: T.accent }}>{initial}</span>
            </button>

            {avatarOpen && (
              <div style={{ position: "absolute", top: 42, right: 0, width: 200, ...cardStyle({ padding: "8px 0", zIndex: 100 }), animation: "fadeUp 0.15s ease" }}>
                <div style={{ padding: "10px 16px 8px", borderBottom: `1px solid ${T.borderSub}` }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: T.text }}>{firstName}</div>
                  <div style={{ fontSize: 11, color: T.faint, marginTop: 1 }}>{user?.email}</div>
                </div>
                <button onClick={onLogout} style={{ display: "flex", alignItems: "center", gap: 8, width: "100%", padding: "10px 16px", border: "none", background: "transparent", color: "oklch(0.50 0.14 28)", fontFamily: "'DM Sans', sans-serif", fontSize: 13, cursor: "pointer", textAlign: "left" }} onMouseEnter={(e) => (e.currentTarget.style.background = "oklch(0.97 0.03 28)")} onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}>
                  <Icon name="logOut" size={14} color="oklch(0.50 0.14 28)" /> Sign out
                </button>
              </div>
            )}
          </div>
        </div>
      </nav>

      <div style={{ flex: 1, display: "flex", overflow: "hidden" }}>
        <aside style={{ width: 200, flexShrink: 0, background: T.surface, borderRight: `1.5px solid ${T.border}`, display: "flex", flexDirection: "column", padding: "16px 10px", overflowY: "auto" }}>
          <div style={{ fontSize: 10, fontWeight: 600, color: T.faint, letterSpacing: "0.08em", textTransform: "uppercase", padding: "0 10px 8px" }}>Navigation</div>
          {NAV_ITEMS.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveNav(item.id)}
              style={{ display: "flex", alignItems: "center", gap: 9, padding: "9px 12px", borderRadius: 8, border: "none", background: activeNav === item.id ? T.accentBg : "transparent", color: activeNav === item.id ? T.accent : T.muted, fontFamily: "'DM Sans', sans-serif", fontWeight: activeNav === item.id ? 600 : 400, fontSize: 13, cursor: "pointer", width: "100%", textAlign: "left", marginBottom: 2, transition: "all 0.15s" }}
              onMouseEnter={(e) => { if (activeNav !== item.id) e.currentTarget.style.background = T.surface2 }}
              onMouseLeave={(e) => { if (activeNav !== item.id) e.currentTarget.style.background = "transparent" }}>
              <Icon name={item.icon} size={15} color={activeNav === item.id ? T.accent : T.faint} />
              {item.label}
            </button>
          ))}

          <div style={{ marginTop: 20, padding: "0 10px 8px", fontSize: 10, fontWeight: 600, color: T.faint, letterSpacing: "0.08em", textTransform: "uppercase" }}>Courses</div>
          {COURSES.map((c) => (
            <button key={c.id} style={{ display: "flex", alignItems: "center", gap: 8, padding: "7px 12px", borderRadius: 8, border: "none", background: "transparent", color: T.muted, fontFamily: "'DM Sans', sans-serif", fontSize: 12.5, cursor: "pointer", width: "100%", textAlign: "left", marginBottom: 2, transition: "background 0.15s" }} onMouseEnter={(e) => (e.currentTarget.style.background = T.surface2)} onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}>
              <span style={{ width: 8, height: 8, borderRadius: "50%", background: c.color, flexShrink: 0 }} />
              {c.code}
            </button>
          ))}

          <div style={{ marginTop: "auto", padding: "14px 10px 4px" }}>
            <div style={{ background: "oklch(0.94 0.05 155)", border: "1.5px solid oklch(0.82 0.08 155)", borderRadius: 9, padding: "10px 12px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 3 }}>
                <span style={{ width: 7, height: 7, borderRadius: "50%", display: "inline-block", background: "oklch(0.52 0.16 155)", animation: "craft-pulse 2.5s ease-in-out infinite" }} />
                <span style={{ fontSize: 11, fontWeight: 600, color: "oklch(0.38 0.12 155)" }}>Google Calendar</span>
              </div>
              <div style={{ fontSize: 10.5, color: "oklch(0.48 0.10 155)" }}>Last sync: 2 min ago</div>
            </div>
          </div>
        </aside>

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
                <button style={btnGhostStyle} onMouseEnter={(e) => { e.currentTarget.style.borderColor = T.accent; e.currentTarget.style.color = T.accent }} onMouseLeave={(e) => { e.currentTarget.style.borderColor = T.border; e.currentTarget.style.color = T.muted }}>
                  View all <Icon name="arrowRight" size={11} color="currentColor" />
                </button>
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
                  <button
                    key={a.label}
                    style={{ ...cardStyle({ padding: "14px", cursor: "pointer", border: `1.5px solid ${T.borderSub}` }), textAlign: "left", display: "flex", flexDirection: "column", gap: 8, fontFamily: "'DM Sans', sans-serif", transition: "all 0.15s ease" }}
                    onMouseEnter={(e) => { e.currentTarget.style.borderColor = a.ac; e.currentTarget.style.boxShadow = `0 4px 14px ${T.shadowMd}` }}
                    onMouseLeave={(e) => { e.currentTarget.style.borderColor = T.borderSub; e.currentTarget.style.boxShadow = `0 1px 3px ${T.shadow}, 0 4px 16px ${T.shadow}` }}>
                    <div style={{ width: 32, height: 32, borderRadius: 8, background: a.bg, display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <Icon name={a.icon} size={15} color={a.ac} />
                    </div>
                    <div>
                      <div style={{ fontSize: 12, fontWeight: 600, color: T.text }}>{a.label}</div>
                      <div style={{ fontSize: 11, color: T.faint }}>{a.desc}</div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}

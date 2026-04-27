"use client"

import { Button } from "@/components/ui/button"
import { COURSES, NAV_ITEMS, T } from "../_lib/dashboard-data"
import { Icon } from "./dashboard-icons"

export function DashboardSidebar({ activeNav, setActiveNav }) {
  return (
    <aside style={{ width: 200, flexShrink: 0, background: T.surface, borderRight: `1.5px solid ${T.border}`, display: "flex", flexDirection: "column", padding: "16px 10px", overflowY: "auto" }}>
      <div style={{ fontSize: 10, fontWeight: 600, color: T.faint, letterSpacing: "0.08em", textTransform: "uppercase", padding: "0 10px 8px" }}>Navigation</div>
      {NAV_ITEMS.map((item) => (
        <Button
          key={item.id}
          variant="ghost"
          onClick={() => setActiveNav(item.id)}
          style={{ justifyContent: "flex-start", display: "flex", alignItems: "center", gap: 9, padding: "9px 12px", borderRadius: 8, border: "none", background: activeNav === item.id ? T.accentBg : "transparent", color: activeNav === item.id ? T.accent : T.muted, fontFamily: "'DM Sans', sans-serif", fontWeight: activeNav === item.id ? 600 : 400, fontSize: 13, width: "100%", textAlign: "left", marginBottom: 2 }}>
          <Icon name={item.icon} size={15} color={activeNav === item.id ? T.accent : T.faint} />
          {item.label}
        </Button>
      ))}

      <div style={{ marginTop: 20, padding: "0 10px 8px", fontSize: 10, fontWeight: 600, color: T.faint, letterSpacing: "0.08em", textTransform: "uppercase" }}>Courses</div>
      {COURSES.map((c) => (
        <Button key={c.id} variant="ghost" style={{ justifyContent: "flex-start", display: "flex", alignItems: "center", gap: 8, padding: "7px 12px", borderRadius: 8, border: "none", background: "transparent", color: T.muted, fontFamily: "'DM Sans', sans-serif", fontSize: 12.5, width: "100%", textAlign: "left", marginBottom: 2 }}>
          <span style={{ width: 8, height: 8, borderRadius: "50%", background: c.color, flexShrink: 0 }} />
          {c.code}
        </Button>
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
  )
}

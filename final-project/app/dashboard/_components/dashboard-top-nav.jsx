"use client"

import { Input } from "@/components/ui/input"
import { T, cardStyle } from "../_lib/dashboard-data"
import { Icon } from "./dashboard-icons"

export function DashboardTopNav({
  search,
  setSearch,
  avatarOpen,
  setAvatarOpen,
  firstName,
  initial,
  email,
  onLogout,
}) {
  return (
    <nav style={{ height: 58, background: T.surface, borderBottom: `1.5px solid ${T.border}`, display: "flex", alignItems: "center", padding: "0 20px", gap: 16, flexShrink: 0, zIndex: 20, boxShadow: `0 1px 0 ${T.borderSub}` }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
        <div style={{ width: 30, height: 30, borderRadius: 8, background: T.accent, display: "flex", alignItems: "center", justifyContent: "center", boxShadow: `0 1px 4px oklch(0.50 0.18 285 / 0.35)` }}>
          <Icon name="calendar" size={15} color="#fff" />
        </div>
        <span style={{ fontSize: 15, fontWeight: 600, color: T.text, fontFamily: "'Lora', serif", letterSpacing: "-0.01em" }}>Calendar Sync</span>
      </div>

      <div style={{ flex: 1, maxWidth: 440, display: "flex", alignItems: "center", gap: 8, background: T.surface2, border: `1.5px solid ${T.borderSub}`, borderRadius: 99, padding: "0 14px", height: 36 }}>
        <Icon name="search" size={14} color={T.faint} />
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          onClick={(e) => e.stopPropagation()}
          placeholder="Search courses, assignments..."
          className="h-auto border-none bg-transparent px-0 py-0 shadow-none ring-0 focus-visible:ring-0"
          style={{ color: T.text, fontFamily: "'DM Sans', sans-serif", fontSize: 13 }}
        />
      </div>

      <div style={{ flex: 1 }} />

      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <div style={{ position: "relative" }} onClick={(e) => e.stopPropagation()}>
          <button onClick={() => { setAvatarOpen((o) => !o) }} style={{ width: 34, height: 34, borderRadius: "50%", background: "oklch(0.88 0.06 285)", border: `2px solid ${avatarOpen ? T.accent : T.border}`, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", transition: "border-color 0.15s" }}>
            <span style={{ fontSize: 12, fontWeight: 700, color: T.accent }}>{initial}</span>
          </button>
          {avatarOpen && (
            <div style={{ position: "absolute", top: 42, right: 0, width: 200, ...cardStyle({ padding: "8px 0", zIndex: 100 }), animation: "fadeUp 0.15s ease" }}>
              <div style={{ padding: "10px 16px 8px", borderBottom: `1px solid ${T.borderSub}` }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: T.text }}>{firstName}</div>
                <div style={{ fontSize: 11, color: T.faint, marginTop: 1 }}>{email}</div>
              </div>
              <button onClick={onLogout} style={{ display: "flex", alignItems: "center", gap: 8, width: "100%", padding: "10px 16px", border: "none", background: "transparent", color: "oklch(0.50 0.14 28)", fontFamily: "'DM Sans', sans-serif", fontSize: 13, cursor: "pointer", textAlign: "left" }}>
                <Icon name="logOut" size={14} color="oklch(0.50 0.14 28)" /> Sign out
              </button>
            </div>
          )}
        </div>
      </div>
    </nav>
  )
}

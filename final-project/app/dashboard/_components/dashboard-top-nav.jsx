"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { NOTIFICATIONS, T, cardStyle } from "../_lib/dashboard-data"
import { Icon } from "./dashboard-icons"

export function DashboardTopNav({
  search,
  setSearch,
  notifOpen,
  setNotifOpen,
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
        <Button style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "8px 16px", border: "none", borderRadius: 99, background: T.accent, color: "#fff", fontFamily: "'DM Sans', sans-serif", fontWeight: 600, fontSize: 13, boxShadow: `0 2px 8px oklch(0.50 0.18 285 / 0.28)`, whiteSpace: "nowrap" }}>
          <Icon name="plus" size={14} color="#fff" /> New Document
        </Button>

        <div style={{ position: "relative" }} onClick={(e) => e.stopPropagation()}>
          <Button variant="outline" size="icon-sm" onClick={() => { setNotifOpen((o) => !o); setAvatarOpen(false) }} style={{ width: 36, height: 36, borderRadius: 99, position: "relative", background: notifOpen ? T.accentBg : T.surface2, border: `1.5px solid ${notifOpen ? T.accent : T.borderSub}` }}>
            <Icon name="bell" size={15} color={notifOpen ? T.accent : T.faint} />
            <span style={{ position: "absolute", top: 6, right: 6, width: 7, height: 7, borderRadius: "50%", background: "oklch(0.60 0.18 28)", border: `2px solid ${T.surface}` }} />
          </Button>
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

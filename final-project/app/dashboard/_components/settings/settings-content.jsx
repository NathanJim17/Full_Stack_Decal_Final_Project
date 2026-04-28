"use client"

import { Button } from "@/components/ui/button"
import { Icon } from "../dashboard-icons"
import { T, btnGhostStyle, cardStyle } from "../../_lib/dashboard-data"

function SettingRow({ label, value }) {
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, padding: "14px 0", borderBottom: `1px solid ${T.borderSub}` }}>
      <span style={{ fontSize: 13, color: T.text, fontWeight: 500 }}>{label}</span>
      <span style={{ fontSize: 12, color: T.muted, textAlign: "right" }}>{value}</span>
    </div>
  )
}

export function DashboardSettingsContent({ userEmail, onOpenDocuments }) {
  return (
    <main style={{ flex: 1, overflowY: "auto", padding: "32px 36px" }}>
      <div style={{ marginBottom: 18 }}>
        <h1 style={{ fontSize: 24, fontWeight: 600, color: T.text, fontFamily: "'Lora', serif", letterSpacing: "-0.02em", marginBottom: 5 }}>
          Settings
        </h1>
        <p style={{ fontSize: 13.5, color: T.muted, maxWidth: 620 }}>
          Keep this page lightweight for the MVP. Account and sync settings can be expanded after the backend workflows are finalized.
        </p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "minmax(320px, 640px)", gap: 18 }}>
        <section style={cardStyle({ padding: "22px 24px" })}>
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 8 }}>
            <div style={{ width: 40, height: 40, borderRadius: 12, background: T.accentBg, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Icon name="settings" size={18} color={T.accent} />
            </div>
            <div>
              <div style={{ fontSize: 15, fontWeight: 600, color: T.text, fontFamily: "'Lora', serif" }}>Account overview</div>
              <div style={{ fontSize: 12, color: T.faint }}>Minimal placeholder for now</div>
            </div>
          </div>

          <SettingRow label="Signed in as" value={userEmail || "No email available"} />
          <SettingRow label="Course sync" value="Coming soon" />
          <SettingRow label="Calendar sync" value="Managed after review flow" />
          <SettingRow label="Notion sync" value="Managed after approval flow" />

          <div style={{ paddingTop: 16 }}>
            <Button variant="outline" style={btnGhostStyle} onClick={() => onOpenDocuments?.()}>
              <Icon name="upload" size={12} color="currentColor" /> Review uploaded documents
            </Button>
          </div>
        </section>
      </div>
    </main>
  )
}

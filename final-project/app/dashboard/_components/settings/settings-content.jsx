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

function StatusPill({ tone, children }) {
  const palette = tone === "ready"
    ? { bg: "oklch(0.92 0.06 155)", color: "oklch(0.43 0.12 155)" }
    : tone === "pending"
      ? { bg: "oklch(0.94 0.05 70)", color: "oklch(0.44 0.12 75)" }
      : { bg: T.surface2, color: T.muted }

  return (
    <span style={{ display: "inline-flex", alignItems: "center", borderRadius: 999, padding: "4px 9px", fontSize: 11, fontWeight: 600, background: palette.bg, color: palette.color }}>
      {children}
    </span>
  )
}

function IntegrationCard({ icon, title, description, status, tone }) {
  return (
    <div style={{ ...cardStyle({ padding: "18px 18px 16px" }), boxShadow: "none" }}>
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12, marginBottom: 10 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 36, height: 36, borderRadius: 11, background: T.surface2, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Icon name={icon} size={16} color={T.accent} />
          </div>
          <div>
            <div style={{ fontSize: 13, fontWeight: 600, color: T.text }}>{title}</div>
            <div style={{ fontSize: 11.5, color: T.faint, marginTop: 2 }}>{description}</div>
          </div>
        </div>
        <StatusPill tone={tone}>{status}</StatusPill>
      </div>
    </div>
  )
}

function ShortcutButton({ icon, label, description, onClick }) {
  return (
    <Button
      variant="outline"
      onClick={onClick}
      style={{
        ...cardStyle({ padding: "14px 16px", border: `1.5px solid ${T.borderSub}`, boxShadow: "none" }),
        display: "flex",
        alignItems: "center",
        justifyContent: "flex-start",
        gap: 12,
        textAlign: "left",
        minHeight: 70,
      }}>
      <div style={{ width: 34, height: 34, borderRadius: 10, background: T.accentBg, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
        <Icon name={icon} size={15} color={T.accent} />
      </div>
      <div>
        <div style={{ fontSize: 12.5, fontWeight: 600, color: T.text }}>{label}</div>
        <div style={{ fontSize: 11.5, color: T.faint, marginTop: 2 }}>{description}</div>
      </div>
    </Button>
  )
}

export function DashboardSettingsContent({ userEmail, onLogout, onOpenDocuments, onOpenCalendar, onOpenNotion }) {
  return (
    <main style={{ flex: 1, overflowY: "auto", padding: "32px 36px" }}>
      <div style={{ marginBottom: 18 }}>
        <h1 style={{ fontSize: 24, fontWeight: 600, color: T.text, fontFamily: "'Lora', serif", letterSpacing: "-0.02em", marginBottom: 5 }}>
          Settings
        </h1>
        <p style={{ fontSize: 13.5, color: T.muted, maxWidth: 620 }}>
          Keep this page lightweight for the MVP, but make it genuinely useful during demos: account context, integration status, and quick navigation.
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
              <div style={{ fontSize: 12, color: T.faint }}>Current session and account actions</div>
            </div>
          </div>

          <SettingRow label="Signed in as" value={userEmail || "No email available"} />
          <SettingRow label="Workspace" value="Calendar Sync MVP" />
          <SettingRow label="Course source" value="Generated from uploaded documents" />
          <SettingRow label="Review flow" value="Documents → review → sync" />

          <div style={{ paddingTop: 16, display: "flex", gap: 10, flexWrap: "wrap" }}>
            <Button variant="outline" style={btnGhostStyle} onClick={() => onOpenDocuments?.()}>
              <Icon name="upload" size={12} color="currentColor" /> Review uploaded documents
            </Button>
            <Button
              variant="outline"
              style={{ ...btnGhostStyle, color: "oklch(0.50 0.14 28)", borderColor: "oklch(0.88 0.05 28)" }}
              onClick={() => onLogout?.()}>
              <Icon name="logOut" size={12} color="currentColor" /> Sign out
            </Button>
          </div>
        </section>

        <section style={cardStyle({ padding: "22px 24px" })}>
          <div style={{ marginBottom: 14 }}>
            <div style={{ fontSize: 15, fontWeight: 600, color: T.text, fontFamily: "'Lora', serif" }}>Integrations</div>
            <div style={{ fontSize: 12, color: T.faint, marginTop: 3 }}>Read-only status for the systems that matter in the MVP.</div>
          </div>

          <div style={{ display: "grid", gap: 10 }}>
            <IntegrationCard
              icon="calendar"
              title="Google Calendar"
              description="Calendar sync happens after the review flow is approved."
              status="Ready for review flow"
              tone="ready"
            />
            <IntegrationCard
              icon="link"
              title="Notion"
              description="Workspace shortcut is available now; deeper sync comes after approval."
              status="Shortcut available"
              tone="pending"
            />
            <IntegrationCard
              icon="sparkles"
              title="Document parser"
              description="Uploaded PDFs can be parsed into assignments from the Documents page."
              status="Enabled"
              tone="ready"
            />
          </div>
        </section>

        <section style={cardStyle({ padding: "22px 24px" })}>
          <div style={{ marginBottom: 14 }}>
            <div style={{ fontSize: 15, fontWeight: 600, color: T.text, fontFamily: "'Lora', serif" }}>Quick actions</div>
            <div style={{ fontSize: 12, color: T.faint, marginTop: 3 }}>Useful shortcuts instead of placeholder preferences.</div>
          </div>

          <div style={{ display: "grid", gap: 10 }}>
            <ShortcutButton
              icon="upload"
              label="Open Documents"
              description="Upload syllabi, check parse status, and review extracted assignments."
              onClick={() => onOpenDocuments?.()}
            />
            <ShortcutButton
              icon="calendar"
              label="Open Calendar"
              description="Jump to the embedded calendar view or open Google Calendar."
              onClick={() => onOpenCalendar?.()}
            />
            <ShortcutButton
              icon="link"
              label="Open Notion"
              description="Open your Notion workspace in a new tab."
              onClick={() => onOpenNotion?.()}
            />
          </div>
        </section>
      </div>
    </main>
  )
}

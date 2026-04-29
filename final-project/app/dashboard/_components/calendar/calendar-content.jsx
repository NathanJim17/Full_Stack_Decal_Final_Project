"use client"

import { T, cardStyle } from "../../_lib/dashboard-data"
import { Icon } from "../dashboard-icons"

const GOOGLE_CALENDAR_EMBED_URL =
  "https://calendar.google.com/calendar/embed?mode=WEEK&showTitle=0&showPrint=0&showTabs=0&showCalendars=0&showTz=1"

export function DashboardCalendarContent() {
  return (
    <main style={{ flex: 1, overflowY: "auto", padding: "32px 36px" }}>
      <div style={{ marginBottom: 8 }}>
        <h1
          style={{
            fontSize: 24,
            fontWeight: 600,
            color: T.text,
            fontFamily: "'Lora', serif",
            letterSpacing: "-0.02em",
            marginBottom: 5,
          }}>
          Calendar
        </h1>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
          <p style={{ fontSize: 13.5, color: T.muted, maxWidth: 620 }}>
            Live Google Calendar view for your connected account. If this embedded view is blocked by browser auth or cookie settings, use Open in Google Calendar.
          </p>
        <a
          href="https://calendar.google.com"
          target="_blank"
          rel="noreferrer"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 7,
            padding: "8px 14px",
            borderRadius: 99,
            border: `1.5px solid ${T.borderSub}`,
            background: T.surface,
            color: T.muted,
            textDecoration: "none",
            fontFamily: "'DM Sans', sans-serif",
            fontWeight: 600,
            fontSize: 12.5,
          }}>
          <Icon name="link" size={14} color={T.faint} />
          Open in Google Calendar
        </a>
        </div>
      </div>

      <div style={cardStyle({ overflow: "hidden", padding: 0, minHeight: "calc(100vh - 180px)" })}>
        <iframe
          title="Google Calendar"
          src={GOOGLE_CALENDAR_EMBED_URL}
          style={{ width: "100%", height: "calc(100vh - 10px)", border: "none", background: T.surface }}
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
        />
      </div>
    </main>
  )
}

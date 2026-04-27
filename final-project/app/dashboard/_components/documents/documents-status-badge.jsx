"use client"

import { Icon } from "../dashboard-icons"
import { STATUS_CONFIG } from "./documents-data"

export function StatusBadge({ status }) {
  const cfg = STATUS_CONFIG[status] || STATUS_CONFIG["Uploaded"]
  const spinning = status === "Processing"

  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: 5,
      background: cfg.bg, color: cfg.color,
      fontSize: 11, fontWeight: 600, letterSpacing: "0.02em",
      padding: "3px 9px", borderRadius: 99,
    }}>
      <Icon
        name={cfg.icon}
        size={11}
        color={cfg.color}
        style={spinning ? { animation: "spin 1.2s linear infinite" } : {}}
      />
      {status}
    </span>
  )
}

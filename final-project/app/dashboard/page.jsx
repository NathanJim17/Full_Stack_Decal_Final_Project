"use client"

import { DashboardShell } from "./_components/dashboard-shell"
import { useDashboardAuth } from "./_hooks/use-dashboard-auth"
import { T } from "./_lib/dashboard-data"

export default function DashboardPage() {
  const { user, loading, handleLogout } = useDashboardAuth()
  if (loading) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100vh", background: T.bg, fontFamily: "'DM Sans', sans-serif", color: T.muted, fontSize: 14 }}>
        Loading dashboard…
      </div>
    )
  }

  return <DashboardShell user={user} onLogout={handleLogout} />
}

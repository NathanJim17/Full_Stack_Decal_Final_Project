"use client"

import { useState } from "react"
import { COURSES, T } from "../_lib/dashboard-data"
import { useDashboardDeadlines } from "../_hooks/use-dashboard-deadlines"
import { DashboardMainContent } from "./dashboard-main-content"
import { DashboardSidebar } from "./dashboard-sidebar"
import { DashboardTopNav } from "./dashboard-top-nav"

export function DashboardShell({ user, onLogout }) {
  const [search, setSearch] = useState("")
  const [activeNav, setActiveNav] = useState("dashboard")
  const [notifOpen, setNotifOpen] = useState(false)
  const [avatarOpen, setAvatarOpen] = useState(false)

  const { deadlines, loading: deadlinesLoading, error: deadlinesError } = useDashboardDeadlines(user?.id)

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
      <DashboardTopNav
        search={search}
        setSearch={setSearch}
        notifOpen={notifOpen}
        setNotifOpen={setNotifOpen}
        avatarOpen={avatarOpen}
        setAvatarOpen={setAvatarOpen}
        firstName={firstName}
        initial={initial}
        email={user?.email}
        onLogout={onLogout}
      />

      <div style={{ flex: 1, display: "flex", overflow: "hidden" }}>
        <DashboardSidebar activeNav={activeNav} setActiveNav={setActiveNav} />
        <DashboardMainContent
          greeting={greeting}
          firstName={firstName}
          today={today}
          filteredCourses={filteredCourses}
          search={search}
          deadlines={deadlines}
          deadlinesLoading={deadlinesLoading}
          deadlinesError={deadlinesError}
        />
      </div>
    </div>
  )
}

"use client"

import { useState } from "react"
import { T } from "../_lib/dashboard-data"
import { useDashboardCourses } from "../_hooks/use-dashboard-courses"
import { useDashboardDeadlines } from "../_hooks/use-dashboard-deadlines"
import { DashboardMainContent } from "./dashboard-main-content"
import { DashboardSidebar } from "./dashboard-sidebar"
import { DashboardTopNav } from "./dashboard-top-nav"
import { DashboardDocumentsContent } from "./documents/documents-content"

function getSemesterInfo(now = new Date()) {
  const year = now.getFullYear()
  const month = now.getMonth()
  const isSpring = month <= 4
  const isFall = month >= 7
  const term = isSpring ? "Spring" : isFall ? "Fall" : "Summer"
  const weeksTotal = 16

  // Approximate semester starts for a rolling, non-static label.
  const startDate = isSpring
    ? new Date(year, 0, 20)
    : isFall
      ? new Date(year, 7, 20)
      : new Date(year, 5, 10)

  const elapsedMs = now.getTime() - startDate.getTime()
  const elapsedWeeks = Math.floor(elapsedMs / (1000 * 60 * 60 * 24 * 7))
  const currentWeek = Math.min(weeksTotal, Math.max(1, elapsedWeeks + 1))

  return { term, year, currentWeek, weeksTotal }
}

export function DashboardShell({ user, onLogout }) {
  const [search, setSearch] = useState("")
  const [activeNav, setActiveNav] = useState("dashboard")
  const [notifOpen, setNotifOpen] = useState(false)
  const [avatarOpen, setAvatarOpen] = useState(false)

  const { courses, loading: coursesLoading, error: coursesError } = useDashboardCourses(user?.id)
  const { deadlines, loading: deadlinesLoading, error: deadlinesError } = useDashboardDeadlines(user?.id)

  const firstName = user?.user_metadata?.full_name?.split(" ")[0] || user?.email?.split("@")[0] || "there"
  const initial = firstName[0].toUpperCase()
  const hour = new Date().getHours()
  const greeting = hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening"
  const today = new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })
  const semester = getSemesterInfo()
  

  const filteredCourses = courses.filter(
    (c) => !search || c.code.toLowerCase().includes(search.toLowerCase()) || c.name.toLowerCase().includes(search.toLowerCase())
  )

  // Temporary debug logs to verify auth user + fetched dashboard data.
  console.log("dashboard user id:", user?.id)
  console.log(
    "dashboard data:",
    JSON.stringify({
      coursesCount: courses.length,
      deadlinesCount: deadlines.length,
      coursesError,
      deadlinesError,
    })
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
        <DashboardSidebar activeNav={activeNav} setActiveNav={setActiveNav} courses={courses} />
        {activeNav === "docs" ? (
          <DashboardDocumentsContent courses={courses} />
        ) : (
          <DashboardMainContent
            greeting={greeting}
            firstName={firstName}
            today={today}
            semesterLabel={`${semester.term} ${semester.year} · Week ${semester.currentWeek} of ${semester.weeksTotal}`}
            courses={courses}
            filteredCourses={filteredCourses}
            search={search}
            coursesLoading={coursesLoading}
            coursesError={coursesError}
            deadlines={deadlines}
            deadlinesLoading={deadlinesLoading}
            deadlinesError={deadlinesError}
          />
        )}
      </div>
    </div>
  )
}

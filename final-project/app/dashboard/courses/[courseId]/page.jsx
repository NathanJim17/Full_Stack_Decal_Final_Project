"use client"

import { use, useCallback, useState } from "react"
import { useRouter } from "next/navigation"
import { DashboardSidebar } from "../../_components/dashboard-sidebar"
import { DashboardTopNav } from "../../_components/dashboard-top-nav"
import { CourseDetailContent } from "../../_components/courses/course-detail-content"
import { useDashboardAuth } from "../../_hooks/use-dashboard-auth"
import { useDashboardCourses } from "../../_hooks/use-dashboard-courses"
import { useDashboardCourseDetail } from "../../_hooks/use-dashboard-course-detail"
import { T } from "../../_lib/dashboard-data"

function getSemesterTermLabel(now = new Date()) {
  const year = now.getFullYear()
  const month = now.getMonth()
  const term = month <= 4 ? "Spring" : month >= 7 ? "Fall" : "Summer"
  return `${term} ${year}`
}

export default function CourseDetailPage({ params }) {
  const resolvedParams = use(params)
  const { user, loading: authLoading, handleLogout } = useDashboardAuth()
  const { courses } = useDashboardCourses(user?.id)
  const { course, documents, deadlines, loading, error } = useDashboardCourseDetail(user?.id, resolvedParams.courseId)
  const [search, setSearch] = useState("")
  const [avatarOpen, setAvatarOpen] = useState(false)
  const router = useRouter()

  const firstName = user?.user_metadata?.full_name?.split(" ")[0] || user?.email?.split("@")[0] || "there"
  const initial = firstName[0]?.toUpperCase() || "U"
  const semesterTermLabel = getSemesterTermLabel()

  const handleNavChange = useCallback((nextNav) => {
    if (nextNav === "dashboard") {
      router.push("/dashboard")
      return
    }
    router.push(`/dashboard?tab=${nextNav}`)
  }, [router])

  const handleOpenCourse = useCallback((nextCourseId) => {
    router.push(`/dashboard/courses/${nextCourseId}`)
  }, [router])

  if (authLoading || loading) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100vh", background: T.bg, fontFamily: "'DM Sans', sans-serif", color: T.muted, fontSize: 14 }}>
        Loading course…
      </div>
    )
  }

  if (!course || error) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100vh", background: T.bg, fontFamily: "'DM Sans', sans-serif", color: error ? "oklch(0.50 0.14 28)" : T.muted, fontSize: 14 }}>
        {error ? `Could not load course: ${error}` : "Course not found."}
      </div>
    )
  }

  return (
    <div
      onClick={() => { setAvatarOpen(false) }}
      style={{ display: "flex", flexDirection: "column", height: "100vh", background: T.bg, overflow: "hidden", fontFamily: "'DM Sans', sans-serif", color: T.text, WebkitFontSmoothing: "antialiased" }}>
      <DashboardTopNav
        search={search}
        setSearch={setSearch}
        avatarOpen={avatarOpen}
        setAvatarOpen={setAvatarOpen}
        firstName={firstName}
        initial={initial}
        email={user?.email}
        onLogout={handleLogout}
      />

      <div style={{ flex: 1, display: "flex", overflow: "hidden" }}>
        <DashboardSidebar activeNav="courses" setActiveNav={handleNavChange} courses={courses} onOpenCourse={handleOpenCourse} />
        <CourseDetailContent
          course={course}
          documents={documents.filter((document) => !search || document.name.toLowerCase().includes(search.toLowerCase()))}
          deadlines={deadlines.filter((deadline) => !search || deadline.title.toLowerCase().includes(search.toLowerCase()))}
          semesterTermLabel={semesterTermLabel}
          onOpenDocuments={() => router.push(`/dashboard?tab=docs`)}
          onOpenCalendar={() => router.push(`/dashboard?tab=calendar`)}
          onOpenNotion={() => window.open("https://www.notion.so/", "_blank", "noopener,noreferrer")}
        />
      </div>
    </div>
  )
}

"use client"

import { useCallback, useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { T } from "../_lib/dashboard-data"
import { useDashboardCourses } from "../_hooks/use-dashboard-courses"
import { useDashboardDeadlines } from "../_hooks/use-dashboard-deadlines"
import { DashboardMainContent } from "./dashboard-main-content"
import { DashboardSidebar } from "./dashboard-sidebar"
import { DashboardTopNav } from "./dashboard-top-nav"
import { DashboardDocumentsContent } from "./documents/documents-content"
import { DashboardCalendarContent } from "./calendar/calendar-content"
import { DashboardCoursesContent } from "./courses/courses-content"
import { DashboardSettingsContent } from "./settings/settings-content"
import { Dialog, DialogContent, DialogTrigger, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog.jsx"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"

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
  const [avatarOpen, setAvatarOpen] = useState(false)
  const router = useRouter()
  const searchParams = useSearchParams()

  const { courses, loading: coursesLoading, error: coursesError, createCourse } = useDashboardCourses(user?.id)
  const { deadlines, loading: deadlinesLoading, error: deadlinesError } = useDashboardDeadlines(user?.id)

  const firstName = user?.user_metadata?.full_name?.split(" ")[0] || user?.email?.split("@")[0] || "there"
  const initial = firstName[0].toUpperCase()
  const hour = new Date().getHours()
  const greeting = hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening"
  const today = new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })
  const semester = getSemesterInfo()
  
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [formData, setFormData] = useState({ title: "", description: "", fileId: ""})

  const filteredCourses = courses.filter(
    (c) => !search || c.code.toLowerCase().includes(search.toLowerCase()) || c.name.toLowerCase().includes(search.toLowerCase())
  )

  useEffect(() => {
    const tab = searchParams.get("tab")
    if (tab && ["dashboard", "courses", "calendar", "docs", "settings"].includes(tab)) {
      setActiveNav(tab)
      return
    }
    setActiveNav("dashboard")
  }, [searchParams])

  const handleNavChange = useCallback((nextNav) => {
    setActiveNav(nextNav)
    if (nextNav === "dashboard") {
      router.push("/dashboard")
      return
    }
    router.push(`/dashboard?tab=${nextNav}`)
  }, [router])

  const handleOpenCourse = useCallback((courseId) => {
    router.push(`/dashboard/courses/${courseId}`)
  }, [router])

  const handleCreateNotionPage = async () => {
      try {
        // Use the specific endpoint you made for Supabase
        // Assuming you want to pass a specific file_id
        const response = await fetch("/api/notion/page-from-supabase?file_id=YOUR_FILE_ID_HERE", {
          method: "POST",
        });

        if (!response.ok) throw new Error("Failed to create Notion page");

        const result = await response.json();
        alert("Notion page created!");
        if (result.url) window.open(result.url, "_blank");
      } catch (error) {
        console.error(error);
        alert("Error: " + error.message);
      }
    };

  const handleSubmit = async () => {
  // Always good to log with a comma so you can inspect the object in the console!
  console.log("Submitting form data:", formData);

    try {
      // We send the fileId as a query parameter to match your FastAPI setup
      const response = await fetch(`/api/notion/page-from-supabase?file_id=${formData.fileId}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        // If your backend needs the name/details too, send them in the body
        body: JSON.stringify({
          title: formData.name,
          content: formData.details
        }),
      });

      if (!response.ok) throw new Error("Failed to create page");

      const result = await response.json();
      alert("Success! Page created.");
      
      if (result.url) window.open(result.url, "_blank");
      
      // Close the modal and reset form
      setIsModalOpen(false);
      setFormData({ name: "", details: "", fileId: "" });
      
    } catch (error) {
      console.error("Submission error:", error);
      alert("Failed to create Notion page.");
    }
  };

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
        onLogout={onLogout}
      />

      <div style={{ flex: 1, display: "flex", overflow: "hidden" }}>
        <DashboardSidebar activeNav={activeNav} setActiveNav={handleNavChange} courses={courses} onOpenCourse={handleOpenCourse} />
        {activeNav === "courses" ? (
          <DashboardCoursesContent
            courses={courses}
            search={search}
            semesterLabel={`${semester.term} ${semester.year} · Week ${semester.currentWeek} of ${semester.weeksTotal}`}
            loading={coursesLoading}
            error={coursesError}
            onOpenDocuments={() => handleNavChange("docs")}
            onAddCourse={createCourse}
          />
        ) : activeNav === "docs" ? (
          <DashboardDocumentsContent courses={courses} userId={user?.id} />
        ) : activeNav === "calendar" ? (
          <DashboardCalendarContent />
        ) : activeNav === "settings" ? (
          <DashboardSettingsContent
            userEmail={user?.email}
            onLogout={onLogout}
            onOpenDocuments={() => handleNavChange("docs")}
            onOpenCalendar={() => handleNavChange("calendar")}
            onOpenNotion={() => window.open("https://www.notion.so/", "_blank", "noopener,noreferrer")}
          />
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
            handleCreateNotionPage= { handleCreateNotionPage }
            onOpenCourses={() => handleNavChange("courses")}
            onOpenCourse={handleOpenCourse}
            onOpenDocuments={() => handleNavChange("docs")}
            onOpenCalendar={() => handleNavChange("calendar")}
            onOpenNotion={() => window.open("https://www.notion.so/", "_blank", "noopener,noreferrer")}
          />
        )}
      </div>
    </div>
  );
}

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
import { Dialog, DialogContent, DialogTrigger, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
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

"use client"

import { useCallback, useEffect, useState } from "react"
// ... (keep all your existing imports)

export function DashboardShell({ user, onLogout }) {
  const [mounted, setMounted] = useState(false) // Added for hydration
  const [search, setSearch] = useState("")
  const [activeNav, setActiveNav] = useState("dashboard")
  const [avatarOpen, setAvatarOpen] = useState(false)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [formData, setFormData] = useState({ name: "", details: "", fileId: "" })

  const router = useRouter()
  const searchParams = useSearchParams()

  const { courses, loading: coursesLoading, error: coursesError } = useDashboardCourses(user?.id)
  const { deadlines, loading: deadlinesLoading, error: deadlinesError } = useDashboardDeadlines(user?.id)

  // Triggered on mount
  useEffect(() => {
    setMounted(true)
    const tab = searchParams.get("tab")
    if (tab && ["dashboard", "courses", "calendar", "docs", "settings"].includes(tab)) {
      setActiveNav(tab)
    }
  }, [searchParams])

  if (!mounted) return null // Prevents hydration flicker

  // Data formatting logic
  const firstName = user?.user_metadata?.full_name?.split(" ")[0] || user?.email?.split("@")[0] || "there"
  const initial = firstName[0].toUpperCase()
  const hour = new Date().getHours()
  const greeting = hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening"
  const today = new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })
  const semester = getSemesterInfo()

  const filteredCourses = courses.filter(
    (c) => !search || c.code.toLowerCase().includes(search.toLowerCase()) || c.name.toLowerCase().includes(search.toLowerCase())
  )

  const handleNavChange = useCallback((nextNav) => {
    setActiveNav(nextNav)
    router.push(nextNav === "dashboard" ? "/dashboard" : `/dashboard?tab=${nextNav}`)
  }, [router])

  const handleOpenCourse = useCallback((courseId) => {
    router.push(`/dashboard/courses/${courseId}`)
  }, [router])

  const handleSubmit = async () => {
    try {
      const response = await fetch(`/api/notion/page-from-supabase?file_id=${formData.fileId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: formData.name,
          content: formData.details
        }),
      });

      if (!response.ok) throw new Error("Failed to create page");

      const result = await response.json();
      alert("Success! Page created.");
      if (result.url) window.open(result.url, "_blank");
      
      setIsModalOpen(false);
      setFormData({ name: "", details: "", fileId: "" });
    } catch (error) {
      console.error("Submission error:", error);
      alert("Failed to create Notion page.");
    }
  };

  return (
    <div
      onClick={() => setAvatarOpen(false)}
      style={{ display: "flex", flexDirection: "column", height: "100vh", background: T.bg, overflow: "hidden", fontFamily: "'DM Sans', sans-serif", color: T.text, WebkitFontSmoothing: "antialiased" }}
    >
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
        
        {activeNav === "docs" ? (
          <DashboardDocumentsContent courses={courses} userId={user?.id} />
        ) : activeNav === "calendar" ? (
          <DashboardCalendarContent />
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
            handleCreateNotionPage={() => setIsModalOpen(true)} // Fixed Logic
            onOpenCourses={() => handleNavChange("courses")}
            onOpenCourse={handleOpenCourse}
            onOpenDocuments={() => handleNavChange("docs")}
            onOpenCalendar={() => handleNavChange("calendar")}
            onOpenNotion={() => window.open("https://www.notion.so/", "_blank", "noopener,noreferrer")}
          />
        )}
      </div>

      {/* DIALOG COMPONENT */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-[425px] bg-white text-slate-900">
          <DialogHeader>
            <DialogTitle style={{ fontFamily: "'Lora', serif", fontSize: "1.25rem" }}>Create Notion Page</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Page Title</Label>
              <Input 
                id="name" 
                className="text-slate-900"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                placeholder="e.g., Biology Lecture Notes" 
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="details">Details/Description</Label>
              <Input 
                id="details" 
                className="text-slate-900"
                value={formData.details}
                onChange={(e) => setFormData({...formData, details: e.target.value})}
                placeholder="What is this page about?" 
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="file">Reference Document</Label>
              <select 
                id="file"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-ring"
                value={formData.fileId}
                onChange={(e) => setFormData({...formData, fileId: e.target.value})}
              >
                <option value="">Select a course document...</option>
                {courses.map((course) => (
                  <option key={course.id} value={course.id}>
                    {course.code}: {course.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsModalOpen(false)}>Cancel</Button>
            <Button 
                onClick={handleSubmit} 
                disabled={!formData.fileId || !formData.name}
                className="bg-black text-white hover:bg-slate-800"
            >
              Create Page
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
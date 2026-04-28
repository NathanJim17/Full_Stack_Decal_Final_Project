"use client"

import Link from "next/link"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Progress } from "../dashboard-primitives"
import { Icon } from "../dashboard-icons"
import { T, btnGhostStyle, cardStyle } from "../../_lib/dashboard-data"

function CourseOverviewCard({ course, semesterTermLabel }) {
  const upcomingCount = Array.isArray(course.deadlines) ? course.deadlines.length : 0

  return (
    <div style={{ ...cardStyle({ padding: 0, overflow: "hidden" }), minWidth: 0 }}>
      <div style={{ position: "relative", padding: "18px 18px 16px", background: course.colorBg, borderBottom: `1px solid ${T.borderSub}` }}>
        <div style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "4px 10px", borderRadius: 999, background: course.color, color: "#fff", fontSize: 11, fontWeight: 700 }}>
          <span>{course.code}</span>
          <span style={{ width: 6, height: 6, borderRadius: "50%", background: "rgba(255,255,255,0.75)" }} />
        </div>
        <div
          aria-hidden="true"
          style={{
            position: "absolute",
            top: 12,
            right: 18,
            fontFamily: "'Lora', serif",
            fontSize: 54,
            lineHeight: 1,
            color: "rgba(0,0,0,0.08)",
            fontWeight: 700,
            letterSpacing: "-0.04em",
          }}>
          {course.code.split(" ").slice(-1)[0]}
        </div>
      </div>

      <div style={{ padding: "16px 18px 14px" }}>
        <div style={{ minHeight: 52 }}>
          <div style={{ fontSize: 18, fontWeight: 600, color: T.text, fontFamily: "'Lora', serif", lineHeight: 1.2 }}>
            {course.name}
          </div>
          <div style={{ marginTop: 6, fontSize: 12, color: T.muted }}>
            {course.prof || "Professor not added"}
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap", marginTop: 16, marginBottom: 16, fontSize: 11.5, color: T.muted }}>
          <span style={{ display: "inline-flex", alignItems: "center", gap: 5 }}>
            <Icon name="fileText" size={12} color={T.faint} />
            {course.assignments || 0} {course.assignments === 1 ? "assignment" : "assignments"}
          </span>
          <span style={{ display: "inline-flex", alignItems: "center", gap: 5 }}>
            <Icon name="clock" size={12} color={T.faint} />
            {upcomingCount > 0 ? `${upcomingCount} upcoming` : "No deadlines"}
          </span>
        </div>

        <div style={{ marginBottom: 18 }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
            <span style={{ fontSize: 11, color: T.faint }}>Semester progress</span>
            <span style={{ fontSize: 11, fontWeight: 600, color: T.muted }}>{course.progress || 0}%</span>
          </div>
          <Progress value={course.progress || 0} color={course.color} />
        </div>

        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", paddingTop: 12, borderTop: `1px solid ${T.borderSub}` }}>
          <span style={{ fontSize: 11.5, color: T.faint }}>{semesterTermLabel}</span>
          <Link href={`/dashboard/courses/${course.id}`} style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 12, fontWeight: 500, color: T.muted, textDecoration: "none" }}>
            Open <Icon name="arrowRight" size={12} color="currentColor" />
          </Link>
        </div>
      </div>
    </div>
  )
}

export function DashboardCoursesContent({
  courses = [],
  search = "",
  semesterLabel,
  loading = false,
  error = null,
  onOpenDocuments,
  onAddCourse,
}) {
  const [showAddForm, setShowAddForm] = useState(false)
  const [newCode, setNewCode] = useState("")
  const [newName, setNewName] = useState("")
  const [newProf, setNewProf] = useState("")
  const [adding, setAdding] = useState(false)
  const [addError, setAddError] = useState("")
  const semesterTermLabel = semesterLabel?.split(" · ")[0] || "Current term"

  const filteredCourses = courses.filter(
    (course) =>
      !search ||
      course.code.toLowerCase().includes(search.toLowerCase()) ||
      course.name.toLowerCase().includes(search.toLowerCase())
  )

  async function handleCreateCourse() {
    setAddError("")
    setAdding(true)
    const result = await onAddCourse?.({
      code: newCode,
      name: newName,
      prof: newProf,
    })
    setAdding(false)

    if (!result?.ok) {
      setAddError(result?.error || "Could not create course.")
      return
    }

    setNewCode("")
    setNewName("")
    setNewProf("")
    setShowAddForm(false)
  }

  return (
    <main style={{ flex: 1, overflowY: "auto", padding: "32px 36px" }}>
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 16, marginBottom: 18, flexWrap: "wrap" }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 600, color: T.text, fontFamily: "'Lora', serif", letterSpacing: "-0.02em", marginBottom: 5 }}>
            Courses
          </h1>
          <p style={{ fontSize: 13.5, color: T.muted }}>
            {courses.length} active {courses.length === 1 ? "course" : "courses"}{semesterLabel ? ` · ${semesterLabel.split(" · ")[0]}` : ""}
          </p>
        </div>

        <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 6 }}>
          <Button
            variant="outline"
            onClick={() => {
              setShowAddForm((prev) => !prev)
              setAddError("")
            }}
            style={{
              ...btnGhostStyle,
              padding: "9px 14px",
              borderColor: "oklch(0.72 0.08 285)",
              background: "linear-gradient(180deg, oklch(0.57 0.18 285), oklch(0.50 0.18 285))",
              color: "#fff",
              boxShadow: "0 6px 18px oklch(0.50 0.18 285 / 0.20)",
              opacity: 0.98,
            }}>
            <Icon name="plus" size={13} color="currentColor" /> Add course
          </Button>
        </div>
      </div>

      {showAddForm && (
        <div style={cardStyle({ padding: "14px 14px 12px", marginBottom: 16, maxWidth: 460 })}>
          <div style={{ display: "grid", gap: 8 }}>
            <input
              value={newCode}
              onChange={(e) => setNewCode(e.target.value)}
              placeholder="Course code (e.g. CS 189)"
              style={{ height: 34, borderRadius: 8, border: `1.5px solid ${T.borderSub}`, background: T.surface2, padding: "0 10px", fontSize: 12.5, color: T.text, fontFamily: "'DM Sans', sans-serif" }}
            />
            <input
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="Course name"
              style={{ height: 34, borderRadius: 8, border: `1.5px solid ${T.borderSub}`, background: T.surface2, padding: "0 10px", fontSize: 12.5, color: T.text, fontFamily: "'DM Sans', sans-serif" }}
            />
            <input
              value={newProf}
              onChange={(e) => setNewProf(e.target.value)}
              placeholder="Professor (optional)"
              style={{ height: 34, borderRadius: 8, border: `1.5px solid ${T.borderSub}`, background: T.surface2, padding: "0 10px", fontSize: 12.5, color: T.text, fontFamily: "'DM Sans', sans-serif" }}
            />
          </div>

          {addError && <div style={{ marginTop: 8, fontSize: 12, color: "oklch(0.50 0.14 28)" }}>{addError}</div>}

          <div style={{ display: "flex", justifyContent: "flex-end", gap: 8, marginTop: 10 }}>
            <Button variant="outline" size="sm" style={btnGhostStyle} onClick={() => setShowAddForm(false)} disabled={adding}>
              Cancel
            </Button>
            <Button
              variant="outline"
              size="sm"
              style={{ ...btnGhostStyle, borderColor: T.accent, background: T.accent, color: "#fff" }}
              onClick={() => { void handleCreateCourse() }}
              disabled={adding}>
              {adding ? "Adding..." : "Create course"}
            </Button>
          </div>
        </div>
      )}

      {loading ? (
        <div style={cardStyle({ padding: "32px", textAlign: "center", fontSize: 13, color: T.muted })}>
          Loading courses...
        </div>
      ) : error ? (
        <div style={cardStyle({ padding: "32px", textAlign: "center", fontSize: 13, color: "oklch(0.50 0.14 28)" })}>
          Could not load courses: {error}
        </div>
      ) : courses.length === 0 ? (
        <div style={cardStyle({ padding: "48px 28px", textAlign: "center" })}>
          <div style={{ width: 52, height: 52, borderRadius: 14, background: T.accentBg, color: T.accent, display: "inline-flex", alignItems: "center", justifyContent: "center", marginBottom: 14 }}>
            <Icon name="bookOpen" size={24} color="currentColor" />
          </div>
          <h2 style={{ fontSize: 18, fontWeight: 600, color: T.text, fontFamily: "'Lora', serif", marginBottom: 6 }}>
            No courses yet
          </h2>
          <p style={{ fontSize: 13, color: T.muted, maxWidth: 420, margin: "0 auto 16px" }}>
            Upload a syllabus in Documents and your course list will start to take shape here.
          </p>
          <Button variant="outline" style={btnGhostStyle} onClick={() => onOpenDocuments?.()}>
            <Icon name="upload" size={12} color="currentColor" /> Go to Documents
          </Button>
        </div>
      ) : filteredCourses.length === 0 ? (
        <div style={cardStyle({ padding: "48px 28px", textAlign: "center" })}>
          <Icon name="alertCircle" size={28} color={T.border} />
          <p style={{ marginTop: 10, fontSize: 13, color: T.muted }}>
            No courses match the current search.
          </p>
        </div>
      ) : (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
            gap: 18,
            alignItems: "start",
          }}>
          {filteredCourses.map((course) => (
            <CourseOverviewCard key={course.id} course={course} semesterTermLabel={semesterTermLabel} />
          ))}
        </div>
      )}
    </main>
  )
}

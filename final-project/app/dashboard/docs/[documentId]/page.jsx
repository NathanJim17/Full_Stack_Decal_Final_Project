"use client"

import { use, useCallback, useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { DashboardSidebar } from "../../_components/dashboard-sidebar"
import { DashboardTopNav } from "../../_components/dashboard-top-nav"
import { Icon } from "../../_components/dashboard-icons"
import { T, cardStyle, btnGhostStyle } from "../../_lib/dashboard-data"
import { useDashboardAuth } from "../../_hooks/use-dashboard-auth"
import { useDashboardCourses } from "../../_hooks/use-dashboard-courses"
import { useDashboardDocumentReview } from "../../_hooks/use-dashboard-document-review"
import { supabase } from "@/lib/supabase"

const TYPES = ["Homework", "Exam", "Project", "Quiz", "Lab"]
const WEEKDAY_CODES = ["MO", "TU", "WE", "TH", "FR", "SA", "SU"]
const DAY_LABELS = {
  MO: "Mon",
  TU: "Tue",
  WE: "Wed",
  TH: "Thu",
  FR: "Fri",
  SA: "Sat",
  SU: "Sun",
}

const inputSt = {
  height: 34, padding: "0 10px",
  border: `1.5px solid ${T.border}`,
  borderRadius: 8, fontSize: 12.5, color: T.text,
  background: T.surface, fontFamily: "'DM Sans', sans-serif",
  outline: "none", width: "100%",
  boxShadow: "inset 0 1px 2px rgba(60,40,20,0.04)",
  transition: "border-color 0.15s",
}

function AssignmentRow({ assignment, index, onChange, onDelete }) {
  return (
    <tr style={{ borderBottom: `1px solid ${T.borderSub}` }}>
      <td style={{ padding: "8px 12px" }}>
        <input
          type="text"
          value={assignment.title ?? ""}
          placeholder="Assignment title"
          onChange={e => onChange(index, "title", e.target.value)}
          onFocus={e => e.target.style.borderColor = T.accent}
          onBlur={e => e.target.style.borderColor = T.border}
          style={inputSt}
        />
      </td>
      <td style={{ padding: "8px 12px", width: 160 }}>
        <input
          type="date"
          value={assignment.due_date ?? ""}
          onChange={e => onChange(index, "due_date", e.target.value)}
          onFocus={e => e.target.style.borderColor = T.accent}
          onBlur={e => e.target.style.borderColor = T.border}
          style={inputSt}
        />
      </td>
      <td style={{ padding: "8px 12px", width: 110 }}>
        <input
          type="text"
          value={assignment.weight ?? ""}
          placeholder="e.g. 15%"
          onChange={e => onChange(index, "weight", e.target.value)}
          onFocus={e => e.target.style.borderColor = T.accent}
          onBlur={e => e.target.style.borderColor = T.border}
          style={inputSt}
        />
      </td>
      <td style={{ padding: "8px 12px", width: 130 }}>
        <select
          value={assignment.type ?? "Homework"}
          onChange={e => onChange(index, "type", e.target.value)}
          style={{ ...inputSt, cursor: "pointer" }}
        >
          {TYPES.map(t => <option key={t}>{t}</option>)}
        </select>
      </td>
      <td style={{ padding: "8px 12px", width: 48, textAlign: "center" }}>
        <button
          onClick={() => onDelete(index)}
          title="Remove row"
          onMouseEnter={e => { e.currentTarget.style.background = "oklch(0.96 0.04 28)"; e.currentTarget.style.color = "oklch(0.52 0.16 28)" }}
          onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = T.faint }}
          style={{ width: 30, height: 30, borderRadius: 7, border: "none", background: "transparent", cursor: "pointer", display: "inline-flex", alignItems: "center", justifyContent: "center", color: T.faint, transition: "all 0.15s" }}
        >
          <Icon name="trash" size={14} />
        </button>
      </td>
    </tr>
  )
}

function DayToggleGroup({ value, onChange }) {
  const daySet = new Set(Array.isArray(value) ? value : [])
  function toggle(code) {
    const next = new Set(daySet)
    if (next.has(code)) next.delete(code)
    else next.add(code)
    onChange(Array.from(next))
  }

  return (
    <div style={{ display: "inline-flex", gap: 6, flexWrap: "wrap" }}>
      {WEEKDAY_CODES.map((code) => {
        const active = daySet.has(code)
        return (
          <button
            key={code}
            type="button"
            onClick={() => toggle(code)}
            style={{
              border: `1.5px solid ${active ? T.accent : T.borderSub}`,
              background: active ? T.accentBg : T.surface,
              color: active ? T.accent : T.faint,
              borderRadius: 999,
              padding: "4px 10px",
              fontSize: 11.5,
              fontWeight: 600,
              cursor: "pointer",
              fontFamily: "'DM Sans', sans-serif",
            }}>
            {DAY_LABELS[code]}
          </button>
        )
      })}
    </div>
  )
}

export default function DocumentReviewPage({ params }) {
  const { documentId } = use(params)
  const { user, loading: authLoading, handleLogout } = useDashboardAuth()
  const { courses } = useDashboardCourses(user?.id)
  const { doc, loading, error, reload } = useDashboardDocumentReview(user?.id, documentId)

  const [assignments, setAssignments] = useState([])
  const [courseSchedule, setCourseSchedule] = useState({
    lectureDays: [],
    courseStartDate: "",
    lectureStartTime: "",
    lectureEndTime: "",
    lectureLocation: "",
    scheduleExtras: [],
    termEndDate: "",
  })
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [saveError, setSaveError] = useState(null)
  const [syncing, setSyncing] = useState(false)
  const [syncMessage, setSyncMessage] = useState(null)
  const [search, setSearch] = useState("")
  const [avatarOpen, setAvatarOpen] = useState(false)
  const router = useRouter()

  const firstName = user?.user_metadata?.full_name?.split(" ")[0] || user?.email?.split("@")[0] || "there"
  const initial = firstName[0]?.toUpperCase() || "U"

  useEffect(() => {
    if (doc) {
      setAssignments(doc.extractedAssignments)
      const activeCourse = courses.find((c) => c.id === doc.courseId)
      setCourseSchedule({
        lectureDays: activeCourse?.lectureDays ?? [],
        courseStartDate: activeCourse?.courseStartDate ?? "",
        lectureStartTime: activeCourse?.lectureStartTime ?? "",
        lectureEndTime: activeCourse?.lectureEndTime ?? "",
        lectureLocation: activeCourse?.lectureLocation ?? "",
        scheduleExtras: Array.isArray(activeCourse?.scheduleExtras)
          ? activeCourse.scheduleExtras
          : (activeCourse?.sectionEnabled
            ? [{
                label: activeCourse.sectionLabel || "Section",
                days: activeCourse.sectionDays || [],
                start_time: activeCourse.sectionStartTime || "",
                end_time: activeCourse.sectionEndTime || "",
                location: activeCourse.sectionLocation || "",
              }]
            : []),
        termEndDate: activeCourse?.termEndDate ?? "",
      })
    }
  }, [doc, courses])

  const handleNavChange = useCallback((nextNav) => {
    if (nextNav === "dashboard") { router.push("/dashboard"); return }
    router.push(`/dashboard?tab=${nextNav}`)
  }, [router])

  const handleOpenCourse = useCallback((nextCourseId) => {
    router.push(`/dashboard/courses/${nextCourseId}`)
  }, [router])

  function handleChange(index, field, value) {
    setAssignments(prev => prev.map((a, i) => i === index ? { ...a, [field]: value } : a))
  }

  function handleDelete(index) {
    setAssignments(prev => prev.filter((_, i) => i !== index))
  }

  function handleAddRow() {
    setAssignments(prev => [...prev, { title: "", due_date: "", weight: "", type: "Homework" }])
  }

  function handleScheduleChange(field, value) {
    setCourseSchedule((prev) => ({ ...prev, [field]: value }))
  }

  function validateScheduleForCourse() {
    if (!doc?.courseId) return "Assign this document to a course first."
    if (!courseSchedule.lectureDays.length) return "Pick lecture days."
    if (!courseSchedule.lectureStartTime || !courseSchedule.lectureEndTime) return "Set lecture start and end times."
    if (!courseSchedule.courseStartDate) return "Set course start date."
    if (!courseSchedule.termEndDate) return "Set term end date."
    for (const extra of courseSchedule.scheduleExtras) {
      if (!String(extra.label ?? "").trim()) return "Each additional schedule item needs a label (for example: Discussion or Lab)."
      if (!Array.isArray(extra.days) || extra.days.length === 0) return "Pick days for each additional schedule item."
      if (!extra.start_time || !extra.end_time) return "Set start and end times for each additional schedule item."
    }
    return null
  }

  function handleExtraChange(index, field, value) {
    setCourseSchedule((prev) => ({
      ...prev,
      scheduleExtras: prev.scheduleExtras.map((item, i) => i === index ? { ...item, [field]: value } : item),
    }))
  }

  function handleExtraAdd() {
    setCourseSchedule((prev) => ({
      ...prev,
      scheduleExtras: [
        ...prev.scheduleExtras,
        { label: "Discussion", days: [], start_time: "", end_time: "", location: "" },
      ],
    }))
  }

  function handleExtraDelete(index) {
    setCourseSchedule((prev) => ({
      ...prev,
      scheduleExtras: prev.scheduleExtras.filter((_, i) => i !== index),
    }))
  }

  async function handleSave() {
    setSaving(true)
    setSaveError(null)
    const scheduleError = validateScheduleForCourse()
    if (scheduleError) {
      setSaving(false)
      setSaveError(scheduleError)
      return
    }

    const { error: dbError } = await supabase
      .from("documents")
      .update({
        extracted_assignments: assignments,
        status: "ready_to_review",
      })
      .eq("id", documentId)
      .eq("user_id", user.id)
    if (dbError) {
      setSaving(false)
      setSaveError(dbError.message)
      return
    }

    const { error: courseError } = await supabase
      .from("courses")
      .update({
        lecture_days: courseSchedule.lectureDays,
        course_start_date: courseSchedule.courseStartDate || null,
        lecture_start_time: courseSchedule.lectureStartTime,
        lecture_end_time: courseSchedule.lectureEndTime,
        lecture_location: courseSchedule.lectureLocation || null,
        schedule_extras: courseSchedule.scheduleExtras,
        section_enabled: false,
        section_label: null,
        section_days: [],
        section_start_time: null,
        section_end_time: null,
        section_location: null,
        term_end_date: courseSchedule.termEndDate || null,
      })
      .eq("id", doc.courseId)
      .eq("user_id", user.id)

    setSaving(false)
    if (courseError) { setSaveError(courseError.message); return }
    setSaved(true)
    await reload()
    setTimeout(() => setSaved(false), 2500)
  }

  async function handleSyncCalendar() {
    if (!user?.id) return
    setSyncing(true)
    setSyncMessage(null)

    const { data: sessionData, error: sessionError } = await supabase.auth.getSession()
    const token = sessionData?.session?.access_token
    const providerToken = sessionData?.session?.provider_token

    if (sessionError || !token || !providerToken) {
      setSyncing(false)
      setSyncMessage("Connect Google Calendar permissions and try again.")
      return
    }

    const courseCodeFromAssignment = courses.find(c => c.id === doc?.courseId)?.code?.trim() || ""
    let courseCode = courseCodeFromAssignment
    if (!courseCode) {
      const typed = window.prompt("Enter a course code for these calendar events (e.g., CS 61A):", "")
      courseCode = typed?.trim() || ""
      if (!courseCode) {
        setSyncing(false)
        setSyncMessage("Sync cancelled. Course code is required.")
        return
      }
    }

    try {
      const response = await fetch("/api/documents/sync-calendar", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ documentId, providerAccessToken: providerToken, courseCode }),
      })

      const json = await response.json()
      if (!response.ok) {
        setSyncMessage(json?.error || "Calendar sync failed.")
        setSyncing(false)
        return
      }

      const summary = json?.summary || {}
      const lectureSummary = json?.lectureSummary || {}
      const failed = Number(summary.failed || 0)
      const created = Number(summary.created || 0)
      const skipped = Number(summary.skipped || 0)
      const lectureCreated = Number(lectureSummary.created || 0)
      const lectureSkipped = Number(lectureSummary.skipped || 0)
      const lectureFailed = Number(lectureSummary.failed || 0)

      if (failed > 0 || lectureFailed > 0) {
        setSyncMessage(`Partial sync: assignments ${created}/${skipped}/${failed} and recurring events ${lectureCreated}/${lectureSkipped}/${lectureFailed} (created/skipped/failed).`)
      } else {
        setSyncMessage(`Calendar synced: assignments ${created} created, ${skipped} skipped; recurring events ${lectureCreated} created, ${lectureSkipped} skipped.`)
      }

      await reload()
    } catch {
      setSyncMessage("Calendar sync failed. Please try again.")
    } finally {
      setSyncing(false)
    }
  }

  if (authLoading || loading) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100vh", background: T.bg, fontFamily: "'DM Sans', sans-serif", color: T.muted, fontSize: 14 }}>
        Loading document…
      </div>
    )
  }

  if (error) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100vh", background: T.bg, fontFamily: "'DM Sans', sans-serif", color: "oklch(0.50 0.14 28)", fontSize: 14 }}>
        Could not load document: {error}
      </div>
    )
  }

  if (!doc) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100vh", background: T.bg, fontFamily: "'DM Sans', sans-serif", color: T.muted, fontSize: 14 }}>
        Document not found.
      </div>
    )
  }

  const docTypeLabel = doc.documentType
    ? doc.documentType.split("_").map(p => p.charAt(0).toUpperCase() + p.slice(1)).join(" ")
    : null

  return (
    <div
      onClick={() => setAvatarOpen(false)}
      style={{ display: "flex", flexDirection: "column", height: "100vh", background: T.bg, overflowY: "auto", fontFamily: "'DM Sans', sans-serif", color: T.text, WebkitFontSmoothing: "antialiased" }}>

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

      <div style={{ flex: 1, display: "flex" }}>
        <DashboardSidebar activeNav="docs" setActiveNav={handleNavChange} courses={courses} onOpenCourse={handleOpenCourse} />

        <main style={{ flex: 1, padding: "28px 32px", display: "flex", flexDirection: "column", gap: 20 }}>

          {/* Back */}
          <button
            onClick={() => router.push("/dashboard?tab=docs")}
            style={{ ...btnGhostStyle, alignSelf: "flex-start" }}
            onMouseEnter={e => e.currentTarget.style.borderColor = T.accent}
            onMouseLeave={e => e.currentTarget.style.borderColor = T.border}>
            <Icon name="arrowRight" size={13} color={T.faint} style={{ transform: "scaleX(-1)" }} /> Back to Documents
          </button>

          {/* Metadata card */}
          <div style={cardStyle({ padding: "18px 22px", display: "flex", alignItems: "center", gap: 16 })}>
            <div style={{ width: 42, height: 42, borderRadius: 11, background: T.accentBg, border: `1.5px solid oklch(0.82 0.08 285)`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <Icon name="fileText" size={18} color={T.accent} />
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 15, fontWeight: 600, color: T.text, fontFamily: "'Lora', serif", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {doc.fileName}
              </div>
              <div style={{ fontSize: 12, color: T.muted, marginTop: 3, display: "flex", gap: 10 }}>
                {docTypeLabel && <span>{docTypeLabel}</span>}
                <span>Updated {doc.updated}</span>
              </div>
            </div>
            <div style={{ fontSize: 12, fontWeight: 600, padding: "4px 12px", borderRadius: 99, background: T.accentBg, color: T.accent, flexShrink: 0 }}>
              {doc.status}
            </div>
          </div>

          {/* Assignments card */}
          <div style={cardStyle({ overflow: "hidden", padding: 0 })}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "14px 20px", borderBottom: `1.5px solid ${T.border}` }}>
              <Icon name="sparkles" size={14} color={T.accent} />
              <span style={{ fontSize: 13, fontWeight: 600, color: T.text }}>Extracted Assignments</span>
              <span style={{ fontSize: 11, fontWeight: 600, background: T.accentBg, color: T.accent, padding: "2px 9px", borderRadius: 99 }}>
                {assignments.length}
              </span>
              <div style={{ marginLeft: "auto" }}>
                <button
                  onClick={handleAddRow}
                  onMouseEnter={e => e.currentTarget.style.opacity = "0.85"}
                  onMouseLeave={e => e.currentTarget.style.opacity = "1"}
                  style={{ display: "inline-flex", alignItems: "center", gap: 5, padding: "6px 14px", border: "none", borderRadius: 99, background: T.accent, color: "#fff", fontFamily: "'DM Sans', sans-serif", fontWeight: 600, fontSize: 12, cursor: "pointer", transition: "opacity 0.15s" }}>
                  <Icon name="plus" size={13} color="#fff" /> Add Row
                </button>
              </div>
            </div>

            {assignments.length === 0 ? (
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "52px 24px", gap: 10 }}>
                <Icon name="fileText" size={28} color={T.border} />
                <span style={{ fontSize: 13, color: T.faint }}>No assignments found. Add one above.</span>
              </div>
            ) : (
              <div style={{ overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                  <thead>
                    <tr style={{ background: T.surface2 }}>
                      {["Assignment", "Due Date", "Weight", "Type", ""].map((h, i) => (
                        <th key={i} style={{ padding: "9px 12px", textAlign: "left", fontSize: 10.5, fontWeight: 700, color: T.faint, textTransform: "uppercase", letterSpacing: "0.07em", borderBottom: `1.5px solid ${T.border}`, whiteSpace: "nowrap" }}>
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {assignments.map((a, i) => (
                      <AssignmentRow key={i} assignment={a} index={i} onChange={handleChange} onDelete={handleDelete} />
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Course schedule card */}
          <div style={cardStyle({ overflow: "hidden", padding: 0 })}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "14px 20px", borderBottom: `1.5px solid ${T.border}` }}>
              <Icon name="calendar" size={14} color={T.accent} />
              <span style={{ fontSize: 13, fontWeight: 600, color: T.text }}>Course Schedule</span>
              <span style={{ marginLeft: "auto", fontSize: 12, color: T.faint }}>
                {doc?.courseId ? `Linked to ${courses.find((c) => c.id === doc.courseId)?.code || "course"}` : "Assign this document to a course first"}
              </span>
            </div>
            {!doc?.courseId ? (
              <div style={{ display: "flex", alignItems: "center", justifyContent: "center", padding: "28px 24px", color: T.faint, fontSize: 13 }}>
                Assign this document to a course in Documents before adding schedule details.
              </div>
            ) : (
              <div style={{ padding: "16px 20px", display: "grid", gap: 16 }}>
                <div style={{ display: "grid", gap: 10 }}>
                  <div style={{ fontSize: 12, fontWeight: 700, color: T.faint, textTransform: "uppercase", letterSpacing: "0.06em" }}>Lecture</div>
                  <DayToggleGroup value={courseSchedule.lectureDays} onChange={(value) => handleScheduleChange("lectureDays", value)} />
                  <div style={{ display: "grid", gridTemplateColumns: "160px 160px minmax(200px, 1fr)", gap: 10 }}>
                    <input type="time" value={courseSchedule.lectureStartTime} onChange={(e) => handleScheduleChange("lectureStartTime", e.target.value)} style={inputSt} />
                    <input type="time" value={courseSchedule.lectureEndTime} onChange={(e) => handleScheduleChange("lectureEndTime", e.target.value)} style={inputSt} />
                    <input type="text" value={courseSchedule.lectureLocation} onChange={(e) => handleScheduleChange("lectureLocation", e.target.value)} placeholder="Optional location" style={inputSt} />
                  </div>
                </div>

                <div style={{ display: "grid", gap: 10 }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <span style={{ fontSize: 12.5, color: T.text, fontWeight: 600 }}>Additional recurring items (Discussion/Lab/etc.)</span>
                    <button
                      type="button"
                      onClick={handleExtraAdd}
                      style={{ display: "inline-flex", alignItems: "center", gap: 5, padding: "5px 12px", border: "none", borderRadius: 99, background: T.accent, color: "#fff", fontSize: 12, fontWeight: 600, cursor: "pointer" }}>
                      <Icon name="plus" size={12} color="#fff" /> Add
                    </button>
                  </div>
                  {courseSchedule.scheduleExtras.length === 0 ? (
                    <div style={{ fontSize: 12, color: T.faint }}>No additional items yet.</div>
                  ) : courseSchedule.scheduleExtras.map((extra, index) => (
                    <div key={index} style={{ border: `1px solid ${T.borderSub}`, borderRadius: 10, padding: 10, display: "grid", gap: 10 }}>
                      <div style={{ display: "grid", gridTemplateColumns: "minmax(180px, 260px) auto", gap: 10, alignItems: "center" }}>
                        <input
                          type="text"
                          value={extra.label ?? ""}
                          onChange={(e) => handleExtraChange(index, "label", e.target.value)}
                          placeholder="Label (e.g. Discussion, Lab)"
                          style={inputSt}
                        />
                        <button
                          type="button"
                          onClick={() => handleExtraDelete(index)}
                          style={{ ...btnGhostStyle, color: "oklch(0.50 0.14 28)", borderColor: "oklch(0.88 0.05 28)" }}>
                          Remove
                        </button>
                      </div>
                      <DayToggleGroup value={extra.days} onChange={(value) => handleExtraChange(index, "days", value)} />
                      <div style={{ display: "grid", gridTemplateColumns: "160px 160px minmax(200px, 1fr)", gap: 10 }}>
                        <input type="time" value={extra.start_time ?? ""} onChange={(e) => handleExtraChange(index, "start_time", e.target.value)} style={inputSt} />
                        <input type="time" value={extra.end_time ?? ""} onChange={(e) => handleExtraChange(index, "end_time", e.target.value)} style={inputSt} />
                        <input type="text" value={extra.location ?? ""} onChange={(e) => handleExtraChange(index, "location", e.target.value)} placeholder="Optional location" style={inputSt} />
                      </div>
                    </div>
                  ))}
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "220px 220px", gap: 14, maxWidth: 460 }}>
                  <div style={{ display: "grid", gap: 6 }}>
                    <span style={{ fontSize: 11.5, color: T.faint }}>Course start date</span>
                    <input type="date" value={courseSchedule.courseStartDate} onChange={(e) => handleScheduleChange("courseStartDate", e.target.value)} style={inputSt} />
                  </div>
                  <div style={{ display: "grid", gap: 6 }}>
                  <span style={{ fontSize: 11.5, color: T.faint }}>Term end date</span>
                  <input type="date" value={courseSchedule.termEndDate} onChange={(e) => handleScheduleChange("termEndDate", e.target.value)} style={inputSt} />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Save footer */}
          <div style={{ position: "sticky", bottom: 0, background: T.surface, border: `1.5px solid ${T.border}`, borderRadius: 14, padding: "14px 20px", display: "flex", alignItems: "center", justifyContent: "space-between", boxShadow: `0 -2px 12px ${T.shadow}` }}>
            <div style={{ fontSize: 12.5, color: saveError || (syncMessage && syncMessage.toLowerCase().includes("failed")) || (syncMessage && syncMessage.toLowerCase().includes("partial")) ? "oklch(0.50 0.14 28)" : saved || syncMessage ? "oklch(0.42 0.14 155)" : T.muted, display: "flex", alignItems: "center", gap: 6 }}>
              {saved && <Icon name="check" size={14} color="oklch(0.42 0.14 155)" />}
              {syncMessage
                ? syncMessage
                : saved
                ? "Changes saved."
                : saveError
                  ? saveError
                  : `${assignments.length} assignment${assignments.length !== 1 ? "s" : ""} — review and save when ready`}
            </div>
            <div style={{ display: "inline-flex", gap: 8, alignItems: "center" }}>
              <button
                onClick={() => { void handleSyncCalendar() }}
                disabled={syncing || saving}
                onMouseEnter={e => { if (!syncing && !saving) e.currentTarget.style.opacity = "0.85" }}
                onMouseLeave={e => e.currentTarget.style.opacity = "1"}
                style={{ display: "inline-flex", alignItems: "center", gap: 7, padding: "9px 18px", border: `1.5px solid ${T.border}`, borderRadius: 99, background: syncing || saving ? T.surface2 : T.surface, color: syncing || saving ? T.faint : T.text, fontFamily: "'DM Sans', sans-serif", fontWeight: 600, fontSize: 13, cursor: syncing || saving ? "wait" : "pointer", transition: "all 0.15s" }}>
                {syncing
                  ? <><Icon name="loader" size={14} color={T.faint} style={{ animation: "spin 1.2s linear infinite" }} /> Syncing…</>
                  : <><Icon name="calendar" size={14} color={syncing || saving ? T.faint : T.accent} /> Sync to Calendar</>}
              </button>
              <button
                onClick={() => { void handleSave() }}
                disabled={saving || syncing}
                onMouseEnter={e => { if (!saving && !syncing) e.currentTarget.style.opacity = "0.85" }}
                onMouseLeave={e => e.currentTarget.style.opacity = "1"}
                style={{ display: "inline-flex", alignItems: "center", gap: 7, padding: "9px 22px", border: "none", borderRadius: 99, background: saving || syncing ? T.border : T.accent, color: saving || syncing ? T.faint : "#fff", fontFamily: "'DM Sans', sans-serif", fontWeight: 600, fontSize: 13.5, cursor: saving || syncing ? "wait" : "pointer", boxShadow: saving || syncing ? "none" : `0 2px 8px oklch(0.50 0.18 285 / 0.28)`, transition: "all 0.15s" }}>
                {saving
                  ? <><Icon name="loader" size={14} color={T.faint} style={{ animation: "spin 1.2s linear infinite" }} /> Saving…</>
                  : <><Icon name="check" size={14} color="#fff" /> Save review</>}
              </button>
            </div>
          </div>

        </main>
      </div>
    </div>
  )
}

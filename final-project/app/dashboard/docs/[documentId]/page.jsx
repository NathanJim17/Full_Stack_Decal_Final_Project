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

export default function DocumentReviewPage({ params }) {
  const { documentId } = use(params)
  const { user, loading: authLoading, handleLogout } = useDashboardAuth()
  const { courses } = useDashboardCourses(user?.id)
  const { doc, loading, error, reload } = useDashboardDocumentReview(user?.id, documentId)

  const [assignments, setAssignments] = useState([])
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [saveError, setSaveError] = useState(null)
  const [search, setSearch] = useState("")
  const [avatarOpen, setAvatarOpen] = useState(false)
  const router = useRouter()

  const firstName = user?.user_metadata?.full_name?.split(" ")[0] || user?.email?.split("@")[0] || "there"
  const initial = firstName[0]?.toUpperCase() || "U"

  useEffect(() => {
    if (doc) setAssignments(doc.extractedAssignments)
  }, [doc])

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

  async function handleSave() {
    setSaving(true)
    setSaveError(null)
    const { error: dbError } = await supabase
      .from("documents")
      .update({ extracted_assignments: assignments, status: "ready_to_review" })
      .eq("id", documentId)
      .eq("user_id", user.id)
    setSaving(false)
    if (dbError) { setSaveError(dbError.message); return }
    setSaved(true)
    await reload()
    setTimeout(() => setSaved(false), 2500)
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
        <DashboardSidebar activeNav="docs" setActiveNav={handleNavChange} courses={courses} onOpenCourse={handleOpenCourse} />

        <main style={{ flex: 1, overflowY: "auto", padding: "28px 32px", display: "flex", flexDirection: "column", gap: 20 }}>

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

          {/* Save footer */}
          <div style={{ position: "sticky", bottom: 0, background: T.surface, border: `1.5px solid ${T.border}`, borderRadius: 14, padding: "14px 20px", display: "flex", alignItems: "center", justifyContent: "space-between", boxShadow: `0 -2px 12px ${T.shadow}` }}>
            <div style={{ fontSize: 12.5, color: saveError ? "oklch(0.50 0.14 28)" : saved ? "oklch(0.42 0.14 155)" : T.muted, display: "flex", alignItems: "center", gap: 6 }}>
              {saved && <Icon name="check" size={14} color="oklch(0.42 0.14 155)" />}
              {saved
                ? "Changes saved."
                : saveError
                  ? saveError
                  : `${assignments.length} assignment${assignments.length !== 1 ? "s" : ""} — review and save when ready`}
            </div>
            <button
              onClick={() => { void handleSave() }}
              disabled={saving}
              onMouseEnter={e => { if (!saving) e.currentTarget.style.opacity = "0.85" }}
              onMouseLeave={e => e.currentTarget.style.opacity = "1"}
              style={{ display: "inline-flex", alignItems: "center", gap: 7, padding: "9px 22px", border: "none", borderRadius: 99, background: saving ? T.border : T.accent, color: saving ? T.faint : "#fff", fontFamily: "'DM Sans', sans-serif", fontWeight: 600, fontSize: 13.5, cursor: saving ? "wait" : "pointer", boxShadow: saving ? "none" : `0 2px 8px oklch(0.50 0.18 285 / 0.28)`, transition: "all 0.15s" }}>
              {saving
                ? <><Icon name="loader" size={14} color={T.faint} style={{ animation: "spin 1.2s linear infinite" }} /> Saving…</>
                : <><Icon name="check" size={14} color="#fff" /> Save review</>}
            </button>
          </div>

        </main>
      </div>
    </div>
  )
}

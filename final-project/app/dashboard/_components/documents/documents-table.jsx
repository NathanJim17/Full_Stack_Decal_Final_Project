"use client"

import { useState } from "react"
import { Icon } from "../dashboard-icons"
import { T, cardStyle } from "../../_lib/dashboard-data"
import { StatusBadge } from "./documents-status-badge"

const thStyle = {
  padding: "10px 16px", textAlign: "left",
  fontSize: 10.5, fontWeight: 700, color: T.faint,
  textTransform: "uppercase", letterSpacing: "0.07em",
  background: T.surface2, borderBottom: `1.5px solid ${T.border}`,
  whiteSpace: "nowrap",
}

export function SkeletonRow({ i }) {
  return (
    <tr style={{ animation: `fadeUp 0.3s ease ${i * 0.07}s both` }}>
      {[["38%", 13], ["15%", 11], ["18%", 11], ["15%", 11], ["10%", 11]].map(([w, h], j) => (
        <td key={j} style={{ padding: "14px 16px", borderBottom: `1px solid ${T.borderSub}` }}>
          <div className="skeleton" style={{ width: w, height: h }} />
        </td>
      ))}
      <td style={{ padding: "14px 16px", borderBottom: `1px solid ${T.borderSub}` }}>
        <div style={{ display: "flex", gap: 6 }}>
          <div className="skeleton" style={{ width: 28, height: 28, borderRadius: 7 }} />
          <div className="skeleton" style={{ width: 28, height: 28, borderRadius: 7 }} />
        </div>
      </td>
    </tr>
  )
}

export function DocRow({ doc, index, courses, onDelete, onAssignCourse, onRetryParse }) {
  const [hovered, setHovered] = useState(false)
  const [courseVal, setCourseVal] = useState(doc.courseId || "")
  const [deleted, setDeleted] = useState(false)
  const [savingCourse, setSavingCourse] = useState(false)
  const [retrying, setRetrying] = useState(false)

  async function handleCourseChange(nextCourseId) {
    const prev = courseVal
    setCourseVal(nextCourseId)
    setSavingCourse(true)
    const ok = await onAssignCourse?.(doc.id, nextCourseId || null)
    setSavingCourse(false)
    if (!ok) {
      setCourseVal(prev)
    }
  }

  const canReview    = doc.status === "Ready to review"
  const hasError     = doc.status === "Error"
  const isProcessing = doc.status === "Processing"

  const handleDelete = () => {
    setDeleted(true)
    setTimeout(() => onDelete(doc.id), 280)
  }

  async function handleRetry() {
    setRetrying(true)
    await onRetryParse?.(doc.id)
    setRetrying(false)
  }

  return (
    <tr
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: hovered ? "oklch(0.975 0.008 78)" : "transparent",
        transition: "background 0.15s",
        opacity: deleted ? 0 : 1,
        transform: deleted ? "translateX(8px)" : "none",
        animation: `fadeUp 0.3s ease ${index * 0.05}s both`,
      }}>

      {/* File name */}
      <td style={{ padding: "13px 16px", borderBottom: `1px solid ${T.borderSub}` }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{
            width: 34, height: 34, borderRadius: 9, flexShrink: 0,
            background: hasError ? "oklch(0.95 0.05 28)" : canReview ? T.accentBg : T.surface2,
            border: `1.5px solid ${hasError ? "oklch(0.84 0.08 28)" : canReview ? "oklch(0.82 0.08 285)" : T.border}`,
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <Icon name="fileText" size={15} color={hasError ? "oklch(0.52 0.16 28)" : canReview ? T.accent : T.faint} />
          </div>
          <div>
            <div style={{ fontSize: 13, fontWeight: 500, color: T.text }}>{doc.name}</div>
            <div style={{ fontSize: 11, color: T.faint, marginTop: 1 }}>
              {doc.size}
              {doc.assignments && (
                <span style={{ marginLeft: 8, color: T.accent, fontWeight: 500 }}>· {doc.assignments} assignments found</span>
              )}
              {hasError && (
                <span style={{ marginLeft: 8, color: "oklch(0.52 0.16 28)", fontWeight: 500 }}>· Parse failed</span>
              )}
              {isProcessing && (
                <span style={{ marginLeft: 8, color: "oklch(0.48 0.12 75)", fontWeight: 500, display: "inline-flex", alignItems: "center", gap: 4 }}>
                  · Extracting <Icon name="loader" size={10} color="oklch(0.48 0.12 75)" style={{ animation: "spin 1.2s linear infinite" }} />
                </span>
              )}
            </div>
          </div>
        </div>
      </td>

      {/* Course picker */}
      <td style={{ padding: "13px 16px", borderBottom: `1px solid ${T.borderSub}` }}>
        <select
          value={courseVal}
          onChange={e => { void handleCourseChange(e.target.value) }}
          disabled={savingCourse}
          style={{
            fontSize: 12, color: courseVal ? T.text : T.faint,
            background: courseVal ? T.accentBg : T.surface2,
            border: `1.5px solid ${courseVal ? "oklch(0.82 0.08 285)" : T.borderSub}`,
            borderRadius: 99, padding: "4px 10px", fontFamily: "'DM Sans', sans-serif",
            fontWeight: courseVal ? 600 : 400, cursor: savingCourse ? "wait" : "pointer",
            appearance: "none", minWidth: 100,
            opacity: savingCourse ? 0.75 : 1,
          }}>
          <option value="">{savingCourse ? "Saving..." : "⊕ Assign"}</option>
          {courses.map(c => <option key={c.id ?? c.code} value={c.id}>{c.code}</option>)}
        </select>
      </td>

      {/* Status */}
      <td style={{ padding: "13px 16px", borderBottom: `1px solid ${T.borderSub}` }}>
        <StatusBadge status={doc.status} />
      </td>

      {/* Updated */}
      <td style={{ padding: "13px 16px", borderBottom: `1px solid ${T.borderSub}`, fontSize: 12, color: T.muted }}>
        {doc.updated}
      </td>

      {/* Actions */}
      <td style={{ padding: "13px 16px", borderBottom: `1px solid ${T.borderSub}` }}>
        <div style={{ display: "flex", gap: 4, alignItems: "center" }}>
          {canReview && (
            <button
              title="Review & Sync"
              onMouseEnter={e => e.currentTarget.style.opacity = "0.85"}
              onMouseLeave={e => e.currentTarget.style.opacity = "1"}
              style={{
                display: "inline-flex", alignItems: "center", gap: 5,
                padding: "5px 12px", borderRadius: 99, border: "none",
                background: T.accent, color: "#fff",
                fontFamily: "'DM Sans', sans-serif", fontWeight: 600, fontSize: 11.5,
                cursor: "pointer", transition: "all 0.15s",
              }}>
              <Icon name="sparkles" size={12} color="#fff" /> Review
            </button>
          )}

          {!canReview && !hasError && (
            <button
              title="Open document"
              onMouseEnter={e => { e.currentTarget.style.borderColor = T.accent; e.currentTarget.style.background = T.accentBg; e.currentTarget.style.color = T.accent }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = T.borderSub; e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = T.faint }}
              style={{
                width: 32, height: 32, borderRadius: 8, border: `1.5px solid ${T.borderSub}`,
                background: "transparent", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
                transition: "all 0.15s", color: T.faint,
              }}>
              <Icon name="eye" size={14} />
            </button>
          )}

          {hasError && (
            <button
              title="Retry extraction"
              onClick={() => { void handleRetry() }}
              style={{
                width: 32, height: 32, borderRadius: 8, border: `1.5px solid oklch(0.82 0.08 28)`,
                background: "oklch(0.97 0.03 28)", cursor: retrying ? "wait" : "pointer", display: "flex", alignItems: "center", justifyContent: "center",
                transition: "all 0.15s", color: "oklch(0.52 0.16 28)", opacity: retrying ? 0.7 : 1,
              }}>
              <Icon name={retrying ? "loader" : "refresh"} size={14} style={retrying ? { animation: "spin 1.2s linear infinite" } : {}} />
            </button>
          )}

          <button
            onClick={handleDelete}
            title="Delete"
            onMouseEnter={e => { e.currentTarget.style.borderColor = "oklch(0.82 0.10 28)"; e.currentTarget.style.background = "oklch(0.96 0.04 28)"; e.currentTarget.style.color = "oklch(0.52 0.16 28)" }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = T.borderSub; e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = T.faint }}
            style={{
              width: 32, height: 32, borderRadius: 8, border: `1.5px solid ${T.borderSub}`,
              background: "transparent", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
              transition: "all 0.15s", color: T.faint,
            }}>
            <Icon name="trash" size={14} />
          </button>
        </div>
      </td>
    </tr>
  )
}

export function LibraryTable({ state, docs, courses, onDelete, onAssignCourse, onRetryParse }) {
  if (state === "error") {
    return (
      <div style={cardStyle({ padding: "40px 24px", textAlign: "center" })}>
        <div style={{
          width: 52, height: 52, borderRadius: 13, background: "oklch(0.95 0.05 28)",
          display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 14px",
        }}>
          <Icon name="alertCircle" size={24} color="oklch(0.52 0.16 28)" />
        </div>
        <div style={{ fontSize: 14, fontWeight: 600, color: T.text, marginBottom: 5 }}>Failed to load documents</div>
        <div style={{ fontSize: 12.5, color: T.muted, marginBottom: 16 }}>Check your connection and try again.</div>
        <button style={{
          display: "inline-flex", alignItems: "center", gap: 6,
          padding: "8px 18px", borderRadius: 99, border: `1.5px solid ${T.border}`,
          background: T.surface2, color: T.muted,
          fontFamily: "'DM Sans', sans-serif", fontWeight: 600, fontSize: 13, cursor: "pointer",
        }}>
          <Icon name="refresh" size={13} color={T.faint} /> Retry
        </button>
      </div>
    )
  }

  if (state === "empty") {
    return (
      <div style={{
        background: T.surface, border: `2px dashed ${T.border}`,
        borderRadius: 14, padding: "52px 24px", textAlign: "center",
      }}>
        <div style={{
          width: 60, height: 60, borderRadius: 16, background: T.accentBg,
          display: "flex", alignItems: "center", justifyContent: "center",
          margin: "0 auto 16px",
          boxShadow: `0 0 0 8px oklch(0.95 0.04 285 / 0.4)`,
        }}>
          <Icon name="fileText" size={26} color={T.accent} />
        </div>
        <div style={{ fontSize: 16, fontWeight: 600, color: T.text, fontFamily: "'Lora', serif", marginBottom: 6 }}>
          No documents yet
        </div>
        <div style={{ fontSize: 13, color: T.muted, maxWidth: 320, margin: "0 auto 20px" }}>
          Upload a syllabus above to get started. We'll extract all your deadlines automatically.
        </div>
        <button style={{
          display: "inline-flex", alignItems: "center", gap: 7,
          padding: "9px 20px", borderRadius: 99, border: "none",
          background: T.accent, color: "#fff",
          fontFamily: "'DM Sans', sans-serif", fontWeight: 600, fontSize: 13, cursor: "pointer",
          boxShadow: `0 2px 8px oklch(0.50 0.18 285 / 0.28)`,
        }}>
          <Icon name="upload" size={14} color="#fff" /> Upload your first syllabus
        </button>
      </div>
    )
  }

  return (
    <div style={cardStyle({ overflow: "hidden", padding: 0 })}>
      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr>
            <th style={thStyle}>File</th>
            <th style={thStyle}>Course</th>
            <th style={thStyle}>Status</th>
            <th style={thStyle}>Updated</th>
            <th style={{ ...thStyle, width: 160 }}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {state === "loading"
            ? [0, 1, 2, 3].map(i => <SkeletonRow key={i} i={i} />)
            : docs.map((doc, i) => (
                <DocRow
                  key={doc.id}
                  doc={doc}
                  index={i}
                  courses={courses}
                  onDelete={onDelete}
                  onAssignCourse={onAssignCourse}
                  onRetryParse={onRetryParse}
                />
              ))
          }
        </tbody>
      </table>

      {state === "populated" && docs.length > 0 && (
        <div style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          padding: "10px 16px",
          borderTop: `1px solid ${T.borderSub}`,
          background: T.surface2,
        }}>
          <span style={{ fontSize: 11.5, color: T.faint }}>
            {docs.length} document{docs.length !== 1 ? "s" : ""}
          </span>
          <span style={{ fontSize: 11.5, color: T.faint, display: "inline-flex", alignItems: "center", gap: 6 }}>
            <span style={{
              width: 6, height: 6, borderRadius: "50%",
              background: "oklch(0.52 0.14 155)", display: "inline-block",
              animation: "pulse 2.5s ease-in-out infinite",
            }} />
            Syncing to Google Calendar
          </span>
        </div>
      )}
    </div>
  )
}

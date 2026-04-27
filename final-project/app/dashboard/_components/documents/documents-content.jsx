"use client"

import { useState } from "react"
import { Icon } from "../dashboard-icons"
import { T } from "../../_lib/dashboard-data"
import { DOCS, FILTER_OPTIONS } from "./documents-data"
import { UploadZone } from "./documents-upload-zone"
import { LibraryTable } from "./documents-table"

export function DashboardDocumentsContent({ courses = [] }) {
  const [docs, setDocs] = useState(DOCS)
  const [uploadState, setUploadState] = useState("idle")
  const [activeFilter, setActiveFilter] = useState("All")

  const handleDelete = id => setDocs(d => d.filter(r => r.id !== id))

  const filteredDocs = activeFilter === "All"
    ? docs
    : docs.filter(d => d.status === activeFilter)

  const libraryState = docs.length === 0 ? "empty" : "populated"

  return (
    <main style={{ flex: 1, overflowY: "auto", padding: "32px 36px" }}>

      {/* Page header */}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 28 }}>
        <div>
          <h1 style={{
            fontSize: 24, fontWeight: 600, color: T.text,
            fontFamily: "'Lora', serif", letterSpacing: "-0.02em", marginBottom: 5,
          }}>
            Documents
          </h1>
          <p style={{ fontSize: 13.5, color: T.muted, maxWidth: 480 }}>
            Upload syllabi and we'll extract deadlines automatically — then review before syncing to your calendar.
          </p>
        </div>
        <button
          onClick={() => setUploadState("uploading")}
          onMouseEnter={e => e.currentTarget.style.opacity = "0.88"}
          onMouseLeave={e => e.currentTarget.style.opacity = "1"}
          style={{
            display: "inline-flex", alignItems: "center", gap: 7,
            padding: "10px 20px", borderRadius: 99, border: "none",
            background: T.accent, color: "#fff",
            fontFamily: "'DM Sans', sans-serif", fontWeight: 600, fontSize: 13.5,
            cursor: "pointer", flexShrink: 0,
            boxShadow: `0 2px 10px oklch(0.50 0.18 285 / 0.30)`,
            transition: "all 0.15s",
          }}>
          <Icon name="upload" size={15} color="#fff" />
          Upload syllabus
        </button>
      </div>

      {/* Upload zone */}
      <UploadZone state={uploadState} onStateChange={setUploadState} />

      {/* Library section header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <h2 style={{ fontSize: 15, fontWeight: 600, color: T.text, fontFamily: "'Lora', serif" }}>
            Document Library
          </h2>
          {libraryState === "populated" && (
            <span style={{
              fontSize: 11, background: T.accentBg, color: T.accent,
              padding: "2px 9px", borderRadius: 99, fontWeight: 600,
            }}>
              {filteredDocs.length}
            </span>
          )}
        </div>

        {/* Filter chips */}
        <div style={{ display: "flex", gap: 7, flexWrap: "wrap" }}>
          {FILTER_OPTIONS.map(f => {
            const isActive = activeFilter === f
            return (
              <button
                key={f}
                onClick={() => setActiveFilter(f)}
                style={{
                  fontSize: 11.5, padding: "4px 11px", borderRadius: 99, cursor: "pointer",
                  border: `1.5px solid ${isActive ? T.accent : T.borderSub}`,
                  background: isActive ? T.accentBg : T.surface,
                  color: isActive ? T.accent : T.muted,
                  fontFamily: "'DM Sans', sans-serif", fontWeight: isActive ? 600 : 500,
                  transition: "all 0.15s",
                }}>
                {f}
              </button>
            )
          })}
        </div>
      </div>

      {/* Table */}
      <LibraryTable
        state={filteredDocs.length === 0 && activeFilter !== "All" ? "empty" : libraryState}
        docs={filteredDocs}
        courses={courses}
        onDelete={handleDelete}
      />
    </main>
  )
}

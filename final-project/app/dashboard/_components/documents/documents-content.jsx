"use client"

import { useState } from "react"
import { T } from "../../_lib/dashboard-data"
import { FILTER_OPTIONS } from "./documents-data"
import { supabase } from "@/lib/supabase"
import { useDashboardDocuments } from "../../_hooks/use-dashboard-documents"
import { UploadZone } from "./documents-upload-zone"
import { LibraryTable } from "./documents-table"

const MAX_FILE_BYTES = 50 * 1024 * 1024
const CALENDAR_RELEVANT_TYPES = new Set(["syllabus"])

function formatFileSize(bytes) {
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

export function DashboardDocumentsContent({ courses = [], userId }) {
  const { docs, loading, error, reload } = useDashboardDocuments(userId)
  const [uploadState, setUploadState] = useState("idle")
  const [activeFilter, setActiveFilter] = useState("All")
  const [uploadMeta, setUploadMeta] = useState({ name: "", sizeLabel: "" })
  const [uploadError, setUploadError] = useState("")
  const [documentType, setDocumentType] = useState("syllabus")

  async function triggerParse(documentId) {
    const { data: sessionData } = await supabase.auth.getSession()
    const token = sessionData?.session?.access_token
    if (!token) return false

    const response = await fetch("/api/documents/parse", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ documentId }),
    })
    return response.ok
  }

  async function handleUpload(file) {
    if (!file) return
    if (!userId) {
      setUploadError("You must be logged in to upload.")
      setUploadState("error")
      return
    }
    if (file.type !== "application/pdf") {
      setUploadError(`${file.name} · Only PDF files are allowed`)
      setUploadState("error")
      return
    }
    if (file.size > MAX_FILE_BYTES) {
      setUploadError(`${file.name} · File exceeds 50 MB limit`)
      setUploadState("error")
      return
    }

    setUploadMeta({ name: file.name, sizeLabel: formatFileSize(file.size) })
    setUploadError("")
    setUploadState("uploading")

    const docId = crypto.randomUUID()
    const lowerName = file.name.toLowerCase()
    const ext = lowerName.endsWith(".pdf") ? "pdf" : lowerName.split(".").pop() || "pdf"
    const storagePath = `${userId}/${docId}.${ext}`

    const { error: uploadDbError } = await supabase.storage
      .from("documents")
      .upload(storagePath, file, { upsert: false, contentType: "application/pdf" })

    if (uploadDbError) {
      setUploadError(`${file.name} · ${uploadDbError.message}`)
      setUploadState("error")
      return
    }

    const { error: insertError } = await supabase.from("documents").insert({
      id: docId,
      user_id: userId,
      file_name: file.name,
      storage_path: storagePath,
      mime_type: "application/pdf",
      file_size_bytes: file.size,
      status: "processing",
      document_type: documentType,
      calendar_relevant: CALENDAR_RELEVANT_TYPES.has(documentType),
    })

    if (insertError) {
      await supabase.storage.from("documents").remove([storagePath])
      setUploadError(`${file.name} · ${insertError.message}`)
      setUploadState("error")
      return
    }

    setUploadState("idle")
    setUploadMeta({ name: "", sizeLabel: "" })
    await reload()
    void triggerParse(docId).finally(() => {
      void reload()
    })
  }

  async function handleDelete(id) {
    const doc = docs.find((row) => row.id === id)
    if (!doc) return

    const { error: deleteError } = await supabase
      .from("documents")
      .delete()
      .eq("id", id)
      .eq("user_id", userId)

    if (deleteError) {
      await reload()
      return
    }
    if (doc.storagePath) {
      await supabase.storage.from("documents").remove([doc.storagePath])
    }
    await reload()
  }

  async function handleAssignCourse(docId, courseId) {
    const { error: updateError } = await supabase
      .from("documents")
      .update({ course_id: courseId })
      .eq("id", docId)
      .eq("user_id", userId)

    if (updateError) {
      return false
    }
    await reload()
    return true
  }

  async function handleRetryParse(documentId) {
    const ok = await triggerParse(documentId)
    await reload()
    return ok
  }

  const filteredDocs = activeFilter === "All"
    ? docs
    : docs.filter(d => d.status === activeFilter)

  const libraryState = error
    ? "error"
    : loading
      ? "loading"
      : docs.length === 0
        ? "empty"
        : "populated"

  return (
    <main style={{ flex: 1, overflowY: "auto", padding: "32px 36px" }}>

      {/* Page header */}
      <div style={{ marginBottom: 10 }}>
        <div>
          <h1 style={{
            fontSize: 24, fontWeight: 600, color: T.text,
            fontFamily: "'Lora', serif", letterSpacing: "-0.02em", marginBottom: 5,
          }}>
            Documents
          </h1>
          <p style={{ fontSize: 13.5, color: T.muted, maxWidth: 760 }}>
            Upload syllabi, course materials, etc. and we will extract deadlines automatically — then review before syncing to your calendar.
          </p>
        </div>
      </div>

      {/* Upload zone */}
      <UploadZone
        state={uploadState}
        onStateChange={setUploadState}
        onFileSelected={handleUpload}
        documentType={documentType}
        onDocumentTypeChange={setDocumentType}
        uploadFileName={uploadMeta.name}
        uploadFileSize={uploadMeta.sizeLabel}
        errorMessage={uploadError}
      />

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
        state={libraryState === "loading" || libraryState === "error"
          ? libraryState
          : filteredDocs.length === 0 && activeFilter !== "All"
            ? "empty"
            : libraryState}
        docs={filteredDocs}
        courses={courses}
        onDelete={(id) => { void handleDelete(id) }}
        onAssignCourse={(docId, courseId) => handleAssignCourse(docId, courseId)}
        onRetryParse={(documentId) => handleRetryParse(documentId)}
      />
    </main>
  )
}

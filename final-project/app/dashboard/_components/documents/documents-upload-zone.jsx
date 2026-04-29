"use client"

import { useRef, useState, useEffect } from "react"
import { Icon } from "../dashboard-icons"
import { T } from "../../_lib/dashboard-data"

export function UploadZone({
  state,
  onStateChange,
  onFileSelected,
  documentType,
  onDocumentTypeChange,
  uploadFileName,
  uploadFileSize,
  errorMessage,
}) {
  const [dragging, setDragging] = useState(false)
  const [progress, setProgress] = useState(0)
  const inputRef = useRef(null)

  useEffect(() => {
    if (state !== "uploading") return
    const t = setInterval(() => {
      setProgress(p => {
        if (p >= 88) { clearInterval(t); return 88 }
        return p + 3
      })
    }, 120)
    return () => clearInterval(t)
  }, [state])

  const borderColor = state === "error"    ? "oklch(0.62 0.16 28)"
                    : dragging || state === "uploading" ? T.accent
                    : T.faint

  const bgColor = state === "error"       ? "oklch(0.98 0.02 28)"
                : state === "uploading"   ? T.accentBg
                : dragging                ? "oklch(0.97 0.03 285)"
                : T.surface

  const errorLabel = errorMessage || "Upload failed. Please try again."

  function pickFirstFile(fileList) {
    if (!fileList || fileList.length === 0) return
    setProgress(0)
    onFileSelected?.(fileList[0])
  }

  return (
    <div style={{ marginBottom: 28 }}>
      {state === "idle" && (
        <div style={{ width: "100%", maxWidth: 360, marginBottom: 10 }}>
          <label
            htmlFor="documents-type-select"
            style={{ display: "block", fontSize: 12, color: T.muted, marginBottom: 6 }}>
            Document type
          </label>
          <select
            id="documents-type-select"
            value={documentType}
            onChange={(e) => onDocumentTypeChange?.(e.target.value)}
            style={{
              width: "100%",
              fontSize: 12.5,
              color: T.text,
              background: T.surface,
              border: `1.5px solid ${T.borderSub}`,
              borderRadius: 10,
              padding: "8px 10px",
              fontFamily: "'DM Sans', sans-serif",
              cursor: "pointer",
            }}>
            <option value="syllabus">Syllabus (calendar-relevant)</option>
            <option value="course_material">Course material</option>
            <option value="textbook">Textbook</option>
            <option value="other">Other</option>
          </select>
        </div>
      )}

      <div
        onDragOver={e => { e.preventDefault(); setDragging(true) }}
        onDragLeave={() => setDragging(false)}
        onDrop={e => {
          e.preventDefault()
          setDragging(false)
          pickFirstFile(e.dataTransfer.files)
        }}
        onClick={() => state === "idle" && inputRef.current?.click()}
        style={{
          border: `2px dashed ${borderColor}`,
          borderRadius: 14,
          background: bgColor,
          padding: "36px 28px",
          display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
          gap: 10, transition: "all 0.2s ease", cursor: "pointer",
          position: "relative", overflow: "hidden",
        }}>
        <input
          ref={inputRef}
          id="documents-file-input"
          type="file"
          accept="application/pdf"
          style={{ display: "none" }}
          onChange={(e) => {
            pickFirstFile(e.target.files)
            e.target.value = ""
          }}
        />

        {state === "idle" && (
          <>
            <div style={{
              width: 52, height: 52, borderRadius: 13, background: T.accentBg,
              display: "flex", alignItems: "center", justifyContent: "center",
              boxShadow: `0 0 0 6px oklch(0.95 0.04 285 / 0.5)`,
            }}>
              <Icon name="upload" size={22} color={T.accent} />
            </div>
            <div style={{ textAlign: "center" }}>
              <div style={{ fontSize: 14.5, fontWeight: 600, color: T.text, marginBottom: 4 }}>
                Drop your document PDF here
              </div>
              <div style={{ fontSize: 13, color: T.muted }}>
                or{" "}
                <span style={{ color: T.accent, fontWeight: 600, cursor: "pointer", textDecoration: "underline", textUnderlineOffset: 2 }}>
                  click to browse
                </span>
              </div>
            </div>
            <div style={{
              marginTop: 4, display: "inline-flex", alignItems: "center", gap: 5,
              fontSize: 11.5, color: T.faint,
              background: T.surface2, border: `1.5px solid ${T.borderSub}`,
              padding: "4px 12px", borderRadius: 99,
            }}>
              <Icon name="fileText" size={12} color={T.faint} />
              PDF only · max 50 MB per file
            </div>
          </>
        )}

        {state === "uploading" && (
          <div style={{ width: "100%", maxWidth: 440, textAlign: "center" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 14 }}>
              <div style={{
                width: 40, height: 40, borderRadius: 10, background: T.accentBg,
                display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
              }}>
                <Icon name="fileText" size={18} color={T.accent} />
              </div>
              <div style={{ flex: 1, textAlign: "left" }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: T.text, marginBottom: 2 }}>
                  {uploadFileName || "Uploading document.pdf"}
                </div>
                <div style={{ fontSize: 11.5, color: T.muted }}>{uploadFileSize || "—"} · Uploading…</div>
              </div>
              <button
                onClick={e => { e.stopPropagation(); onStateChange("idle") }}
                style={{ background: "none", border: "none", cursor: "pointer", color: T.faint, padding: 4 }}>
                <Icon name="x" size={16} />
              </button>
            </div>
            <div style={{ height: 4, background: T.border, borderRadius: 99, overflow: "hidden" }}>
              <div style={{
                height: "100%", background: T.accent, borderRadius: 99,
                width: `${progress}%`, transition: "width 0.12s linear",
              }} />
            </div>
            <div style={{ fontSize: 11, color: T.muted, marginTop: 6 }}>{progress}% uploaded</div>
          </div>
        )}

        {state === "error" && (
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8, textAlign: "center" }}>
            <div style={{
              width: 48, height: 48, borderRadius: 12, background: "oklch(0.95 0.06 28)",
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              <Icon name="alertTri" size={22} color="oklch(0.52 0.18 28)" />
            </div>
            <div>
              <div style={{ fontSize: 14, fontWeight: 600, color: "oklch(0.30 0.08 28)", marginBottom: 4 }}>
                Upload failed
              </div>
              <div style={{ fontSize: 12.5, color: "oklch(0.48 0.10 28)", marginBottom: 10 }}>
                {errorLabel}
              </div>
              <button
                onClick={e => { e.stopPropagation(); onStateChange("idle") }}
                style={{
                  display: "inline-flex", alignItems: "center", gap: 6,
                  padding: "7px 16px", borderRadius: 99, border: `1.5px solid oklch(0.72 0.12 28)`,
                  background: "oklch(0.98 0.02 28)", color: "oklch(0.42 0.14 28)",
                  fontFamily: "'DM Sans', sans-serif", fontWeight: 600, fontSize: 12.5, cursor: "pointer",
                }}>
                <Icon name="refresh" size={13} color="oklch(0.42 0.14 28)" /> Try again
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

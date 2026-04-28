"use client"

import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"

function formatStatus(status) {
  const map = {
    uploaded: "Uploaded",
    processing: "Processing",
    ready_to_review: "Ready to review",
    synced: "Synced",
    error: "Error",
  }
  return map[status] ?? "Uploaded"
}

function formatFileSize(bytes) {
  if (!bytes || Number.isNaN(bytes)) return "0 B"
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

function formatUpdated(dateIso) {
  if (!dateIso) return "—"
  return new Date(dateIso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  })
}

function formatDaysLeft(dueDate) {
  const now = new Date()
  const due = new Date(dueDate)
  const msPerDay = 24 * 60 * 60 * 1000
  return Math.max(0, Math.ceil((due - now) / msPerDay))
}

function formatShortDate(dueDate) {
  return new Date(dueDate).toLocaleDateString("en-US", { month: "short", day: "numeric" })
}

export function useDashboardCourseDetail(userId, courseId) {
  const [course, setCourse] = useState(null)
  const [documents, setDocuments] = useState([])
  const [deadlines, setDeadlines] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!userId || !courseId) {
      setCourse(null)
      setDocuments([])
      setDeadlines([])
      setLoading(false)
      return
    }

    async function load() {
      setLoading(true)
      setError(null)

      const { data: courseRow, error: courseError } = await supabase
        .from("courses")
        .select("id, code, name, prof, color, color_bg, assignments, exams, progress")
        .eq("user_id", userId)
        .eq("id", courseId)
        .maybeSingle()

      if (courseError) {
        setError(courseError.message)
        setLoading(false)
        return
      }

      if (!courseRow) {
        setCourse(null)
        setDocuments([])
        setDeadlines([])
        setLoading(false)
        return
      }

      const mappedCourse = {
        id: courseRow.id,
        code: courseRow.code,
        name: courseRow.name,
        prof: courseRow.prof,
        color: courseRow.color ?? "oklch(0.50 0.18 285)",
        colorBg: courseRow.color_bg ?? "oklch(0.95 0.04 285)",
        assignments: courseRow.assignments ?? 0,
        exams: courseRow.exams ?? 0,
        progress: courseRow.progress ?? 0,
      }

      const [{ data: documentRows, error: documentsError }, { data: deadlineRows, error: deadlinesError }] = await Promise.all([
        supabase
          .from("documents")
          .select("id, course_id, file_name, storage_path, file_size_bytes, document_type, status, extracted_assignments, updated_at")
          .eq("user_id", userId)
          .eq("course_id", courseId)
          .order("updated_at", { ascending: false }),
        supabase
          .from("deadlines")
          .select("id, title, type, due_date, course_code")
          .eq("user_id", userId)
          .eq("course_code", mappedCourse.code)
          .order("due_date", { ascending: true }),
      ])

      if (documentsError) {
        setError(documentsError.message)
        setLoading(false)
        return
      }

      if (deadlinesError) {
        setError(deadlinesError.message)
        setLoading(false)
        return
      }

      setCourse(mappedCourse)
      setDocuments(
        (documentRows ?? []).map((row) => ({
          id: row.id,
          courseId: row.course_id,
          name: row.file_name,
          storagePath: row.storage_path,
          documentType: row.document_type,
          status: formatStatus(row.status),
          updated: formatUpdated(row.updated_at),
          size: formatFileSize(row.file_size_bytes),
          assignments: Array.isArray(row.extracted_assignments) ? row.extracted_assignments.length : 0,
        }))
      )
      setDeadlines(
        (deadlineRows ?? []).map((row) => ({
          id: row.id,
          title: row.title,
          type: row.type ?? "Homework",
          date: formatShortDate(row.due_date),
          dueDate: row.due_date,
          daysLeft: formatDaysLeft(row.due_date),
        }))
      )
      setLoading(false)
    }

    void load()
  }, [courseId, userId])

  return { course, documents, deadlines, loading, error }
}

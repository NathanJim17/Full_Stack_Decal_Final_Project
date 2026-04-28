"use client"

import { useCallback, useEffect, useState } from "react"
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

function mapRow(row) {
  return {
    id: row.id,
    name: row.file_name,
    storagePath: row.storage_path,
    courseId: row.course_id,
    status: formatStatus(row.status),
    updated: formatUpdated(row.updated_at),
    size: formatFileSize(row.file_size_bytes),
    assignments: Array.isArray(row.extracted_assignments) ? row.extracted_assignments.length : null,
  }
}

export function useDashboardDocuments(userId) {
  const [docs, setDocs] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const reload = useCallback(async () => {
    if (!userId) {
      setDocs([])
      setLoading(false)
      return
    }

    setLoading(true)
    setError(null)

    const { data, error: dbError } = await supabase
      .from("documents")
      .select("id, course_id, file_name, storage_path, file_size_bytes, status, extracted_assignments, updated_at")
      .eq("user_id", userId)
      .order("updated_at", { ascending: false })

    if (dbError) {
      setError(dbError.message)
      setLoading(false)
      return
    }

    setDocs((data ?? []).map(mapRow))
    setLoading(false)
  }, [userId])

  useEffect(() => {
    const timer = setTimeout(() => {
      void reload()
    }, 0)
    return () => clearTimeout(timer)
  }, [reload])

  return { docs, loading, error, reload }
}

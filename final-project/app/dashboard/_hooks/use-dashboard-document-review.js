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

function formatUpdated(dateIso) {
  if (!dateIso) return "—"
  return new Date(dateIso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  })
}

export function useDashboardDocumentReview(userId, documentId) {
  const [doc, setDoc] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const load = useCallback(async () => {
    if (!userId || !documentId) {
      setDoc(null)
      setLoading(false)
      return
    }

    setLoading(true)
    setError(null)

    const { data, error: dbError } = await supabase
      .from("documents")
      .select("id, user_id, file_name, document_type, status, extracted_assignments, updated_at")
      .eq("id", documentId)
      .eq("user_id", userId)
      .maybeSingle()

    if (dbError) {
      setError(dbError.message)
      setLoading(false)
      return
    }

    if (!data) {
      setDoc(null)
      setLoading(false)
      return
    }

    setDoc({
      id: data.id,
      fileName: data.file_name,
      documentType: data.document_type,
      status: formatStatus(data.status),
      updated: formatUpdated(data.updated_at),
      extractedAssignments: Array.isArray(data.extracted_assignments)
        ? data.extracted_assignments
        : [],
    })
    setLoading(false)
  }, [userId, documentId])

  useEffect(() => { void load() }, [load])

  return { doc, loading, error, reload: load }
}

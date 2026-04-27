"use client"

import { useState, useEffect } from "react"
import { supabase } from "@/lib/supabase"

export function useDashboardCourses(userId) {
  const [courses, setCourses] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!userId) {
      setCourses([])
      setLoading(false)
      return
    }

    async function load() {
      setLoading(true)
      setError(null)

      const { data, error: dbError } = await supabase
        .from("courses")
        .select("id, code, name, prof, color, color_bg, assignments, exams, progress, synced")
        .eq("user_id", userId)
        .order("code", { ascending: true })

      if (dbError) {
        setError(dbError.message)
        setLoading(false)
        return
      }

      const mapped = (data ?? []).map((row) => ({
        id: row.id,
        code: row.code,
        name: row.name,
        prof: row.prof,
        color: row.color ?? "oklch(0.50 0.18 285)",
        colorBg: row.color_bg ?? "oklch(0.95 0.04 285)",
        assignments: row.assignments ?? 0,
        exams: row.exams ?? 0,
        progress: row.progress ?? 0,
        synced: row.synced ?? false,
        deadlines: [],
      }))

      setCourses(mapped)
      setLoading(false)
    }
    load()
  }, [userId])

  return { courses, loading, error }
}
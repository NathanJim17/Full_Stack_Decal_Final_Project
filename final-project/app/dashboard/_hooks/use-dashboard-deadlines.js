"use client"

import { useState, useEffect } from "react"
import { supabase } from "@/lib/supabase"

function formatDaysLeft(dueDate) {
    const now = new Date()
    const due = new Date(dueDate)
    const msPerDay = 24 * 60 * 60 * 1000
    return Math.max(0, Math.ceil((due - now) / msPerDay))
}

function formatShortDate(dueDate) {
    return new Date(dueDate).toLocaleDateString("en-US", { month: "short", day: "numeric" })
}


export function useDashboardDeadlines(userId) {
  const [deadlines, setDeadlines] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!userId) {
      setDeadlines([])
      setLoading(false)
      return
    }

    async function load() {
      setLoading(true)
      setError(null)

      const { data, error: dbError } = await supabase
        .from("deadlines")
        .select("id, title, type, due_date, course_code")
        .eq("user_id", userId)
        .order("due_date", { ascending: true })

      if (dbError) {
        setError(dbError.message)
        setLoading(false)
        return
      }

      const mapped = (data ?? []).map((row) => ({
        id: row.id,
        title: row.course_code ? `${row.course_code} — ${row.title}` : row.title,
        type: row.type ?? "Homework",
        date: formatShortDate(row.due_date),
        daysLeft: formatDaysLeft(row.due_date),
      }))

      setDeadlines(mapped)
      setLoading(false)
    }
    load()
  }, [userId])

  return { deadlines, loading, error }
}
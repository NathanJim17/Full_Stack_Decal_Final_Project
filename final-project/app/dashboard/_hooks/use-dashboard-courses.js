"use client"

import { useCallback, useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"

export function useDashboardCourses(userId) {
  const [courses, setCourses] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const load = useCallback(async () => {
    if (!userId) {
      setCourses([])
      setLoading(false)
      return
    }

    setLoading(true)
    setError(null)

    const { data, error: dbError } = await supabase
      .from("courses")
      .select("id, code, name, prof, color, color_bg, assignments, exams, progress, synced, lecture_days, course_start_date, lecture_start_time, lecture_end_time, lecture_location, schedule_extras, section_enabled, section_label, section_days, section_start_time, section_end_time, section_location, term_end_date")
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
      lectureDays: Array.isArray(row.lecture_days) ? row.lecture_days : [],
      courseStartDate: row.course_start_date ?? "",
      lectureStartTime: row.lecture_start_time ?? "",
      lectureEndTime: row.lecture_end_time ?? "",
      lectureLocation: row.lecture_location ?? "",
      scheduleExtras: Array.isArray(row.schedule_extras) ? row.schedule_extras : [],
      sectionEnabled: row.section_enabled ?? false,
      sectionLabel: row.section_label ?? "",
      sectionDays: Array.isArray(row.section_days) ? row.section_days : [],
      sectionStartTime: row.section_start_time ?? "",
      sectionEndTime: row.section_end_time ?? "",
      sectionLocation: row.section_location ?? "",
      termEndDate: row.term_end_date ?? "",
      deadlines: [],
    }))

    setCourses(mapped)
    setLoading(false)
  }, [userId])

  useEffect(() => {
    void load()
  }, [load])

  const createCourse = useCallback(async ({ code, name, prof }) => {
    if (!userId) return { ok: false, error: "You must be logged in to add a course." }

    const cleanCode = code?.trim()
    const cleanName = name?.trim()
    const cleanProf = prof?.trim()

    if (!cleanCode || !cleanName) {
      return { ok: false, error: "Course code and name are required." }
    }

    const hue = Math.floor(Math.random() * 360)
    const color = `oklch(0.52 0.16 ${hue})`
    const colorBg = `oklch(0.95 0.04 ${hue})`

    const { error: insertError } = await supabase.from("courses").insert({
      user_id: userId,
      code: cleanCode,
      name: cleanName,
      prof: cleanProf || null,
      color,
      color_bg: colorBg,
      assignments: 0,
      exams: 0,
      progress: 0,
      synced: false,
    })

    if (insertError) {
      return { ok: false, error: insertError.message }
    }

    await load()
    return { ok: true }
  }, [load, userId])

  return { courses, loading, error, reload: load, createCourse }
}
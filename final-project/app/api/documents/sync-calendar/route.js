import { createHash } from "crypto"
import { createClient } from "@supabase/supabase-js"
import { supabaseAdmin } from "@/lib/supabase-server"

function getErrorMessage(err) {
  if (err instanceof Error) return err.message
  return "Unknown calendar sync error"
}

function isValidDateString(value) {
  return typeof value === "string" && /^\d{4}-\d{2}-\d{2}$/.test(value)
}

function isValidTimeString(value) {
  return typeof value === "string" && /^\d{2}:\d{2}(:\d{2})?$/.test(value)
}

function normalizeTimeString(value) {
  const input = String(value ?? "").trim()
  if (!isValidTimeString(input)) return ""
  return input.slice(0, 5)
}

function toNextDateString(dateString) {
  const date = new Date(`${dateString}T00:00:00.000Z`)
  date.setUTCDate(date.getUTCDate() + 1)
  return date.toISOString().slice(0, 10)
}

function buildDeterministicEventId(documentId, key) {
  const raw = `${documentId}:${key}`
  return `sf${createHash("sha256").update(raw).digest("hex").slice(0, 30)}`
}

function toEventPayload(document, assignment, documentId, courseCode) {
  const dueDate = String(assignment.due_date ?? "").trim()
  const title = String(assignment.title ?? "").trim()
  const titleWithCourse = courseCode ? `${courseCode} — ${title}` : title

  return {
    id: buildDeterministicEventId(documentId, `assignment:${title.toLowerCase()}:${dueDate}`),
    summary: titleWithCourse,
    description: [
      `Source document: ${document.file_name}`,
      courseCode ? `Course: ${courseCode}` : null,
      assignment.type ? `Type: ${assignment.type}` : null,
      assignment.weight ? `Weight: ${assignment.weight}` : null,
    ].filter(Boolean).join("\n"),
    start: { date: dueDate },
    end: { date: toNextDateString(dueDate) },
  }
}

function dateAndTimeToIso(dateString, timeString) {
  return `${dateString}T${timeString}:00`
}

function addMinutes(timeString, minutesToAdd) {
  const normalized = normalizeTimeString(timeString)
  const [h, m] = normalized.split(":").map(Number)
  const totalMinutes = (h * 60) + m + minutesToAdd
  const nextH = Math.floor((totalMinutes % (24 * 60)) / 60)
  const nextM = totalMinutes % 60
  return `${String(nextH).padStart(2, "0")}:${String(nextM).padStart(2, "0")}`
}

function inferLectureDurationMinutes(days) {
  const daySet = new Set(days)
  const hasTuTh = daySet.has("TU") || daySet.has("TH")
  return hasTuTh ? 90 : 60
}

function normalizeDays(days) {
  if (!Array.isArray(days)) return []
  return days
    .map(day => String(day).trim().toUpperCase())
    .filter(day => ["MO", "TU", "WE", "TH", "FR", "SA", "SU"].includes(day))
}

function normalizeTimeForCalendar(timeString, days, fallbackMinutes) {
  const input = normalizeTimeString(timeString)
  if (input) return input
  const defaultStart = "09:00"
  return addMinutes(defaultStart, fallbackMinutes ?? inferLectureDurationMinutes(days))
}

function toRecurringCoursePayload(document, documentId, config) {
  const days = normalizeDays(config.days)
  const startTime = normalizeTimeString(config.startTime)
  const endTimeInput = normalizeTimeString(config.endTime)
  const endDate = String(config.endDate ?? "").trim()

  if (!days.length || !isValidDateString(endDate) || !isValidTimeString(startTime)) {
    return { valid: false, reason: `${config.label} requires days, start time, and term end date.` }
  }
  const endTime = isValidTimeString(endTimeInput)
    ? endTimeInput
    : normalizeTimeForCalendar(endTimeInput, days, config.fallbackDurationMinutes)
  if (!isValidTimeString(endTime)) {
    return { valid: false, reason: `${config.label} end time is invalid.` }
  }

  const startDate = String(config.startDate ?? "").trim() || new Date().toISOString().slice(0, 10)
  const title = config.title
  const byday = days.join(",")
  const untilUtc = `${endDate.replaceAll("-", "")}T235959Z`
  const key = `${config.keyPrefix}:${days.join(",")}:${startDate}:${startTime}:${endDate}`

  return {
    valid: true,
    payload: {
      id: buildDeterministicEventId(documentId, key),
      summary: title,
      description: [
        `Source document: ${document.file_name}`,
        config.courseCode ? `Course: ${config.courseCode}` : null,
        config.location ? `Location: ${config.location}` : null,
      ].filter(Boolean).join("\n"),
      start: { dateTime: dateAndTimeToIso(startDate, startTime), timeZone: "America/Los_Angeles" },
      end: { dateTime: dateAndTimeToIso(startDate, endTime), timeZone: "America/Los_Angeles" },
      recurrence: [`RRULE:FREQ=WEEKLY;BYDAY=${byday};UNTIL=${untilUtc}`],
      location: config.location || undefined,
    },
  }
}

async function createCalendarEvent(providerAccessToken, payload) {
  const response = await fetch("https://www.googleapis.com/calendar/v3/calendars/primary/events", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${providerAccessToken}`,
    },
    body: JSON.stringify(payload),
  })

  if (response.ok) {
    return { ok: true, duplicate: false }
  }

  if (response.status === 409) {
    return { ok: true, duplicate: true }
  }

  let message = `Google Calendar error (${response.status})`
  try {
    const json = await response.json()
    const detail = json?.error?.message
    if (detail) message = `${message}: ${detail}`
  } catch {
    // no-op: keep generic message
  }
  return { ok: false, duplicate: false, error: message }
}

export async function POST(request) {
  const { documentId, providerAccessToken, courseCode: requestedCourseCode } = await request.json()
  if (!documentId || !providerAccessToken) {
    return Response.json({ error: "documentId and providerAccessToken are required" }, { status: 400 })
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  const authHeader = request.headers.get("authorization")

  if (!supabaseUrl || !supabaseAnonKey || !authHeader?.startsWith("Bearer ")) {
    return Response.json({ error: "Unauthorized" }, { status: 401 })
  }

  const token = authHeader.replace("Bearer ", "")
  const authClient = createClient(supabaseUrl, supabaseAnonKey, {
    global: { headers: { Authorization: `Bearer ${token}` } },
  })
  const {
    data: { user },
    error: authError,
  } = await authClient.auth.getUser(token)

  if (authError || !user) {
    return Response.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { data: document, error: documentError } = await supabaseAdmin
    .from("documents")
    .select("id, user_id, file_name, course_id, extracted_assignments")
    .eq("id", documentId)
    .eq("user_id", user.id)
    .single()

  if (documentError || !document) {
    return Response.json({ error: "Document not found" }, { status: 404 })
  }

  let resolvedCourseCode = String(requestedCourseCode ?? "").trim()
  let courseSchedule = null
  if (document.course_id) {
    const { data: courseRow } = await supabaseAdmin
      .from("courses")
      .select("code, lecture_days, lecture_start_time, lecture_end_time, lecture_location, section_enabled, section_label, section_days, section_start_time, section_end_time, section_location, term_end_date")
      .eq("id", document.course_id)
      .eq("user_id", user.id)
      .maybeSingle()
    courseSchedule = courseRow
    if (!resolvedCourseCode) resolvedCourseCode = String(courseRow?.code ?? "").trim()
  }

  const assignments = Array.isArray(document.extracted_assignments) ? document.extracted_assignments : []
  const results = []
  let created = 0
  let skipped = 0
  let failed = 0
  let lectureCreated = 0
  let lectureSkipped = 0
  let lectureFailed = 0

  for (const assignment of assignments) {
    const title = String(assignment?.title ?? "").trim()
    const dueDate = String(assignment?.due_date ?? "").trim()

    if (!title || !isValidDateString(dueDate)) {
      skipped += 1
      results.push({
        title: title || "(untitled)",
        due_date: dueDate || "",
        outcome: "skipped_invalid",
        detail: "Assignment requires title and due_date (YYYY-MM-DD)",
      })
      continue
    }

    const payload = toEventPayload(document, assignment, documentId, resolvedCourseCode)
    const createResult = await createCalendarEvent(providerAccessToken, payload)

    if (createResult.ok && createResult.duplicate) {
      skipped += 1
      results.push({ title, due_date: dueDate, outcome: "skipped_existing" })
      continue
    }

    if (createResult.ok) {
      created += 1
      results.push({ title, due_date: dueDate, outcome: "created" })
      continue
    }

    failed += 1
    results.push({ title, due_date: dueDate, outcome: "failed", detail: createResult.error })
  }

  const termEndDate = String(courseSchedule?.term_end_date ?? "").slice(0, 10)
  const lecturePayload = toRecurringCoursePayload(document, documentId, {
    keyPrefix: "lecture",
    title: resolvedCourseCode ? `${resolvedCourseCode} — Lecture` : "Lecture",
    label: "Lecture schedule",
    courseCode: resolvedCourseCode,
    days: courseSchedule?.lecture_days,
    startTime: courseSchedule?.lecture_start_time,
    endTime: courseSchedule?.lecture_end_time,
    endDate: termEndDate,
    location: courseSchedule?.lecture_location,
    fallbackDurationMinutes: 60,
  })

  if (!lecturePayload.valid) {
    lectureFailed += 1
    results.push({ title: "Lecture", due_date: termEndDate, outcome: "lecture_failed_validation", detail: lecturePayload.reason })
  } else {
    const createResult = await createCalendarEvent(providerAccessToken, lecturePayload.payload)
    if (createResult.ok && createResult.duplicate) {
      lectureSkipped += 1
      results.push({ title: "Lecture", due_date: termEndDate, outcome: "lecture_skipped_existing" })
    } else if (createResult.ok) {
      lectureCreated += 1
      results.push({ title: "Lecture", due_date: termEndDate, outcome: "lecture_created" })
    } else {
      lectureFailed += 1
      results.push({ title: "Lecture", due_date: termEndDate, outcome: "lecture_failed", detail: createResult.error })
    }
  }

  if (courseSchedule?.section_enabled) {
    const sectionLabel = String(courseSchedule.section_label ?? "").trim() || "Section"
    const sectionPayload = toRecurringCoursePayload(document, documentId, {
      keyPrefix: "section",
      title: resolvedCourseCode ? `${resolvedCourseCode} — ${sectionLabel}` : sectionLabel,
      label: "Section schedule",
      courseCode: resolvedCourseCode,
      days: courseSchedule.section_days,
      startTime: courseSchedule.section_start_time,
      endTime: courseSchedule.section_end_time,
      endDate: termEndDate,
      location: courseSchedule.section_location,
      fallbackDurationMinutes: 90,
    })

    if (!sectionPayload.valid) {
      lectureFailed += 1
      results.push({ title: sectionLabel, due_date: termEndDate, outcome: "lecture_failed_validation", detail: sectionPayload.reason })
    } else {
      const sectionResult = await createCalendarEvent(providerAccessToken, sectionPayload.payload)
      if (sectionResult.ok && sectionResult.duplicate) {
        lectureSkipped += 1
        results.push({ title: sectionLabel, due_date: termEndDate, outcome: "lecture_skipped_existing" })
      } else if (sectionResult.ok) {
        lectureCreated += 1
        results.push({ title: sectionLabel, due_date: termEndDate, outcome: "lecture_created" })
      } else {
        lectureFailed += 1
        results.push({ title: sectionLabel, due_date: termEndDate, outcome: "lecture_failed", detail: sectionResult.error })
      }
    }
  }

  const total = assignments.length
  const syncStatus = failed === 0 && lectureFailed === 0 ? "synced" : "error"
  const failureSummary = failed === 0 && lectureFailed === 0
    ? null
    : failed + lectureFailed < total + 2
      ? `${failed} assignment and ${lectureFailed} lecture events failed to sync. Some events may already exist, require end dates, or need renewed Google permissions.`
      : "Calendar sync failed. Please reconnect Google and try again."

  try {
    const { error: updateError } = await supabaseAdmin
      .from("documents")
      .update({
        status: syncStatus,
        error_message: failureSummary ? failureSummary.slice(0, 500) : null,
      })
      .eq("id", document.id)
      .eq("user_id", user.id)

    if (updateError) throw updateError
  } catch (err) {
    const message = getErrorMessage(err)
    return Response.json({ error: message }, { status: 500 })
  }

  return Response.json({
    ok: failed === 0 && lectureFailed === 0,
    status: syncStatus,
    summary: { total, created, skipped, failed },
    lectureSummary: { total: courseSchedule?.section_enabled ? 2 : 1, created: lectureCreated, skipped: lectureSkipped, failed: lectureFailed },
    summary_flat: {
      created,
      skipped,
      failed,
      lecture_created: lectureCreated,
      lecture_skipped: lectureSkipped,
      lecture_failed: lectureFailed,
    },
    error: failureSummary,
    results,
  }, { status: 200 })
}

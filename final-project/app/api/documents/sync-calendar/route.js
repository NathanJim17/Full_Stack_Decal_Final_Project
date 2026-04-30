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

function toNextDateString(dateString) {
  const date = new Date(`${dateString}T00:00:00.000Z`)
  date.setUTCDate(date.getUTCDate() + 1)
  return date.toISOString().slice(0, 10)
}

function buildDeterministicEventId(documentId, assignment) {
  const raw = `${documentId}:${String(assignment.title ?? "").trim().toLowerCase()}:${String(assignment.due_date ?? "").trim()}`
  return `sf${createHash("sha256").update(raw).digest("hex").slice(0, 30)}`
}

function toEventPayload(document, assignment, documentId, courseCode) {
  const dueDate = String(assignment.due_date ?? "").trim()
  const title = String(assignment.title ?? "").trim()
  const titleWithCourse = courseCode ? `${courseCode} — ${title}` : title

  return {
    id: buildDeterministicEventId(documentId, assignment),
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
  if (!resolvedCourseCode && document.course_id) {
    const { data: courseRow } = await supabaseAdmin
      .from("courses")
      .select("code")
      .eq("id", document.course_id)
      .eq("user_id", user.id)
      .maybeSingle()
    resolvedCourseCode = String(courseRow?.code ?? "").trim()
  }

  const assignments = Array.isArray(document.extracted_assignments) ? document.extracted_assignments : []
  const results = []
  let created = 0
  let skipped = 0
  let failed = 0

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

  const total = assignments.length
  const syncStatus = failed === 0 ? "synced" : "error"
  const failureSummary = failed === 0
    ? null
    : failed < total
      ? `${failed} of ${total} events failed to sync. Some events may already exist or need renewed Google permissions.`
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
    ok: failed === 0,
    status: syncStatus,
    summary: { total, created, skipped, failed },
    error: failureSummary,
    results,
  }, { status: 200 })
}

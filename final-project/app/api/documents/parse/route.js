import { createClient } from "@supabase/supabase-js"
import { supabaseAdmin } from "@/lib/supabase-server"

function getErrorMessage(err) {
  if (err instanceof Error) return err.message
  return "Unknown parsing error"
}

function resolveParserUrl(request) {
  const configured = process.env.DOCUMENT_PARSER_URL?.trim()
  if (configured) {
    try {
      return new URL(configured, request.url).toString()
    } catch {
      throw new Error("DOCUMENT_PARSER_URL is invalid")
    }
  }
  return new URL("/api/parse", request.url).toString()
}

async function parseWithFastApi(request, document, userId) {
  const parserUrl = resolveParserUrl(request)

  const response = await fetch(parserUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      documentId: document.id,
      userId,
      storagePath: document.storage_path,
      fileName: document.file_name,
      documentType: document.document_type,
    }),
  })

  if (!response.ok) {
    let errText = ""
    try {
      errText = await response.text()
    } catch {
      errText = ""
    }
    throw new Error(`Parser request failed (${response.status})${errText ? `: ${errText.slice(0, 300)}` : ""}`)
  }

  const json = await response.json()
  return {
    assignments: Array.isArray(json?.assignments) ? json.assignments : [],
  }
}

export async function POST(request) {
  const { documentId } = await request.json()
  if (!documentId) {
    return Response.json({ error: "documentId is required" }, { status: 400 })
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

  const { data: document, error: docError } = await supabaseAdmin
    .from("documents")
    .select("id, user_id, file_name, storage_path, document_type")
    .eq("id", documentId)
    .eq("user_id", user.id)
    .single()

  if (docError || !document) {
    return Response.json({ error: "Document not found" }, { status: 404 })
  }

  try {
    const parsed = await parseWithFastApi(request, document, user.id)

    const { error: updateError } = await supabaseAdmin
      .from("documents")
      .update({
        status: "ready_to_review",
        extracted_assignments: parsed.assignments,
        error_message: null,
      })
      .eq("id", document.id)
      .eq("user_id", user.id)

    if (updateError) {
      throw updateError
    }

    return Response.json({
      ok: true,
      status: "ready_to_review",
      assignmentsCount: parsed.assignments.length,
    }, { status: 200 })
  } catch (err) {
    const errorMessage = getErrorMessage(err)
    console.error("documents/parse failed:", errorMessage)
    await supabaseAdmin
      .from("documents")
      .update({
        status: "error",
        error_message: errorMessage.slice(0, 500),
      })
      .eq("id", document.id)
      .eq("user_id", user.id)

    return Response.json({ error: errorMessage }, { status: 500 })
  }
}

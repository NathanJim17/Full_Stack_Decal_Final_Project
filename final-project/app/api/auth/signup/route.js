import { supabase } from '../../../../lib/supabase'

export async function POST(request) {
  // TODO:
  // 1. Get email and password from request.json()
  const { email, password } = await request.json()
  
  // 2. Call supabase.auth.signUp({ email, password })
  // 3. Return the result as JSON
  // 4. Use appropriate status codes (201 for success, 400 for error)
  const { data, error } = await supabase.auth.signUp({ email, password })
  if (error) {
    return Response.json({ error: error.message }, { status: 400 })
  }
  return Response.json(data, { status: 201 })
}
import { supabase } from '../../../../lib/supabase'

export async function GET(request) {
  // TODO: Call supabase.auth.getUser() and return the user data
  const { data, error } = await supabase.auth.getUser()
  if (error) {
    return Response.json({ error: error.message }, { status: 400 })
  }
  return Response.json(data, { status: 200 })
}
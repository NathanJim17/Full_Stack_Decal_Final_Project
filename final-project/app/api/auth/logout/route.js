import { supabase } from '../../../../lib/supabase'

export async function POST(request) {
  // TODO: Call supabase.auth.signOut() and return result
  const { data, error } = await supabase.auth.signOut()
  if (error) {
    return Response.json({ error: error.message }, { status: 400 })
  }
  return Response.json(data, { status: 200 })
}
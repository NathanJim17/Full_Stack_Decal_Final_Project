import { supabase } from '../../../../lib/supabase'

export async function GET(request) {
  // TODO: Call supabase.auth.signInWithOAuth({ provider: 'google' })
  // This returns a URL - redirect the user to it
  const { data, error } = await supabase.auth.signInWithOAuth({ provider: 'google' })
  if (error) {
    return Response.json({ error: error.message }, { status: 400 })
  }
  return Response.redirect(data.url)
}
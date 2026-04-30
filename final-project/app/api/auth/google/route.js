import { createClient } from '@supabase/supabase-js'

export async function GET(request) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseAnonKey) {
    return Response.json(
      { error: 'Missing Supabase environment variables.' },
      { status: 500 }
    )
  }

  const supabase = createClient(supabaseUrl, supabaseAnonKey)

  // TODO: Call supabase.auth.signInWithOAuth({ provider: 'google' })
  // This returns a URL - redirect the user to it
  const { data, error } = await supabase.auth.signInWithOAuth({ provider: 'google' })
  if (error) {
    return Response.json({ error: error.message }, { status: 400 })
  }
  return Response.redirect(data.url)
}
"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { supabase } from "@/lib/supabase"
import { T } from "@/app/dashboard/_lib/dashboard-data"

const inputStyle = {
  width: "100%",
  padding: "10px 12px",
  borderRadius: 10,
  border: `1.5px solid ${T.border}`,
  background: T.surface,
  color: T.text,
  fontFamily: "'DM Sans', sans-serif",
  fontSize: 14,
  outline: "none",
}

function FloatingLogo({ src, alt, bottom, left, right, rotate, opacity, width, height }) {
  return (
    <div
      style={{
        position: "absolute",
        bottom,
        left,
        right,
        transform: `rotate(${rotate}deg)`,
        opacity,
        borderRadius: 14,
        padding: "8px 10px",
        boxShadow: `0 8px 20px ${T.shadow}`,
        pointerEvents: "none",
        background: "rgba(255,255,255,0.35)",
      }}
    >
      <Image src={src} alt={alt} width={width} height={height} style={{ display: "block" }} />
    </div>
  )
}

export default function LandingAuthPanel() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [isSignUp, setIsSignUp] = useState(false)
  const [error, setError] = useState("")
  const [checkingSession, setCheckingSession] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const router = useRouter()

  useEffect(() => {
    let isMounted = true

    async function checkUser() {
      const { data, error: userError } = await supabase.auth.getUser()
      if (!isMounted) return
      if (!userError && data?.user) {
        router.replace("/dashboard")
        return
      }
      setCheckingSession(false)
    }

    checkUser()
    return () => {
      isMounted = false
    }
  }, [router])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError("")
    setSubmitting(true)

    const normalizedEmail = email.trim().toLowerCase()

    if (!normalizedEmail || !password) {
      setError("Email and password are required")
      setSubmitting(false)
      return
    }

    const authCall = isSignUp
      ? supabase.auth.signUp({ email: normalizedEmail, password })
      : supabase.auth.signInWithPassword({ email: normalizedEmail, password })

    const { error: authError } = await authCall

    if (authError) {
      setError(authError.message)
      setSubmitting(false)
      return
    }

    router.push("/dashboard")
  }

  const handleGoogleSignIn = async () => {
    setError("")
    setSubmitting(true)

    const { error: oauthError } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/dashboard`,
        scopes: "https://www.googleapis.com/auth/calendar.events",
        queryParams: {
          prompt: "consent",
          access_type: "offline",
        },
      },
    })

    if (oauthError) {
      setError(oauthError.message)
      setSubmitting(false)
    }
  }

  if (checkingSession) {
    return (
      <div style={{ minHeight: "100vh", background: T.bg, color: T.text, display: "grid", placeItems: "center", fontFamily: "'DM Sans', sans-serif" }}>
        Checking session...
      </div>
    )
  }

  return (
    <main style={{ minHeight: "100vh", background: T.bg, color: T.text, fontFamily: "'DM Sans', sans-serif" }}>
      <div style={{ minHeight: "100vh", display: "grid", gridTemplateColumns: "3fr 2fr", alignItems: "stretch" }}>
        <section
          style={{
            position: "relative",
            overflow: "hidden",
            background: `linear-gradient(140deg, ${T.accentBg}, ${T.surface})`,
            borderRight: `1.5px solid ${T.border}`,
            padding: "54px 56px",
            boxShadow: `inset -10px 0 24px ${T.shadow}`,
          }}
        >
          <FloatingLogo
            src="/notion.png"
            alt="Notion"
            bottom={68}
            right={170}
            rotate={-11}
            opacity={0.3}
            width={120}
            height={34}
          />
          <FloatingLogo
            src="/google-calendar.png"
            alt="Google Calendar"
            bottom={28}
            right={38}
            rotate={8}
            opacity={0.3}
            width={132}
            height={36}
          />
          <span style={{ display: "inline-block", padding: "6px 12px", borderRadius: 999, background: T.surface, border: `1px solid ${T.borderSub}`, color: T.muted, fontSize: 12, fontWeight: 600 }}>
            Calendar Sync
          </span>
          <h1 style={{ marginTop: 16, marginBottom: 12, fontFamily: "'Lora', serif", fontSize: 42, lineHeight: 1.15 }}>
            Plan classes, files, and deadlines in one place.
          </h1>
          <p style={{ margin: 0, color: T.muted, maxWidth: 560, lineHeight: 1.6 }}>
            Keep course materials organized, upload documents for parsing, and jump straight into your semester overview after sign in.
          </p>
          <ul style={{ marginTop: 22, marginBottom: 0, paddingLeft: 18, color: T.text, lineHeight: 1.8 }}>
            <li>Course-centered dashboard with quick navigation</li>
            <li>Document uploads tied directly to each class</li>
            <li>Calendar and deadlines in a single workspace</li>
          </ul>
        </section>

        <section style={{ background: T.surface, padding: "54px 46px", boxShadow: `-8px 0 20px ${T.shadow}` }}>
          <h2 style={{ marginTop: 0, marginBottom: 8, fontSize: 26, fontFamily: "'Lora', serif" }}>{isSignUp ? "Create your account" : "Welcome back"}</h2>
          <p style={{ marginTop: 0, marginBottom: 18, color: T.muted, fontSize: 14 }}>
            {isSignUp ? "Sign up to launch your dashboard." : "Sign in to continue to your dashboard."}
          </p>

          <form onSubmit={handleSubmit} style={{ display: "grid", gap: 10 }}>
            <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} style={inputStyle} />
            <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} style={inputStyle} />
            <button
              type="submit"
              disabled={submitting}
              style={{ width: "100%", padding: "10px 14px", borderRadius: 12, border: "none", background: T.accent, color: "white", fontWeight: 600, fontFamily: "'DM Sans', sans-serif", cursor: "pointer" }}
            >
              {isSignUp ? "Sign up" : "Login"}
            </button>
          </form>

          <div style={{ display: "grid", placeItems: "center", margin: "10px 0", color: T.faint, fontSize: 12 }}>OR</div>

          <button
            onClick={handleGoogleSignIn}
            disabled={submitting}
            style={{
              width: "100%",
              padding: "10px 14px",
              borderRadius: 12,
              border: `1.5px solid ${T.border}`,
              background: T.surface2,
              color: T.text,
              fontWeight: 500,
              fontFamily: "'DM Sans', sans-serif",
              cursor: "pointer",
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 8,
            }}
          >
            <Image src="/google.png" alt="" width={16} height={16} aria-hidden />
            <span>Continue with Google</span>
          </button>

          <button
            onClick={() => setIsSignUp((prev) => !prev)}
            style={{ marginTop: 14, background: "transparent", border: "none", color: T.accent, cursor: "pointer", padding: 0, fontFamily: "'DM Sans', sans-serif", fontWeight: 500 }}
          >
            {isSignUp ? "Already have an account? Login" : "Need an account? Sign up"}
          </button>

          {error ? <p style={{ marginTop: 12, color: "rgb(180 34 34)", fontSize: 13 }}>{error}</p> : null}
        </section>
      </div>
    </main>
  )
}

"use client"

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '../../../lib/supabase'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isSignUp, setIsSignUp] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    const normalizedEmail = email.trim().toLowerCase()

    if (!normalizedEmail || !password) {
      setError('Email and password are required')
      return
    }

    const authCall = isSignUp
      ? supabase.auth.signUp({ email: normalizedEmail, password })
      : supabase.auth.signInWithPassword({ email: normalizedEmail, password })

    const { error } = await authCall

    if (error) {
      setError(error.message)
    } else {
      router.push('/')
    }
  }

  const handleGoogleSignIn = async () => {
    setError('')

    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/`
      }
    })

    if (error) {
      setError(error.message)
    }
  }

  return (
    <div style={{ maxWidth: '400px', margin: '100px auto', padding: '20px' }}>
      <h1>{isSignUp ? 'Sign Up' : 'Login'}</h1>

      <form onSubmit={handleSubmit}>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          style={{ width: '100%', padding: '10px', marginBottom: '10px' }}
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          style={{ width: '100%', padding: '10px', marginBottom: '10px' }}
        />
        <button type="submit" style={{ width: '100%', padding: '10px', marginBottom: '10px' }}>
          {isSignUp ? 'Sign Up' : 'Login'}
        </button>
      </form>

      <button onClick={handleGoogleSignIn} style={{ width: '100%', padding: '10px', marginBottom: '10px' }}>
        Sign in with Google
      </button>

      <p onClick={() => setIsSignUp(!isSignUp)} style={{ cursor: 'pointer', color: 'blue' }}>
        {isSignUp ? 'Already have an account? Login' : "Don't have an account? Sign Up"}
      </p>

      {error && <p style={{ color: 'red' }}>{error}</p>}
    </div>
  )
}

"use client"

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isSignUp, setIsSignUp] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    
    // Call our API route instead of Supabase directly!
    const endpoint = isSignUp ? '/api/auth/signup' : '/api/auth/login'
    const res = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    })
    
    const data = await res.json()
    
    if (data.error) {
      setError(data.error.message)
    } else {
      router.push('/dashboard')
    }
  }

  const handleGoogleSignIn = () => {
    // Redirect to our Google OAuth API route
    window.location.href = '/api/auth/google'
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
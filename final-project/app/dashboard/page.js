"use client"

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function Dashboard() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    async function checkUser() {
      // Call our API route to get user
      const res = await fetch('/api/auth/user')
      const data = await res.json()
      
      if (data.data?.user) {
        setUser(data.data.user)
      } else {
        router.push('/login')
      }
      setLoading(false)
    }
    checkUser()
  }, [router])

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' })
    router.push('/login')
  }

  if (loading) return <p>Loading...</p>

  return (
    <div style={{ maxWidth: '600px', margin: '100px auto', padding: '20px' }}>
      <h1>Dashboard</h1>
      <p>Welcome, {user?.email}!</p>
      <p>User ID: {user?.id}</p>
      <button onClick={handleLogout} style={{ padding: '10px 20px' }}>
        Logout
      </button>
    </div>
  )
}
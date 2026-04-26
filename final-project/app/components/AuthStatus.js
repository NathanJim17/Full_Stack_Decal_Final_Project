"use client"

import { useState } from "react"

export default function AuthStatus() {
    const [user, setUser] = useState(null)

    const checkStatus = async () => {
        // TODO: 
    // 1. Use fetch() to call GET /api/auth/user
    const response = await fetch("/api/auth/user")

    // 2. Parse the response with .json()
    const data = await response.json()

    // 3. If data.data?.user exists, setStatus to the user's email
    // 4. Otherwise, setStatus to "Not Logged In"
    if (data.data?.user) {
        setUser(data.data.user.email)
    } else {
        setUser("Not Logged In")
    }

    }

    return (
        <div style={{ padding: '20px', border: '1px solid #ccc', borderRadius: '8px', marginTop: '20px' }}>
          <h3>Auth Status</h3>
          <button onClick={checkStatus} style={{ padding: '10px 20px', marginBottom: '10px' }}>
            Check Login Status
          </button>
          <p>
            {/* TODO: ternary - if status is null, show "Click button to check", else show status */}
            {user === null ? "Click button to check" : user}
          </p>
        </div>
    )
}
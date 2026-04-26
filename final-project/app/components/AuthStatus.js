"use client"

import { useState } from "react"
import { supabase } from "../../lib/supabase"

export default function AuthStatus() {
    const [user, setUser] = useState(null)

    const checkStatus = async () => {
    const { data, error } = await supabase.auth.getUser()

    if (error || !data?.user) {
      setUser("Not Logged In")
      return
    }

    setUser(data.user.email)

    }

    const handleLogout = async () => {
      const { error } = await supabase.auth.signOut()

      if (error) {
        return
      }

      setUser("Not Logged In")
    }

    return (
        <div style={{ padding: '20px', border: '1px solid #ccc', borderRadius: '8px', marginTop: '20px' }}>
          <h3>Auth Status</h3>
          <button onClick={checkStatus} style={{ padding: '10px 20px', marginBottom: '10px' }}>
            Check Login Status
          </button>
          <button onClick={handleLogout} style={{ padding: '10px 20px', marginLeft: '10px', marginBottom: '10px' }}>
            Logout
          </button>
          <p>
            {/* TODO: ternary - if status is null, show "Click button to check", else show status */}
            {user === null ? "Click button to check" : user}
          </p>
        </div>
    )
}
import { useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from './useAuth'
import { logoutToLogin } from '../utils/account'

export function useLogout() {
  const { logout } = useAuth()
  const navigate = useNavigate()
  const inFlight = useRef(false)
  const [busy, setBusy] = useState(false)
  const signOut = async () => {
    if (inFlight.current) return
    inFlight.current = true
    setBusy(true)
    try { await logoutToLogin(logout, navigate) }
    finally { inFlight.current = false; setBusy(false) }
  }
  return { signOut, busy }
}

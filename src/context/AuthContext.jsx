import { useCallback, useEffect, useMemo, useState } from 'react'
import api from '../api/axios'
import { AuthContext } from './auth-context'

const TOKEN_KEY = 'sims_token'
const USER_KEY = 'sims_user'

function readStoredUser() {
  try {
    return JSON.parse(localStorage.getItem(USER_KEY) ?? 'null')
  } catch {
    return null
  }
}

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem(TOKEN_KEY))
  const [user, setUser] = useState(readStoredUser)
  const [loading, setLoading] = useState(Boolean(localStorage.getItem(TOKEN_KEY)))

  useEffect(() => {
    let active = true

    if (!token) {
      return undefined
    }

    api
      .get('/auth/me')
      .then(({ data }) => {
        if (!active) return
        setUser(data.data)
        localStorage.setItem(USER_KEY, JSON.stringify(data.data))
      })
      .catch(() => {
        if (!active) return
        localStorage.removeItem(TOKEN_KEY)
        localStorage.removeItem(USER_KEY)
        setToken(null)
        setUser(null)
      })
      .finally(() => {
        if (active) setLoading(false)
      })

    return () => {
      active = false
    }
  }, [token])

  const login = useCallback(async (username, password) => {
    const { data } = await api.post('/auth/login', { username, password })
    const { token: newToken, user: newUser } = data.data

    localStorage.setItem(TOKEN_KEY, newToken)
    localStorage.setItem(USER_KEY, JSON.stringify(newUser))
    setToken(newToken)
    setUser(newUser)

    return newUser
  }, [])

  const logout = useCallback(async () => {
    try {
      await api.post('/auth/logout')
    } catch {
      // Token may already be invalid; clear locally regardless.
    }

    localStorage.removeItem(TOKEN_KEY)
    localStorage.removeItem(USER_KEY)
    setToken(null)
    setUser(null)
  }, [])

  const updateUser = useCallback((nextUser) => {
    setUser(nextUser)
    localStorage.setItem(USER_KEY, JSON.stringify(nextUser))
  }, [])

  const value = useMemo(
    () => ({ token, user, loading, login, logout, updateUser, isAuthenticated: Boolean(token && user) }),
    [token, user, loading, login, logout, updateUser],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

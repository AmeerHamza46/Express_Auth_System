import { createContext, useContext, useMemo, useState } from 'react'

const AuthContext = createContext(null)

const STORAGE_KEY = 'first_app_auth'

function readStoredAuth() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

export function AuthProvider({ children }) {
  const [session, setSession] = useState(() => readStoredAuth())

  const value = useMemo(
    () => ({
      user: session?.user ?? null,
      accessToken: session?.accessToken ?? null,
      isAuthenticated: Boolean(session?.accessToken),
      setSession: (next) => {
        setSession(next)
        if (next) {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
        } else {
          localStorage.removeItem(STORAGE_KEY)
        }
      },
      signOut: () => {
        setSession(null)
        localStorage.removeItem(STORAGE_KEY)
      },
    }),
    [session]
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}

import { createContext, useCallback, useContext, useEffect, useState } from 'react'
import { api, setUnauthorizedHandler, tokenStore } from './api'

const AuthCtx = createContext(null)

export const ROLE_HOME = { ADMIN: '/admin', SUPERVISOR: '/supervisor', EMPLOYEE: '/employee' }

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [ready, setReady] = useState(false)

  const clear = useCallback(() => { tokenStore.clear(); setUser(null) }, [])

  useEffect(() => {
    setUnauthorizedHandler(clear)
    if (!tokenStore.get()) { setReady(true); return }
    api.me().then(setUser).catch(clear).finally(() => setReady(true))
  }, [clear])

  const login = async (identifier, password, remember) => {
    const res = await api.login(identifier, password)
    tokenStore.set(res.token, remember)
    setUser(res.user)
    return res.user
  }

  const logout = async () => {
    try { await api.logout() } catch { /* token may already be invalid */ }
    clear()
  }

  return <AuthCtx.Provider value={{ user, ready, login, logout }}>{children}</AuthCtx.Provider>
}

export const useAuth = () => useContext(AuthCtx)

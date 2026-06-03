import { createContext, useContext, useState } from 'react'

const SESSION_KEY = 'tc_auth'
const VALID_USERNAME = import.meta.env.VITE_APP_USERNAME
const VALID_PASSWORD = import.meta.env.VITE_APP_PASSWORD

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [authenticated, setAuthenticated] = useState(
    () => sessionStorage.getItem(SESSION_KEY) === 'true'
  )

  function login(username, password) {
    if (username !== VALID_USERNAME || password !== VALID_PASSWORD) return false
    sessionStorage.setItem(SESSION_KEY, 'true')
    setAuthenticated(true)
    return true
  }

  function logout() {
    sessionStorage.removeItem(SESSION_KEY)
    setAuthenticated(false)
  }

  return (
    <AuthContext.Provider value={{ authenticated, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}

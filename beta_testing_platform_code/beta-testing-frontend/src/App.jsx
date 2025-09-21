import { useState, useEffect } from 'react'
import LoginForm from './components/LoginForm'
import SignUpForm from './components/SignUpForm'
import Dashboard from './components/Dashboard'
import './App.css'

function App() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [showSignUp, setShowSignUp] = useState(false)

  useEffect(() => {
    // Check if user is already logged in
    checkAuthStatus()
  }, [])

  const checkAuthStatus = async () => {
    try {
      // For demo purposes, check localStorage for user session
      const savedUser = localStorage.getItem('user')
      if (savedUser) {
        setUser(savedUser)
      }
    } catch (err) {
      console.error('Auth check failed:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleLogin = (username) => {
    setUser(username)
    localStorage.setItem('user', username)
  }

  const handleLogout = async () => {
    try {
      localStorage.removeItem('user')
    } catch (err) {
      console.error('Logout failed:', err)
    } finally {
      setUser(null)
    }
  }

  const handleShowSignUp = () => {
    setShowSignUp(true)
  }

  const handleBackToLogin = () => {
    setShowSignUp(false)
  }

  const handleSignUp = (username) => {
    setUser(username)
    localStorage.setItem('user', username)
    setShowSignUp(false)
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="App">
      {user ? (
        <Dashboard username={user} onLogout={handleLogout} />
      ) : showSignUp ? (
        <SignUpForm onSignUp={handleSignUp} onBackToLogin={handleBackToLogin} />
      ) : (
        <LoginForm onLogin={handleLogin} onShowSignUp={handleShowSignUp} />
      )}
    </div>
  )
}

export default App

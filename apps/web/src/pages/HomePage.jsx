import { Navigate, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import './HomePage.css'

export default function HomePage() {
  const { user, isAuthenticated, signOut } = useAuth()
  const navigate = useNavigate()

  if (!isAuthenticated) {
    return <Navigate to="/" replace />
  }

  function handleSignOut() {
    signOut()
    navigate('/', { replace: true })
  }

  return (
    <div className="home-shell">
      <div className="home-atmosphere" aria-hidden="true" />
      <main className="home-content">
        <p className="brand-mark">First</p>
        <h1>You&apos;re in.</h1>
        <p className="home-copy">
          Signed in as <strong>{user?.email}</strong>
          {user?.username ? ` (${user.username})` : ''}.
        </p>
        <button type="button" className="sign-out" onClick={handleSignOut}>
          Sign out
        </button>
      </main>
    </div>
  )
}

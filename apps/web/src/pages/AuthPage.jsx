import { useState } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import { resendOtp, signin, signup, verifyEmail } from '../api/auth'
import { useAuth } from '../context/AuthContext'
import './AuthPage.css'

const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).+$/

function fieldError(errors, field) {
  return errors.find((e) => e.field === field)?.message
}

export default function AuthPage() {
  const { isAuthenticated, setSession } = useAuth()
  const navigate = useNavigate()
  const [mode, setMode] = useState('signin')
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    otp: '',
  })
  const [clientErrors, setClientErrors] = useState([])
  const [serverMessage, setServerMessage] = useState('')
  const [infoMessage, setInfoMessage] = useState('')
  const [loading, setLoading] = useState(false)

  if (isAuthenticated) {
    return <Navigate to="/home" replace />
  }

  const isSignup = mode === 'signup'
  const isVerify = mode === 'verify'

  function updateField(key) {
    return (event) => {
      setForm((prev) => ({ ...prev, [key]: event.target.value }))
      setServerMessage('')
      setInfoMessage('')
      setClientErrors((prev) => prev.filter((e) => e.field !== key))
    }
  }

  function validate() {
    const next = []

    if (isVerify) {
      if (!form.email.trim()) {
        next.push({ field: 'email', message: 'Email is required' })
      }
      if (!form.otp.trim()) {
        next.push({ field: 'otp', message: 'Verification code is required' })
      } else if (!/^\d{6}$/.test(form.otp.trim())) {
        next.push({
          field: 'otp',
          message: 'Verification code must be 6 digits',
        })
      }
      setClientErrors(next)
      return next.length === 0
    }

    if (isSignup) {
      const name = form.name.trim()
      if (!name) next.push({ field: 'name', message: 'Name is required' })
      else if (name.length < 3 || name.length > 30) {
        next.push({
          field: 'name',
          message: 'Name must be between 3 and 30 characters',
        })
      }
    }

    if (!form.email.trim()) {
      next.push({ field: 'email', message: 'Email is required' })
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) {
      next.push({ field: 'email', message: 'Invalid email address' })
    }

    if (!form.password) {
      next.push({ field: 'password', message: 'Password is required' })
    } else if (isSignup) {
      if (form.password.length < 8) {
        next.push({
          field: 'password',
          message: 'Password must be at least 8 characters long',
        })
      } else if (!PASSWORD_REGEX.test(form.password)) {
        next.push({
          field: 'password',
          message:
            'Password must contain at least one uppercase letter, one lowercase letter, and one digit',
        })
      }
    }

    setClientErrors(next)
    return next.length === 0
  }

  async function completeLogin(email, password) {
    const result = await signin({ email, password })
    setSession({
      user: result.data.user,
      accessToken: result.data.accessToken,
    })
    navigate('/home', { replace: true })
  }

  function enterVerifyMode(message) {
    setMode('verify')
    setForm((prev) => ({ ...prev, otp: '' }))
    setClientErrors([])
    setServerMessage('')
    setInfoMessage(message)
  }

  async function handleSubmit(event) {
    event.preventDefault()
    if (!validate()) return

    setLoading(true)
    setServerMessage('')
    setInfoMessage('')

    try {
      if (isVerify) {
        await verifyEmail({
          email: form.email.trim(),
          otp: form.otp.trim(),
        })
        await completeLogin(form.email.trim(), form.password)
        return
      }

      if (isSignup) {
        const result = await signup({
          name: form.name.trim(),
          email: form.email.trim(),
          password: form.password,
        })
        enterVerifyMode(
          result.message ||
            'We sent a 6-digit code to your email. Enter it below to continue.'
        )
        return
      }

      await completeLogin(form.email.trim(), form.password)
    } catch (error) {
      if (error.code === 'EMAIL_NOT_VERIFIED') {
        enterVerifyMode(
          'Your account is not verified yet. Enter the code from your email, or resend a new one.'
        )
        return
      }

      if (error.errors?.length) {
        setClientErrors(error.errors)
      }
      setServerMessage(error.message || 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  async function handleResendOtp() {
    if (!form.email.trim()) {
      setServerMessage('Email is required to resend the code')
      return
    }

    setLoading(true)
    setServerMessage('')
    setInfoMessage('')

    try {
      const result = await resendOtp({ email: form.email.trim() })
      setInfoMessage(result.message || 'A new verification code has been sent.')
    } catch (error) {
      setServerMessage(error.message || 'Failed to resend code')
    } finally {
      setLoading(false)
    }
  }

  function switchMode(nextMode) {
    setMode(nextMode)
    setClientErrors([])
    setServerMessage('')
    setInfoMessage('')
    setForm((prev) => ({ ...prev, otp: '' }))
  }

  const headline = isVerify
    ? 'Check your inbox.'
    : isSignup
      ? 'Create your account.'
      : 'Welcome back.'

  const copy = isVerify
    ? `Enter the 6-digit code we sent to ${form.email || 'your email'}.`
    : isSignup
      ? 'Join in a minute — pick a name, email, and a strong password.'
      : 'Sign in to continue where you left off.'

  return (
    <div className="auth-shell">
      <div className="auth-atmosphere" aria-hidden="true">
        <div className="orb orb-a" />
        <div className="orb orb-b" />
        <div className="grain" />
      </div>

      <main className="auth-layout">
        <section className="auth-brand">
          <p className="brand-mark">First</p>
          <h1 className="brand-headline">{headline}</h1>
          <p className="brand-copy">{copy}</p>
        </section>

        <section className="auth-panel" aria-label="Authentication form">
          {!isVerify && (
            <div className="mode-toggle" role="tablist" aria-label="Auth mode">
              <button
                type="button"
                role="tab"
                aria-selected={!isSignup}
                className={!isSignup ? 'active' : ''}
                onClick={() => switchMode('signin')}
              >
                Sign in
              </button>
              <button
                type="button"
                role="tab"
                aria-selected={isSignup}
                className={isSignup ? 'active' : ''}
                onClick={() => switchMode('signup')}
              >
                Sign up
              </button>
            </div>
          )}

          <form className="auth-form" onSubmit={handleSubmit} noValidate>
            {isVerify ? (
              <>
                <label className="field" style={{ animationDelay: '40ms' }}>
                  <span>Verification code</span>
                  <input
                    name="otp"
                    inputMode="numeric"
                    autoComplete="one-time-code"
                    value={form.otp}
                    onChange={updateField('otp')}
                    placeholder="123456"
                    maxLength={6}
                    aria-invalid={Boolean(fieldError(clientErrors, 'otp'))}
                  />
                  {fieldError(clientErrors, 'otp') && (
                    <em className="field-error">
                      {fieldError(clientErrors, 'otp')}
                    </em>
                  )}
                </label>

                {infoMessage && (
                  <p className="form-message form-message--info" role="status">
                    {infoMessage}
                  </p>
                )}

                {serverMessage && (
                  <p className="form-message" role="alert">
                    {serverMessage}
                  </p>
                )}

                <button className="submit" type="submit" disabled={loading}>
                  {loading ? 'Verifying…' : 'Verify email'}
                </button>

                <div className="auth-secondary">
                  <button
                    type="button"
                    className="linkish"
                    onClick={handleResendOtp}
                    disabled={loading}
                  >
                    Resend code
                  </button>
                  <button
                    type="button"
                    className="linkish"
                    onClick={() => switchMode('signin')}
                    disabled={loading}
                  >
                    Back to sign in
                  </button>
                </div>
              </>
            ) : (
              <>
                {isSignup && (
                  <label className="field" style={{ animationDelay: '40ms' }}>
                    <span>Name</span>
                    <input
                      name="name"
                      autoComplete="name"
                      value={form.name}
                      onChange={updateField('name')}
                      placeholder="Alex Rivera"
                      aria-invalid={Boolean(fieldError(clientErrors, 'name'))}
                    />
                    {fieldError(clientErrors, 'name') && (
                      <em className="field-error">
                        {fieldError(clientErrors, 'name')}
                      </em>
                    )}
                  </label>
                )}

                <label className="field" style={{ animationDelay: '80ms' }}>
                  <span>Email</span>
                  <input
                    name="email"
                    type="email"
                    autoComplete="email"
                    value={form.email}
                    onChange={updateField('email')}
                    placeholder="you@example.com"
                    aria-invalid={Boolean(fieldError(clientErrors, 'email'))}
                  />
                  {fieldError(clientErrors, 'email') && (
                    <em className="field-error">
                      {fieldError(clientErrors, 'email')}
                    </em>
                  )}
                </label>

                <label className="field" style={{ animationDelay: '120ms' }}>
                  <span>Password</span>
                  <input
                    name="password"
                    type="password"
                    autoComplete={isSignup ? 'new-password' : 'current-password'}
                    value={form.password}
                    onChange={updateField('password')}
                    placeholder={isSignup ? 'Min 8 chars, Aa1…' : 'Your password'}
                    aria-invalid={Boolean(fieldError(clientErrors, 'password'))}
                  />
                  {fieldError(clientErrors, 'password') && (
                    <em className="field-error">
                      {fieldError(clientErrors, 'password')}
                    </em>
                  )}
                </label>

                {serverMessage && (
                  <p className="form-message" role="alert">
                    {serverMessage}
                  </p>
                )}

                <button className="submit" type="submit" disabled={loading}>
                  {loading
                    ? isSignup
                      ? 'Creating account…'
                      : 'Signing in…'
                    : isSignup
                      ? 'Create account'
                      : 'Sign in'}
                </button>
              </>
            )}
          </form>
        </section>
      </main>
    </div>
  )
}

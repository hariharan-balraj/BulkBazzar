import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { api } from '../api.js'
import { useAuth } from '../App.jsx'

export default function LoginPage() {
  const navigate = useNavigate()
  const { login } = useAuth()
  const [step, setStep] = useState('phone')
  const [phone, setPhone] = useState('')
  const [otp, setOtp] = useState('')
  const [devOtp, setDevOtp] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleRequestOtp(e) {
    e.preventDefault()
    setError('')
    const cleaned = phone.replace(/\D/g, '')
    if (cleaned.length < 10) { setError('Enter a valid 10-digit mobile number'); return }
    setLoading(true)
    try {
      const res = await api.requestOtp(cleaned)
      const dev = res.otp_dev || ''
      setDevOtp(dev)
      setOtp(dev)
      setStep('otp')
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  async function handleVerifyOtp(e) {
    e.preventDefault()
    setError('')
    if (otp.length !== 6) { setError('Enter the 6-digit OTP'); return }
    setLoading(true)
    try {
      const cleaned = phone.replace(/\D/g, '')
      const res = await api.verifyOtp(cleaned, otp)
      if (res.is_new_user) {
        localStorage.setItem('sdm_token', res.token)
        navigate('/role-select')
      } else {
        login(res.token, res.user)
        navigate(res.user.role === 'seller' ? '/dashboard' : '/feed')
      }
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-page">
      {/* Left visual panel */}
      <div className="auth-visual">
        <div className="auth-visual-inner">
          <div className="auth-logo">Bulk<span>Bazaar</span></div>
          <div className="auth-tagline">
            Buy Bulk Direct from <span>Farms &amp; Factories</span>
          </div>
          <div className="auth-desc">
            Tamil Nadu's B2B bulk marketplace — connect directly with farms,
            factories and wholesalers. No middlemen, no commission, no hassle.
          </div>
          <div className="auth-features">
            <div className="auth-feature">
              <div className="auth-feature-icon">🌾</div>
              Fresh produce directly from 500+ farms
            </div>
            <div className="auth-feature">
              <div className="auth-feature-icon">💬</div>
              Contact sellers on WhatsApp instantly
            </div>
            <div className="auth-feature">
              <div className="auth-feature-icon">📊</div>
              Compare bulk prices &amp; availability
            </div>
            <div className="auth-feature">
              <div className="auth-feature-icon">🆓</div>
              Zero commission — always free to browse
            </div>
          </div>
        </div>
      </div>

      {/* Right form panel */}
      <div className="auth-form-side">
        <div className="auth-form-wrap">
          {step === 'phone' ? (
            <>
              <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--primary)', marginBottom: 8 }}>
                bulkbazaar.in
              </div>
              <div className="auth-form-title">Welcome to BulkBazaar 👋</div>
              <div className="auth-form-sub">Sign in with your mobile number to continue.</div>

              {error && (
                <div className="error-msg" style={{ fontSize: 14, fontWeight: 500 }}>
                  ⚠️ {error}
                </div>
              )}

              <form onSubmit={handleRequestOtp} noValidate>
                <div className="form-group">
                  <label className="form-label">Mobile Number</label>
                  <input
                    className="form-input"
                    type="tel"
                    inputMode="numeric"
                    placeholder="e.g. 9876543210"
                    value={phone}
                    onChange={e => setPhone(e.target.value)}
                    maxLength={12}
                    autoFocus
                    autoComplete="tel"
                  />
                  <div className="form-hint">Enter your 10-digit Indian mobile number</div>
                </div>
                <button className="btn btn-primary btn-block btn-lg" type="submit" disabled={loading}>
                  {loading ? 'Sending OTP…' : 'Get OTP →'}
                </button>
              </form>

              <div style={{ textAlign: 'center', marginTop: 24, fontSize: 13, color: 'var(--text-muted)', lineHeight: 1.6 }}>
                New user? You'll be asked to set up your profile after login.<br />
                <span style={{ color: 'var(--primary)', fontWeight: 500 }}>No password needed — OTP login only.</span>
              </div>
            </>
          ) : (
            <>
              <div className="auth-form-title">Enter OTP 🔐</div>
              <div className="auth-form-sub">Sent to +91 {phone}</div>

              {devOtp && (
                <div className="otp-dev-banner">
                  <div className="otp-dev-banner-title">Dev Mode — Your OTP</div>
                  <div className="otp-dev-banner-otp">{devOtp}</div>
                  <div className="otp-dev-banner-hint">Auto-filled below. In production this arrives via SMS.</div>
                </div>
              )}

              {error && (
                <div className="error-msg" style={{ fontSize: 14, fontWeight: 500 }}>
                  ⚠️ {error}
                </div>
              )}

              <form onSubmit={handleVerifyOtp} noValidate>
                <div className="form-group">
                  <label className="form-label">6-Digit OTP</label>
                  <input
                    className="form-input"
                    type="number"
                    inputMode="numeric"
                    placeholder="Enter OTP"
                    value={otp}
                    onChange={e => setOtp(e.target.value.slice(0, 6))}
                    style={{ fontSize: 22, letterSpacing: 8, textAlign: 'center', fontWeight: 700 }}
                    autoFocus
                  />
                </div>
                <button className="btn btn-primary btn-block btn-lg" type="submit" disabled={loading}>
                  {loading ? 'Verifying…' : 'Verify & Login →'}
                </button>
                <button
                  type="button"
                  className="btn btn-ghost btn-block mt-8"
                  onClick={() => { setStep('phone'); setOtp(''); setDevOtp(''); setError('') }}
                >
                  ← Change number
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

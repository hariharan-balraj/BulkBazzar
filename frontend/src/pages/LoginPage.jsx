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
    e.preventDefault(); setError('')
    const cleaned = phone.replace(/\D/g, '')
    if (cleaned.length < 10) { setError('Enter a valid 10-digit mobile number'); return }
    setLoading(true)
    try {
      const res = await api.requestOtp(cleaned)
      const dev = res.otp_dev || ''
      setDevOtp(dev); setOtp(dev); setStep('otp')
    } catch (err) { setError(err.message) }
    finally { setLoading(false) }
  }

  async function handleVerifyOtp(e) {
    e.preventDefault(); setError('')
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
    } catch (err) { setError(err.message) }
    finally { setLoading(false) }
  }

  return (
    <div className="auth-page">
      {/* Left panel */}
      <div className="auth-visual">
        <div className="auth-logo">Bulk<span>Bazaar</span></div>
        <h2 style={{ fontSize: 28, fontWeight: 800, marginBottom: 12, lineHeight: 1.2 }}>
          Buy Bulk Direct from<br />
          <span style={{ color: '#4ade80' }}>Farms & Factories</span>
        </h2>
        <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: 14, marginBottom: 32, lineHeight: 1.6 }}>
          Tamil Nadu's B2B bulk marketplace — connect directly with farms, factories and wholesalers. No middlemen, no commission.
        </p>
        <div>
          {[
            { icon: '🌾', text: 'Fresh produce from 500+ farms' },
            { icon: '💬', text: 'Contact sellers on WhatsApp instantly' },
            { icon: '📊', text: 'Compare bulk prices & availability' },
            { icon: '🆓', text: 'Zero commission — always free to browse' },
          ].map((f, i) => (
            <div key={i} className="auth-feature">
              <div className="auth-feature-icon">{f.icon}</div>
              {f.text}
            </div>
          ))}
        </div>
      </div>

      {/* Right form */}
      <div className="auth-form-side">
        <div className="auth-form-wrap">
          {step === 'phone' ? (
            <>
              <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--bb-green)', marginBottom: 8, textTransform: 'uppercase', letterSpacing: 1 }}>
                bulkbazaar.in
              </div>
              <h4 className="fw-bold mb-1" style={{ color: 'var(--bb-dark)' }}>Welcome to BulkBazaar</h4>
              <p className="text-muted mb-4" style={{ fontSize: 14 }}>Sign in with your mobile number to continue.</p>

              {error && <div className="error-msg-bb">⚠️ {error}</div>}

              <form onSubmit={handleRequestOtp} noValidate>
                <div className="mb-3">
                  <label className="form-label fw-semibold" style={{ fontSize: 13 }}>Mobile Number</label>
                  <input
                    className="form-control form-control-lg"
                    type="tel"
                    inputMode="numeric"
                    placeholder="e.g. 9876543210"
                    value={phone}
                    onChange={e => setPhone(e.target.value)}
                    maxLength={12}
                    autoFocus
                  />
                  <div className="form-text">Enter your 10-digit Indian mobile number</div>
                </div>
                <button className="btn btn-primary btn-lg w-100" type="submit" disabled={loading}>
                  {loading ? 'Sending OTP…' : 'Get OTP →'}
                </button>
              </form>

              <p className="text-center text-muted mt-4" style={{ fontSize: 13, lineHeight: 1.6 }}>
                New user? You'll be asked to set up your profile after login.<br />
                <span style={{ color: 'var(--bb-green)', fontWeight: 600 }}>No password needed — OTP login only.</span>
              </p>
            </>
          ) : (
            <>
              <h4 className="fw-bold mb-1" style={{ color: 'var(--bb-dark)' }}>Enter OTP</h4>
              <p className="text-muted mb-3" style={{ fontSize: 14 }}>Sent to +91 {phone}</p>

              {devOtp && (
                <div className="otp-dev-banner">
                  <div style={{ fontSize: 11, fontWeight: 700, color: '#92400e', marginBottom: 4 }}>Dev Mode — Your OTP</div>
                  <div className="otp-dev-otp">{devOtp}</div>
                  <div style={{ fontSize: 11, color: '#92400e' }}>Auto-filled. In production this arrives via SMS.</div>
                </div>
              )}

              {error && <div className="error-msg-bb">⚠️ {error}</div>}

              <form onSubmit={handleVerifyOtp} noValidate>
                <div className="mb-3">
                  <label className="form-label fw-semibold" style={{ fontSize: 13 }}>6-Digit OTP</label>
                  <input
                    className="form-control form-control-lg text-center fw-bold"
                    type="number"
                    inputMode="numeric"
                    placeholder="000000"
                    value={otp}
                    onChange={e => setOtp(e.target.value.slice(0, 6))}
                    style={{ fontSize: 24, letterSpacing: 8 }}
                    autoFocus
                  />
                </div>
                <button className="btn btn-primary btn-lg w-100 mb-2" type="submit" disabled={loading}>
                  {loading ? 'Verifying…' : 'Verify & Login →'}
                </button>
                <button
                  type="button"
                  className="btn btn-outline-secondary w-100"
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

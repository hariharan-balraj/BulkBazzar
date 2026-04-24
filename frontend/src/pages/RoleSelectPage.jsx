import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { api } from '../api.js'
import { useAuth } from '../App.jsx'

export default function RoleSelectPage() {
  const navigate = useNavigate()
  const { login } = useAuth()
  const [role, setRole] = useState('')
  const [name, setName] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleContinue() {
    if (!role) { setError('Please select a role'); return }
    if (!name.trim()) { setError('Please enter your name'); return }
    setError(''); setLoading(true)
    try {
      await api.updateMe({ name: name.trim(), role })
      const me = await api.getMe()
      const token = localStorage.getItem('sdm_token')
      login(token, me)
      navigate(role === 'seller' ? '/dashboard' : '/feed')
    } catch (err) { setError(err.message) }
    finally { setLoading(false) }
  }

  return (
    <div className="role-page-bb">
      <div className="role-select-wrap">
        <div className="text-center mb-4">
          <div style={{ fontSize: 36, marginBottom: 10 }}>🎉</div>
          <h4 className="fw-bold mb-1" style={{ color: 'var(--bb-dark)' }}>Welcome to BulkBazaar!</h4>
          <p className="text-muted" style={{ fontSize: 14 }}>Tell us a bit about yourself to get started.</p>
        </div>

        {error && <div className="error-msg-bb">⚠️ {error}</div>}

        <div className="mb-4">
          <label className="form-label fw-semibold" style={{ fontSize: 13 }}>Your Full Name</label>
          <input
            className="form-control"
            type="text"
            placeholder="e.g. Rajan Kumar"
            value={name}
            onChange={e => setName(e.target.value)}
            autoFocus
          />
        </div>

        <div className="form-label fw-semibold mb-3" style={{ fontSize: 13 }}>I want to…</div>

        <div className={`role-card-bb ${role === 'buyer' ? 'selected' : ''}`} onClick={() => setRole('buyer')}>
          <div className="role-icon-bb">🛒</div>
          <div>
            <div className="fw-bold mb-1" style={{ fontSize: 15 }}>Buy / Source Products</div>
            <div className="text-muted" style={{ fontSize: 13, lineHeight: 1.5 }}>
              Browse listings, compare prices, and contact sellers directly. No charges for buyers.
            </div>
          </div>
        </div>

        <div className={`role-card-bb ${role === 'seller' ? 'selected' : ''}`} onClick={() => setRole('seller')}>
          <div className="role-icon-bb">🏪</div>
          <div>
            <div className="fw-bold mb-1" style={{ fontSize: 15 }}>Sell / List My Products</div>
            <div className="text-muted" style={{ fontSize: 13, lineHeight: 1.5 }}>
              Create listings with photos, price and availability. Get direct leads from bulk buyers across Tamil Nadu.
            </div>
          </div>
        </div>

        <button
          className="btn btn-primary btn-lg w-100 mt-2"
          onClick={handleContinue}
          disabled={loading || !role}
        >
          {loading ? 'Setting up your account…' : 'Continue →'}
        </button>
      </div>
    </div>
  )
}

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
    setError('')
    setLoading(true)
    try {
      await api.updateMe({ name: name.trim(), role })
      const me = await api.getMe()
      const token = localStorage.getItem('sdm_token')
      login(token, me)
      navigate(role === 'seller' ? '/dashboard' : '/feed')
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="role-page">
      <div className="role-card-wrap">
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{ fontSize: 36, marginBottom: 12 }}>🎉</div>
          <div style={{ fontSize: 24, fontWeight: 800, color: 'var(--dark)', marginBottom: 6 }}>
            Welcome to BulkBazaar!
          </div>
          <div style={{ fontSize: 14, color: 'var(--text-muted)' }}>
            Tell us a bit about yourself to get started.
          </div>
        </div>

        {error && <div className="error-msg">{error}</div>}

        <div className="form-group" style={{ marginBottom: 24 }}>
          <label className="form-label">Your Full Name</label>
          <input
            className="form-input"
            type="text"
            placeholder="e.g. Rajan Kumar"
            value={name}
            onChange={e => setName(e.target.value)}
            autoFocus
          />
        </div>

        <div className="form-label" style={{ marginBottom: 12 }}>I want to…</div>

        <div className={`role-card ${role === 'buyer' ? 'selected' : ''}`} onClick={() => setRole('buyer')}>
          <div className="role-card-icon">🛒</div>
          <div>
            <div className="role-card-title">Buy / Source Products</div>
            <div className="role-card-desc">
              Browse listings, compare prices, and contact sellers directly.
              No charges for buyers.
            </div>
          </div>
        </div>

        <div className={`role-card ${role === 'seller' ? 'selected' : ''}`} onClick={() => setRole('seller')}>
          <div className="role-card-icon">🏪</div>
          <div>
            <div className="role-card-title">Sell / List My Products</div>
            <div className="role-card-desc">
              Create listings with photos, price and availability. Get direct
              leads from bulk buyers across Tamil Nadu.
            </div>
          </div>
        </div>

        <button
          className="btn btn-primary btn-block btn-lg"
          style={{ marginTop: 8 }}
          onClick={handleContinue}
          disabled={loading || !role}
        >
          {loading ? 'Setting up your account…' : 'Continue →'}
        </button>
      </div>
    </div>
  )
}

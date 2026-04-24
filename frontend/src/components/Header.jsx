import React from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../App.jsx'

export default function Header() {
  const navigate = useNavigate()
  const location = useLocation()
  const { user, logout } = useAuth()

  function handleLogout() {
    logout()
    navigate('/login')
  }

  const isSeller = user?.role === 'seller'
  const isVerified = user?.subscription_status === 'verified'

  return (
    <nav className="nav">
      <div className="container nav-inner">
        <div className="nav-logo" style={{ cursor: 'pointer' }} onClick={() => navigate(user ? (isSeller ? '/dashboard' : '/feed') : '/feed')}>
          Bulk<span>Bazaar</span>
        </div>

        <div className="nav-links">
          <button className={`nav-link ${location.pathname === '/feed' ? 'active' : ''}`} onClick={() => navigate('/feed')}>
            Browse
          </button>
          {isSeller && (
            <>
              <button className={`nav-link ${location.pathname === '/dashboard' ? 'active' : ''}`} onClick={() => navigate('/dashboard')}>
                My Listings
              </button>
              <button className={`nav-link ${location.pathname === '/create' ? 'active' : ''}`} onClick={() => navigate('/create')}>
                + Add Listing
              </button>
            </>
          )}
          <button className={`nav-link ${location.pathname === '/pricing' ? 'active' : ''}`} onClick={() => navigate('/pricing')}>
            Pricing
          </button>
        </div>

        <div className="nav-actions">
          {user && (
            <span className="nav-user" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              Hi, {user.name?.split(' ')[0] || 'User'}
              {isVerified && <span className="verified-badge">✓ Verified</span>}
            </span>
          )}
          {isSeller && (
            <button className="nav-btn nav-btn-accent" onClick={() => navigate('/create')}>
              + New Listing
            </button>
          )}
          {user && (
            <button className="nav-btn nav-btn-outline" onClick={handleLogout}>
              Logout
            </button>
          )}
          {!user && (
            <button className="nav-btn nav-btn-primary" onClick={() => navigate('/login')}>
              Login
            </button>
          )}
        </div>
      </div>
    </nav>
  )
}

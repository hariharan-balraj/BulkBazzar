import React from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../App.jsx'

export default function Header() {
  const navigate = useNavigate()
  const location = useLocation()
  const { user, logout } = useAuth()

  const isSeller = user?.role === 'seller'

  function handleLogout() {
    logout()
    navigate('/login')
  }

  const home = user ? (isSeller ? '/dashboard' : '/feed') : '/feed'

  return (
    <nav className="bb-navbar navbar navbar-expand-lg sticky-top">
      <div className="container">
        <span className="navbar-brand" onClick={() => navigate(home)}>
          Bulk<span className="accent">Bazaar</span>
        </span>

        <button
          className="navbar-toggler border-0"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#bbNav"
        >
          <span className="navbar-toggler-icon" />
        </button>

        <div className="collapse navbar-collapse" id="bbNav">
          <div className="me-auto d-flex flex-column flex-lg-row gap-1 mt-2 mt-lg-0">
            <button className={`nav-link-btn ${location.pathname === '/feed' ? 'active' : ''}`} onClick={() => navigate('/feed')}>
              Browse
            </button>
            {isSeller && (
              <>
                <button className={`nav-link-btn ${location.pathname === '/dashboard' ? 'active' : ''}`} onClick={() => navigate('/dashboard')}>
                  My Listings
                </button>
                <button className={`nav-link-btn ${location.pathname === '/create' ? 'active' : ''}`} onClick={() => navigate('/create')}>
                  + Add Listing
                </button>
              </>
            )}
          </div>

          <div className="d-flex align-items-center gap-2 mt-2 mt-lg-0">
            {user && (
              <span className="text-muted me-1" style={{ fontSize: 14 }}>
                Hi, {user.name?.split(' ')[0] || 'User'}
              </span>
            )}
            {isSeller && (
              <button className="btn btn-primary btn-sm" onClick={() => navigate('/create')}>
                + New Listing
              </button>
            )}
            {user ? (
              <button className="btn btn-outline-secondary btn-sm" onClick={handleLogout}>Logout</button>
            ) : (
              <button className="btn btn-primary btn-sm" onClick={() => navigate('/login')}>Login</button>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}

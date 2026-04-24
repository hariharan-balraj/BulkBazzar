import React from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../App.jsx'

export default function BottomNav() {
  const { user } = useAuth()
  const isSeller = user?.role === 'seller'

  if (isSeller) {
    return (
      <nav className="bottom-nav">
        <NavLink to="/dashboard" className={({ isActive }) => `bottom-nav-item ${isActive ? 'active' : ''}`}>
          <span className="bottom-nav-icon">📊</span>
          Dashboard
        </NavLink>
        <NavLink to="/create" className={({ isActive }) => `bottom-nav-item ${isActive ? 'active' : ''}`}>
          <span className="bottom-nav-icon">➕</span>
          Add Listing
        </NavLink>
        <NavLink to="/feed" className={({ isActive }) => `bottom-nav-item ${isActive ? 'active' : ''}`}>
          <span className="bottom-nav-icon">🌐</span>
          Browse
        </NavLink>
      </nav>
    )
  }

  return (
    <nav className="bottom-nav">
      <NavLink to="/feed" className={({ isActive }) => `bottom-nav-item ${isActive ? 'active' : ''}`}>
        <span className="bottom-nav-icon">🏠</span>
        Discover
      </NavLink>
    </nav>
  )
}

import React, { createContext, useContext, useState, useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { api } from './api.js'
import LoginPage from './pages/LoginPage.jsx'
import RoleSelectPage from './pages/RoleSelectPage.jsx'
import FeedPage from './pages/FeedPage.jsx'
import ListingDetailPage from './pages/ListingDetailPage.jsx'
import CreateListingPage from './pages/CreateListingPage.jsx'
import DashboardPage from './pages/DashboardPage.jsx'
import PricingPage from './pages/PricingPage.jsx'

export const AuthContext = createContext(null)
export const useAuth = () => useContext(AuthContext)

function ProtectedRoute({ children, sellerOnly = false }) {
  const { user, loading } = useAuth()
  if (loading) return <div className="loading-screen"><div className="spinner" /></div>
  if (!user) return <Navigate to="/login" replace />
  if (sellerOnly && user.role !== 'seller') return <Navigate to="/feed" replace />
  return children
}

export default function App() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem('sdm_token')
    if (!token) { setLoading(false); return }
    api.getMe()
      .then(u => setUser(u))
      .catch(() => localStorage.removeItem('sdm_token'))
      .finally(() => setLoading(false))
  }, [])

  function login(token, userData) {
    localStorage.setItem('sdm_token', token)
    setUser(userData)
  }

  function logout() {
    localStorage.removeItem('sdm_token')
    setUser(null)
  }

  if (loading) return <div className="loading-screen"><div className="spinner" /></div>

  return (
    <AuthContext.Provider value={{ user, setUser, login, logout, loading }}>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/role-select" element={<RoleSelectPage />} />
          <Route path="/feed" element={<ProtectedRoute><FeedPage /></ProtectedRoute>} />
          <Route path="/listing/:id" element={<ProtectedRoute><ListingDetailPage /></ProtectedRoute>} />
          <Route path="/create" element={<ProtectedRoute sellerOnly><CreateListingPage /></ProtectedRoute>} />
          <Route path="/dashboard" element={<ProtectedRoute sellerOnly><DashboardPage /></ProtectedRoute>} />
          <Route path="/pricing" element={<PricingPage />} />
          <Route path="*" element={<Navigate to={user ? (user.role === 'seller' ? '/dashboard' : '/feed') : '/login'} replace />} />
        </Routes>
      </BrowserRouter>
    </AuthContext.Provider>
  )
}

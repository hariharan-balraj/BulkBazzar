import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { api } from '../api.js'
import { useAuth } from '../App.jsx'
import Header from '../components/Header.jsx'

const PROMO_END_LABEL = 'July 31, 2026'
const VERIFIED_FEATURES = [
  { icon: '✓', text: 'Verified badge on all your listings' },
  { icon: '📌', text: 'Priority placement in search results' },
  { icon: '∞', text: 'Unlimited listings (Free: up to 5)' },
  { icon: '📊', text: 'Advanced analytics — views & contacts' },
  { icon: '🏷️', text: 'Verified Supplier tag for buyer trust' },
  { icon: '🎯', text: 'Priority customer support' },
]

export default function DashboardPage() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [listings, setListings] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.getMyListings()
      .then(setListings)
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const totalViews = listings.reduce((s, l) => s + (l.view_count || 0), 0)
  const totalContacts = listings.reduce((s, l) => s + (l.contact_count || 0), 0)
  const isVerified = user?.subscription_status === 'verified'

  async function handleDelete(id, e) {
    e.stopPropagation()
    if (!confirm('Delete this listing?')) return
    try {
      await api.deleteListing(id)
      setListings(prev => prev.filter(l => l.id !== id))
    } catch (err) {
      alert('Delete failed: ' + err.message)
    }
  }

  return (
    <>
      <Header />
      <div className="dashboard-page">
        <div className="container">
          <div className="dash-header">
            <div>
              <div className="dash-title">Seller Dashboard</div>
              <div style={{ fontSize: 14, color: 'var(--text-muted)', marginTop: 4 }}>
                Welcome back, {user?.name || 'Seller'}
              </div>
            </div>
            <button className="btn btn-accent" onClick={() => navigate('/create')}>
              + New Listing
            </button>
          </div>

          {/* Premium Plan Section */}
          <div className="dash-premium">
            <div className="dash-premium-header">
              <div>
                <div className="dash-premium-badge">
                  {isVerified ? '✓ Verified Plan — Active' : '⭐ Verified Plan Available'}
                </div>
                <div className="dash-premium-title">
                  {isVerified ? 'You are a Verified Seller' : 'Get Verified — Build Buyer Trust'}
                </div>
                <div className="dash-premium-sub">
                  {isVerified
                    ? `Enjoy all Verified features free until ${PROMO_END_LABEL} — our 3-month launch offer.`
                    : `Get your Verified badge free during our launch offer — valid until ${PROMO_END_LABEL}.`}
                </div>
              </div>
              <div className="dash-premium-price">
                <div className="dash-premium-price-orig">₹49/month after offer</div>
                <div className="dash-premium-price-val">FREE</div>
                <div className="dash-premium-price-note">Until {PROMO_END_LABEL}</div>
              </div>
            </div>
            <div className="dash-premium-body">
              <div className="dash-premium-features">
                {VERIFIED_FEATURES.map((f, i) => (
                  <div key={i} className="dash-premium-feature">
                    <span style={{ fontWeight: 700, flexShrink: 0 }}>{f.icon}</span>
                    {f.text}
                  </div>
                ))}
              </div>
              <div className="dash-premium-footer">
                <div className="dash-premium-footer-note">
                  After {PROMO_END_LABEL}: Verified Plan at ₹49/month — cancel anytime.
                </div>
                <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                  <button className="btn btn-purple-outline btn-sm" onClick={() => navigate('/pricing')}>
                    View All Plans
                  </button>
                  {!isVerified && (
                    <button className="btn btn-purple btn-sm" onClick={() => navigate('/pricing')}>
                      Get Verified Free
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="dash-stats">
            <div className="stat-card">
              <div className="stat-card-num">{listings.length}</div>
              <div className="stat-card-label">Active Listings</div>
            </div>
            <div className="stat-card">
              <div className="stat-card-num">{totalViews}</div>
              <div className="stat-card-label">Total Views</div>
            </div>
            <div className="stat-card stat-card-accent">
              <div className="stat-card-num">{totalContacts}</div>
              <div className="stat-card-label">Contact Requests</div>
            </div>
            <div className="stat-card">
              <div className="stat-card-num" style={{ fontSize: 18, color: '#7c3aed' }}>
                {isVerified ? 'Verified' : 'Free'}
              </div>
              <div className="stat-card-label">Current Plan</div>
            </div>
          </div>

          {loading ? (
            <div className="loading-screen"><div className="spinner" /></div>
          ) : listings.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-icon">📋</div>
              <div className="empty-state-title">No listings yet</div>
              <div className="empty-state-desc">Create your first product listing to start receiving buyer leads.</div>
              <button className="btn btn-primary mt-16" onClick={() => navigate('/create')}>
                + Create First Listing
              </button>
            </div>
          ) : (
            <div className="listings-table">
              <div className="listings-table-header">
                <div>Photo</div>
                <div>Product</div>
                <div>Price</div>
                <div>Views</div>
                <div>Contacts</div>
                <div>Actions</div>
              </div>
              {listings.map(l => {
                const img = l.media_urls?.[0]
                return (
                  <div key={l.id} className="listings-table-row" style={{ cursor: 'pointer' }} onClick={() => navigate(`/listing/${l.id}`)}>
                    {img ? (
                      <img src={img} className="table-thumb" alt={l.title} />
                    ) : (
                      <div className="table-thumb" style={{ background: 'var(--primary-pale)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20 }}>
                        📦
                      </div>
                    )}
                    <div>
                      <div className="table-title" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        {l.title}
                        {isVerified && <span className="verified-badge" style={{ fontSize: 10 }}>✓</span>}
                      </div>
                      <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>
                        {l.location_name || l.category}
                      </div>
                    </div>
                    <div className="table-price">₹{l.price.toLocaleString('en-IN')} / {l.unit}</div>
                    <div className="table-num">👁 {l.view_count || 0}</div>
                    <div className="table-num">📞 {l.contact_count || 0}</div>
                    <div className="table-actions" onClick={e => e.stopPropagation()}>
                      <button className="btn btn-secondary btn-sm" onClick={() => navigate(`/listing/${l.id}`)}>View</button>
                      <button className="btn btn-danger btn-sm" onClick={e => handleDelete(l.id, e)}>Del</button>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>

      <footer className="footer">
        Bulk<strong style={{ color: 'var(--primary-light)' }}>Bazaar</strong> &copy; 2025 — Tamil Nadu's Bulk B2B Marketplace &nbsp;·&nbsp;
        <span>bulkbazaar.in</span> &nbsp;·&nbsp; 0% Commission
      </footer>
    </>
  )
}

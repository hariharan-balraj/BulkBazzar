import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { api } from '../api.js'
import { useAuth } from '../App.jsx'
import Header from '../components/Header.jsx'

const PROMO_END = 'July 31, 2026'
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
  const isVerified = user?.subscription_status === 'verified'

  useEffect(() => {
    api.getMyListings().then(setListings).catch(() => {}).finally(() => setLoading(false))
  }, [])

  const totalViews = listings.reduce((s, l) => s + (l.view_count || 0), 0)
  const totalContacts = listings.reduce((s, l) => s + (l.contact_count || 0), 0)

  async function handleDelete(id, e) {
    e.stopPropagation()
    if (!confirm('Delete this listing?')) return
    try {
      await api.deleteListing(id)
      setListings(prev => prev.filter(l => l.id !== id))
    } catch (err) { alert('Delete failed: ' + err.message) }
  }

  return (
    <>
      <Header />
      <div style={{ background: 'var(--bb-bg)', minHeight: '100vh', paddingBottom: 48 }}>
        <div className="container py-4">
          {/* Page header */}
          <div className="d-flex justify-content-between align-items-center mb-4">
            <div>
              <h4 className="fw-bold mb-0" style={{ color: 'var(--bb-dark)' }}>Seller Dashboard</h4>
              <div className="text-muted" style={{ fontSize: 14 }}>Welcome back, {user?.name || 'Seller'}</div>
            </div>
            <button className="btn btn-primary" onClick={() => navigate('/create')}>+ New Listing</button>
          </div>

          {/* Premium card */}
          <div className="dash-premium-card mb-4">
            <div className="d-flex justify-content-between align-items-start flex-wrap gap-3">
              <div>
                <div className="dash-premium-badge">
                  {isVerified ? '✓ Verified Plan — Active' : '⭐ Verified Plan Available'}
                </div>
                <h5 className="fw-bold mt-2 mb-1" style={{ color: 'white' }}>
                  {isVerified ? 'You are a Verified Seller' : 'Get Verified — Build Buyer Trust'}
                </h5>
                <p style={{ color: 'rgba(255,255,255,0.75)', fontSize: 13, margin: 0 }}>
                  {isVerified
                    ? `Enjoy all Verified features free until ${PROMO_END} — our 3-month launch offer.`
                    : `Get your Verified badge free during our launch offer — valid until ${PROMO_END}.`}
                </p>
                <div className="d-flex flex-wrap gap-3 mt-3">
                  {VERIFIED_FEATURES.map((f, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: 'rgba(255,255,255,0.85)' }}>
                      <span>{f.icon}</span> {f.text}
                    </div>
                  ))}
                </div>
              </div>
              <div className="text-center">
                <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.6)', textDecoration: 'line-through' }}>₹49/month after offer</div>
                <div style={{ fontSize: 36, fontWeight: 800, lineHeight: 1 }}>FREE</div>
                <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.7)' }}>Until {PROMO_END}</div>
                <div className="d-flex gap-2 mt-3 justify-content-center">
                  <button className="btn btn-outline-light btn-sm" onClick={() => navigate('/pricing')}>View Plans</button>
                  {!isVerified && <button className="btn btn-light btn-sm text-purple" onClick={() => navigate('/pricing')}>Get Verified Free</button>}
                </div>
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="row g-3 mb-4">
            {[
              { num: listings.length, lbl: 'Active Listings', color: 'var(--bb-dark)' },
              { num: totalViews, lbl: 'Total Views', color: 'var(--bb-dark)' },
              { num: totalContacts, lbl: 'Contact Requests', color: 'var(--bb-green)' },
              { num: isVerified ? 'Verified' : 'Free', lbl: 'Current Plan', color: isVerified ? 'var(--bb-purple)' : 'var(--bb-muted)' },
            ].map((s, i) => (
              <div key={i} className="col-6 col-md-3">
                <div className="stat-card-bb">
                  <div className="num" style={{ color: s.color }}>{s.num}</div>
                  <div className="lbl">{s.lbl}</div>
                </div>
              </div>
            ))}
          </div>

          {/* Listings table */}
          {loading ? (
            <div className="bb-spinner"><div className="spin" /></div>
          ) : listings.length === 0 ? (
            <div className="empty-state-bb">
              <div className="empty-icon">📋</div>
              <div className="fw-bold mb-1" style={{ fontSize: 17 }}>No listings yet</div>
              <div className="text-muted mb-3" style={{ fontSize: 14 }}>Create your first product listing to start receiving buyer leads.</div>
              <button className="btn btn-primary" onClick={() => navigate('/create')}>+ Create First Listing</button>
            </div>
          ) : (
            <div className="listings-table-bb">
              <div className="listings-row listings-row-head">
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
                  <div key={l.id} className="listings-row" onClick={() => navigate(`/listing/${l.id}`)}>
                    {img ? (
                      <img src={img} className="table-thumb-bb" alt={l.title} />
                    ) : (
                      <div className="table-thumb-bb bg-light d-flex align-items-center justify-content-center" style={{ fontSize: 20 }}>📦</div>
                    )}
                    <div>
                      <div className="fw-semibold d-flex align-items-center gap-2" style={{ fontSize: 13 }}>
                        {l.title}
                        {isVerified && <span className="badge-verified" style={{ fontSize: 9 }}>✓</span>}
                      </div>
                      <div className="text-muted" style={{ fontSize: 12 }}>{l.location_name || l.category}</div>
                    </div>
                    <div className="fw-semibold text-primary" style={{ fontSize: 13 }}>₹{l.price.toLocaleString('en-IN')} / {l.unit}</div>
                    <div className="text-muted" style={{ fontSize: 13 }}>👁 {l.view_count || 0}</div>
                    <div className="text-muted" style={{ fontSize: 13 }}>📞 {l.contact_count || 0}</div>
                    <div className="d-flex gap-1" onClick={e => e.stopPropagation()}>
                      <button className="btn btn-outline-secondary btn-sm" style={{ fontSize: 11 }} onClick={() => navigate(`/listing/${l.id}`)}>View</button>
                      <button className="btn btn-outline-danger btn-sm" style={{ fontSize: 11 }} onClick={e => handleDelete(l.id, e)}>Del</button>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>

      <footer className="bb-footer">
        Bulk<span className="accent fw-bold">Bazaar</span> &copy; 2025 &nbsp;·&nbsp; bulkbazaar.in &nbsp;·&nbsp; 0% Commission
      </footer>
    </>
  )
}

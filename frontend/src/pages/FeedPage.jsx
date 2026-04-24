import React, { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { api } from '../api.js'
import { useAuth } from '../App.jsx'
import Header from '../components/Header.jsx'
import ListingCard from '../components/ListingCard.jsx'
import { getContactStats, isPromoActive, FREE_CONTACTS } from '../contactTracker.js'

const CATEGORIES = [
  { id: 'all', label: 'All Products', emoji: '🌐', img: 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=600&h=400&fit=crop', desc: 'Browse everything' },
  { id: 'agriculture', label: 'Agriculture', emoji: '🌾', img: 'https://images.unsplash.com/photo-1500595046743-cd271d694d30?w=600&h=400&fit=crop', desc: 'Vegetables, Fruits, Grains' },
  { id: 'livestock', label: 'Livestock & Food', emoji: '🐄', img: 'https://images.unsplash.com/photo-1488459716781-31db52582fe9?w=600&h=400&fit=crop', desc: 'Poultry, Fish, Dairy, Meat' },
  { id: 'textile', label: 'Textile', emoji: '🧵', img: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&h=400&fit=crop', desc: 'Fabrics, Garments, Uniforms' },
  { id: 'manufacturing', label: 'Manufacturing', emoji: '🏭', img: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=600&h=400&fit=crop', desc: 'Building Materials, Equipment' },
  { id: 'spices', label: 'Food & Spices', emoji: '🌶️', img: 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=600&h=400&fit=crop', desc: 'Masalas, Oils, Condiments' },
  { id: 'construction', label: 'Construction', emoji: '🏗️', img: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=600&h=400&fit=crop', desc: 'Blocks, Sand, Stone, Steel' },
  { id: 'electrical', label: 'Electrical', emoji: '⚡', img: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=600&h=400&fit=crop', desc: 'Solar, Motors, LEDs, CCTV' },
  { id: 'handicrafts', label: 'Handicrafts', emoji: '🪴', img: 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?w=600&h=400&fit=crop', desc: 'Art, Brass, Pottery, Candles' },
  { id: 'healthcare', label: 'Healthcare', emoji: '💊', img: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=600&h=400&fit=crop', desc: 'Herbal, Ayurvedic, Medical' },
  { id: 'plastics', label: 'Plastics', emoji: '📦', img: 'https://images.unsplash.com/photo-1553413077-190dd305871c?w=600&h=400&fit=crop', desc: 'Bags, Bottles, Boxes, Films' },
]

const CHIPS = [
  { id: 'all', label: 'All' }, { id: 'agriculture', label: 'Agriculture' },
  { id: 'livestock', label: 'Livestock' }, { id: 'textile', label: 'Textile' },
  { id: 'manufacturing', label: 'Manufacturing' }, { id: 'spices', label: 'Food & Spices' },
  { id: 'construction', label: 'Construction' }, { id: 'electrical', label: 'Electrical' },
  { id: 'handicrafts', label: 'Handicrafts' }, { id: 'healthcare', label: 'Healthcare' },
  { id: 'plastics', label: 'Plastics' },
]

export default function FeedPage() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [category, setCategory] = useState('all')
  const [listings, setListings] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [showContactModal, setShowContactModal] = useState(false)
  const [contactCount] = useState(() => getContactStats().count)

  const fetchListings = useCallback(async (cat) => {
    setLoading(true); setError('')
    try {
      const params = cat !== 'all' ? { category: cat, limit: 40 } : { limit: 40 }
      setListings(await api.getListings(params))
    } catch {
      setError('Failed to load listings. Please check your connection.')
    } finally { setLoading(false) }
  }, [])

  useEffect(() => { fetchListings(category) }, [category, fetchListings])

  const activeCat = CATEGORIES.find(c => c.id === category) || CATEGORIES[0]
  const isBuyer = user?.role === 'buyer'
  const promoActive = isPromoActive()
  const remaining = promoActive ? Infinity : Math.max(0, FREE_CONTACTS - contactCount)

  return (
    <>
      {/* Promo bar */}
      <div className="promo-bar">
        <strong>Launch Offer:</strong> All features FREE for 3 months — Verified Seller + Unlimited Contacts — Valid till <strong>July 31, 2026</strong>
        {' '}<button onClick={() => navigate('/pricing')}>See Plans →</button>
      </div>

      <Header />

      {/* Buyer contact bar */}
      {isBuyer && (
        <div className="contact-bar">
          <div className="container">
            <div className="d-flex align-items-center justify-content-between flex-wrap gap-2">
              {promoActive ? (
                <span style={{ color: 'var(--bb-green)', fontWeight: 600 }}>
                  All seller contacts FREE during launch offer (till July 31, 2026)
                </span>
              ) : (
                <div className="d-flex align-items-center gap-2">
                  <span style={{ color: 'var(--bb-muted)' }}>Free contacts this month:</span>
                  <div className="contact-meter">
                    <div className="contact-meter-fill" style={{ width: `${Math.min(100, (contactCount / FREE_CONTACTS) * 100)}%` }} />
                  </div>
                  <span><strong>{remaining}</strong> / {FREE_CONTACTS} remaining</span>
                </div>
              )}
              <button className="btn btn-outline-primary btn-sm" onClick={() => navigate('/pricing')}>
                {promoActive ? 'View Plans' : remaining === 0 ? 'Buy More Contacts' : 'Get Unlimited'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Hero */}
      <div className="bb-hero">
        <div className="container text-center">
          <div className="hero-badge">🇮🇳 Tamil Nadu's #1 Bulk B2B Marketplace</div>
          <h1 className="mb-3">
            Buy Bulk Direct from<br />
            <span className="text-accent">Farms & Factories</span>
          </h1>
          <p className="mb-4" style={{ color: 'rgba(255,255,255,0.7)', fontSize: 16, maxWidth: 560, margin: '0 auto 24px' }}>
            Connect directly with Tamil Nadu's best farms, factories and wholesalers.
            Skip the middlemen — compare bulk prices and contact sellers instantly.
          </p>
          <div className="d-flex justify-content-center align-items-center gap-4 flex-wrap">
            <div>
              <div className="stat-num">190+</div>
              <div className="stat-label">Bulk Listings</div>
            </div>
            <div className="hero-divider" />
            <div>
              <div className="stat-num">10</div>
              <div className="stat-label">Categories</div>
            </div>
            <div className="hero-divider" />
            <div>
              <div className="stat-num">0%</div>
              <div className="stat-label">Commission</div>
            </div>
          </div>
        </div>
      </div>

      {/* Category cards */}
      <div style={{ background: 'white', borderBottom: '1px solid var(--bb-border)', padding: '28px 0' }}>
        <div className="container">
          <div className="d-flex justify-content-between align-items-center mb-3">
            <div>
              <div style={{ fontSize: 17, fontWeight: 700, color: 'var(--bb-dark)' }}>Browse by Category</div>
              <div style={{ fontSize: 13, color: 'var(--bb-muted)' }}>Select a category to filter bulk products</div>
            </div>
          </div>
          <div className="category-card-grid">
            {CATEGORIES.map(cat => (
              <div key={cat.id} className={`cat-card ${category === cat.id ? 'active' : ''}`} onClick={() => setCategory(cat.id)}>
                <img src={cat.img} alt={cat.label} loading="lazy" />
                <div className="cat-card-overlay" />
                <div className="cat-card-label">{cat.emoji} {cat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Filter chips */}
      <div style={{ background: 'white', borderBottom: '1px solid var(--bb-border)' }}>
        <div className="container">
          <div className="filter-chips-wrap">
            <div className="filter-chips">
              {CHIPS.map(c => (
                <button key={c.id} className={`chip ${category === c.id ? 'active' : ''}`} onClick={() => setCategory(c.id)}>
                  {c.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Listings */}
      <div className="container py-4">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <div>
            <div style={{ fontSize: 18, fontWeight: 700 }}>{activeCat.emoji} {activeCat.label}</div>
            <div style={{ fontSize: 13, color: 'var(--bb-muted)' }}>
              {loading ? 'Loading…' : `${listings.length} bulk listings found`}
            </div>
          </div>
        </div>

        {error && <div className="error-msg-bb">{error}</div>}

        {loading ? (
          <div className="bb-spinner"><div className="spin" /></div>
        ) : listings.length === 0 ? (
          <div className="empty-state-bb">
            <div className="empty-icon">🌱</div>
            <div style={{ fontSize: 17, fontWeight: 700, marginBottom: 6 }}>No listings in this category yet</div>
            <div style={{ fontSize: 14 }}>Be the first to list here, or check another category.</div>
          </div>
        ) : (
          <div className="listing-grid">
            {listings.map(l => (
              <ListingCard key={l.id} listing={l} onContactLimited={() => setShowContactModal(true)} />
            ))}
          </div>
        )}
      </div>

      {/* Contact limit modal */}
      {showContactModal && (
        <div className="modal d-block" style={{ background: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content border-0 rounded-4 p-4">
              <div style={{ fontSize: 36, marginBottom: 10 }}>📞</div>
              <h5 className="fw-bold mb-2">Free contacts used up</h5>
              <p className="text-muted mb-3" style={{ fontSize: 14 }}>
                You've used all {FREE_CONTACTS} free contacts this month. Choose a plan to keep reaching bulk sellers.
              </p>
              <div className="d-flex flex-column gap-2 mb-3">
                <div className="border rounded-3 p-3 cursor-pointer" onClick={() => navigate('/pricing')} style={{ cursor: 'pointer' }}>
                  <div className="fw-bold">Contact Pack — ₹100</div>
                  <div className="text-muted" style={{ fontSize: 13 }}>10 more contacts, valid 30 days</div>
                </div>
                <div className="rounded-3 p-3" style={{ border: '2px solid var(--bb-purple)', background: 'var(--bb-purple-light)', cursor: 'pointer' }} onClick={() => navigate('/pricing')}>
                  <div className="fw-bold text-purple">Unlimited — ₹199/month ⭐</div>
                  <div style={{ fontSize: 13, color: 'var(--bb-purple-dark)' }}>Contact any seller, unlimited times</div>
                </div>
              </div>
              <div className="d-flex gap-2">
                <button className="btn btn-outline-secondary flex-fill" onClick={() => setShowContactModal(false)}>Cancel</button>
                <button className="btn btn-purple flex-fill" onClick={() => { setShowContactModal(false); navigate('/pricing') }}>See Plans</button>
              </div>
            </div>
          </div>
        </div>
      )}

      <footer className="bb-footer">
        Bulk<span className="accent fw-bold">Bazaar</span> &copy; 2025 &nbsp;·&nbsp; Tamil Nadu's Bulk B2B Marketplace &nbsp;·&nbsp; bulkbazaar.in &nbsp;·&nbsp; 0% Commission
      </footer>
    </>
  )
}

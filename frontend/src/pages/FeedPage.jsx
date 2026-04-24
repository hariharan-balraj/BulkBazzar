import React, { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { api } from '../api.js'
import { useAuth } from '../App.jsx'
import Header from '../components/Header.jsx'
import ListingCard from '../components/ListingCard.jsx'
import { getContactStats, isPromoActive, FREE_CONTACTS } from '../contactTracker.js'

const CATEGORIES = [
  {
    id: 'all', label: 'All Products', emoji: '🌐',
    img: 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=600&h=400&fit=crop',
    desc: 'Browse everything',
  },
  {
    id: 'agriculture', label: 'Agriculture', emoji: '🌾',
    img: 'https://images.unsplash.com/photo-1500595046743-cd271d694d30?w=600&h=400&fit=crop',
    desc: 'Vegetables, Fruits, Grains, Flowers',
  },
  {
    id: 'livestock', label: 'Livestock & Food', emoji: '🐄',
    img: 'https://images.unsplash.com/photo-1488459716781-31db52582fe9?w=600&h=400&fit=crop',
    desc: 'Poultry, Fish, Dairy, Meat, Seafood',
  },
  {
    id: 'textile', label: 'Textile', emoji: '🧵',
    img: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&h=400&fit=crop',
    desc: 'Fabrics, Garments, Uniforms, Home Textiles',
  },
  {
    id: 'manufacturing', label: 'Manufacturing', emoji: '🏭',
    img: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=600&h=400&fit=crop&auto=format',
    desc: 'Building Materials, Industrial Goods, Equipment',
  },
  {
    id: 'spices', label: 'Food & Spices', emoji: '🌶️',
    img: 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=600&h=400&fit=crop',
    desc: 'Masalas, Oils, Jaggery, Condiments',
  },
  {
    id: 'construction', label: 'Construction', emoji: '🏗️',
    img: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=600&h=400&fit=crop',
    desc: 'Blocks, Sand, Stone, Glass, Doors, Steel',
  },
  {
    id: 'electrical', label: 'Electrical & Electronics', emoji: '⚡',
    img: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=600&h=400&fit=crop',
    desc: 'Solar, Motors, LEDs, CCTV, Cables',
  },
  {
    id: 'handicrafts', label: 'Handicrafts & Gifts', emoji: '🪴',
    img: 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?w=600&h=400&fit=crop',
    desc: 'Tanjore Art, Brass, Pottery, Candles',
  },
  {
    id: 'healthcare', label: 'Healthcare & Pharma', emoji: '💊',
    img: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=600&h=400&fit=crop',
    desc: 'Herbal, Ayurvedic, Medical Supplies',
  },
  {
    id: 'plastics', label: 'Plastics & Packaging', emoji: '📦',
    img: 'https://images.unsplash.com/photo-1553413077-190dd305871c?w=600&h=400&fit=crop',
    desc: 'Bags, Bottles, Boxes, Films, Drums',
  },
]

const FILTER_CHIPS = [
  { id: 'all', label: '🌐 All' },
  { id: 'agriculture', label: '🌾 Agriculture' },
  { id: 'livestock', label: '🐄 Livestock & Food' },
  { id: 'textile', label: '🧵 Textile' },
  { id: 'manufacturing', label: '🏭 Manufacturing' },
  { id: 'spices', label: '🌶️ Food & Spices' },
  { id: 'construction', label: '🏗️ Construction' },
  { id: 'electrical', label: '⚡ Electrical' },
  { id: 'handicrafts', label: '🪴 Handicrafts' },
  { id: 'healthcare', label: '💊 Healthcare' },
  { id: 'plastics', label: '📦 Plastics' },
]

export default function FeedPage() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [category, setCategory] = useState('all')
  const [listings, setListings] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [showContactModal, setShowContactModal] = useState(false)
  const [contactCount, setContactCount] = useState(() => getContactStats().count)

  const fetchListings = useCallback(async (cat) => {
    setLoading(true)
    setError('')
    try {
      const params = cat !== 'all' ? { category: cat, limit: 40 } : { limit: 40 }
      const data = await api.getListings(params)
      setListings(data)
    } catch {
      setError('Failed to load listings. Please check your connection.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchListings(category) }, [category, fetchListings])

  const activeCat = CATEGORIES.find(c => c.id === category) || CATEGORIES[0]
  const isBuyer = user?.role === 'buyer'
  const promoActive = isPromoActive()
  const remaining = promoActive ? Infinity : Math.max(0, FREE_CONTACTS - contactCount)

  return (
    <>
      {/* Promo Top Bar */}
      <div className="promo-topbar">
        <strong>🎉 Launch Offer:</strong> All features FREE for 3 months — Verified Seller badge + Unlimited Buyer Contacts — Valid till <strong>July 31, 2026</strong>
        {' '}
        <button className="promo-topbar-link" onClick={() => navigate('/pricing')}>See Plans →</button>
      </div>

      <Header />

      {/* Buyer contact counter bar */}
      {isBuyer && (
        <div className="contact-bar">
          <div className="container">
            <div className="contact-bar-inner">
              {promoActive ? (
                <div className="contact-bar-promo">
                  🎉 All seller contacts FREE during launch offer (till July 31, 2026)
                </div>
              ) : (
                <div className="contact-bar-track">
                  <span className="contact-bar-count">Free contacts this month:</span>
                  <div className="contact-meter">
                    <div className="contact-meter-fill" style={{ width: `${Math.min(100, (contactCount / FREE_CONTACTS) * 100)}%` }} />
                  </div>
                  <span className="contact-bar-count"><strong>{remaining}</strong> / {FREE_CONTACTS} remaining</span>
                </div>
              )}
              <button className="contact-bar-upgrade" onClick={() => navigate('/pricing')}>
                {promoActive ? 'View Plans' : remaining === 0 ? 'Buy More Contacts →' : 'Get Unlimited →'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Hero */}
      <div className="hero">
        <div className="container hero-inner">
          <div className="hero-badge">🇮🇳 Tamil Nadu's #1 Bulk B2B Marketplace</div>
          <h1 className="hero-title">
            Buy Bulk Direct from <span>Farms &amp; Factories</span>
          </h1>
          <p className="hero-sub">
            Connect directly with Tamil Nadu's best farms, factories and wholesalers.
            Skip the middlemen — compare bulk prices and contact sellers on WhatsApp instantly.
          </p>
          <div className="hero-stats">
            <div className="hero-stat">
              <div className="hero-stat-num">190+</div>
              <div className="hero-stat-label">Bulk Listings</div>
            </div>
            <div className="hero-stat">
              <div className="hero-stat-num">10</div>
              <div className="hero-stat-label">Categories</div>
            </div>
            <div className="hero-stat">
              <div className="hero-stat-num">0%</div>
              <div className="hero-stat-label">Commission</div>
            </div>
          </div>
        </div>
      </div>

      {/* Category Cards */}
      <div className="section-sm" style={{ background: 'white', borderBottom: '1px solid var(--border)' }}>
        <div className="container">
          <div className="section-header" style={{ marginBottom: 16 }}>
            <div>
              <div className="section-title">Browse by Category</div>
              <div className="section-sub" style={{ marginBottom: 0 }}>Select a category to filter bulk products</div>
            </div>
          </div>
          <div className="category-grid">
            {CATEGORIES.map(cat => (
              <div
                key={cat.id}
                className={`category-card ${category === cat.id ? 'active' : ''}`}
                onClick={() => setCategory(cat.id)}
              >
                <img src={cat.img} alt={cat.label} loading="lazy" />
                <div className="category-card-overlay" />
                <div className="category-card-body">
                  <div className="category-card-title">{cat.emoji} {cat.label}</div>
                  <div className="category-card-count">{cat.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Filter bar */}
      <div className="filter-bar">
        <div className="container">
          <div className="filter-bar-inner">
            {FILTER_CHIPS.map(chip => (
              <button
                key={chip.id}
                className={`filter-chip ${category === chip.id ? 'active' : ''}`}
                onClick={() => setCategory(chip.id)}
              >
                {chip.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Listings */}
      <div className="section">
        <div className="container">
          <div className="section-header">
            <div>
              <div className="section-title">
                {activeCat.emoji} {activeCat.label}
              </div>
              <div className="section-sub" style={{ marginBottom: 0 }}>
                {loading ? 'Loading…' : `${listings.length} bulk listings found`}
              </div>
            </div>
          </div>

          {error && <div className="error-msg">{error}</div>}

          {loading ? (
            <div className="loading-screen"><div className="spinner" /></div>
          ) : listings.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-icon">🌱</div>
              <div className="empty-state-title">No listings in this category yet</div>
              <div className="empty-state-desc">Be the first to list here, or check another category.</div>
            </div>
          ) : (
            <div className="product-grid">
              {listings.map(l => (
                <ListingCard
                  key={l.id}
                  listing={l}
                  onContactLimited={() => setShowContactModal(true)}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Contact limit modal */}
      {showContactModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
          <div style={{ background: 'white', borderRadius: 20, padding: 32, maxWidth: 420, width: '100%', boxShadow: '0 20px 60px rgba(0,0,0,0.3)' }}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>📞</div>
            <h2 style={{ fontSize: 20, fontWeight: 800, color: 'var(--dark)', marginBottom: 8 }}>Free contacts used up</h2>
            <p style={{ fontSize: 14, color: 'var(--text-muted)', marginBottom: 20, lineHeight: 1.6 }}>
              You've used all 10 free contacts this month. Choose a plan to keep reaching bulk sellers.
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 20 }}>
              <div style={{ border: '1.5px solid var(--border)', borderRadius: 12, padding: '14px 16px', cursor: 'pointer' }} onClick={() => navigate('/pricing')}>
                <div style={{ fontWeight: 700, color: 'var(--dark)' }}>Contact Pack — ₹100</div>
                <div style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 2 }}>10 more contacts, valid 30 days</div>
              </div>
              <div style={{ border: '2px solid #7c3aed', borderRadius: 12, padding: '14px 16px', cursor: 'pointer', background: '#faf5ff' }} onClick={() => navigate('/pricing')}>
                <div style={{ fontWeight: 700, color: '#7c3aed' }}>Unlimited — ₹199/month ⭐</div>
                <div style={{ fontSize: 13, color: '#6d28d9', marginTop: 2 }}>Contact any seller, unlimited times</div>
              </div>
            </div>
            <div style={{ display: 'flex', gap: 10 }}>
              <button className="btn btn-secondary" style={{ flex: 1 }} onClick={() => setShowContactModal(false)}>Cancel</button>
              <button className="btn btn-purple" style={{ flex: 1 }} onClick={() => { setShowContactModal(false); navigate('/pricing') }}>See Plans</button>
            </div>
          </div>
        </div>
      )}

      <footer className="footer">
        Bulk<strong style={{ color: 'var(--primary-light)' }}>Bazaar</strong> &copy; 2025 — Tamil Nadu's Bulk B2B Marketplace &nbsp;·&nbsp;
        <span>bulkbazaar.in</span> &nbsp;·&nbsp; 0% Commission
      </footer>
    </>
  )
}

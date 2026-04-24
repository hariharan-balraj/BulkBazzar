import React, { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { api } from '../api.js'
import { useAuth } from '../App.jsx'
import Header from '../components/Header.jsx'
import ListingCard from '../components/ListingCard.jsx'

const CATEGORIES = [
  { id: 'all', label: 'All Products', emoji: '🌐', img: 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=600&h=400&fit=crop' },
  { id: 'agriculture', label: 'Agriculture', emoji: '🌾', img: 'https://images.unsplash.com/photo-1500595046743-cd271d694d30?w=600&h=400&fit=crop' },
  { id: 'livestock', label: 'Livestock & Food', emoji: '🐄', img: 'https://images.unsplash.com/photo-1488459716781-31db52582fe9?w=600&h=400&fit=crop' },
  { id: 'textile', label: 'Textile', emoji: '🧵', img: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&h=400&fit=crop' },
  { id: 'manufacturing', label: 'Manufacturing', emoji: '🏭', img: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=600&h=400&fit=crop' },
  { id: 'spices', label: 'Food & Spices', emoji: '🌶️', img: 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=600&h=400&fit=crop' },
  { id: 'construction', label: 'Construction', emoji: '🏗️', img: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=600&h=400&fit=crop' },
  { id: 'electrical', label: 'Electrical', emoji: '⚡', img: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=600&h=400&fit=crop' },
  { id: 'handicrafts', label: 'Handicrafts', emoji: '🪴', img: 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?w=600&h=400&fit=crop' },
  { id: 'healthcare', label: 'Healthcare', emoji: '💊', img: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=600&h=400&fit=crop' },
  { id: 'plastics', label: 'Plastics', emoji: '📦', img: 'https://images.unsplash.com/photo-1553413077-190dd305871c?w=600&h=400&fit=crop' },
]

const CHIPS = [
  { id: 'all', label: 'All' }, { id: 'agriculture', label: 'Agriculture' },
  { id: 'livestock', label: 'Livestock' }, { id: 'textile', label: 'Textile' },
  { id: 'manufacturing', label: 'Manufacturing' }, { id: 'spices', label: 'Food & Spices' },
  { id: 'construction', label: 'Construction' }, { id: 'electrical', label: 'Electrical' },
  { id: 'handicrafts', label: 'Handicrafts' }, { id: 'healthcare', label: 'Healthcare' },
  { id: 'plastics', label: 'Plastics' },
]

const SELL_BENEFITS = [
  { icon: '🚀', title: 'List in 2 Minutes', desc: 'Create your product listing with photos, price and location in under 2 minutes.' },
  { icon: '📞', title: 'Direct Buyer Calls', desc: 'Buyers contact you directly via WhatsApp or phone — no middlemen, no delays.' },
  { icon: '📊', title: 'Track Your Leads', desc: 'See how many buyers viewed and contacted you from your seller dashboard.' },
  { icon: '🎬', title: 'Upload Product Video', desc: 'Show your farm, factory or product in action — builds buyer trust instantly.' },
  { icon: '0%', title: 'Zero Commission', desc: 'We charge absolutely nothing. Every rupee from the buyer goes directly to you.' },
  { icon: '🌐', title: 'Tamil Nadu Reach', desc: 'Reach buyers across all of Tamil Nadu searching for bulk products in your category.' },
]

const SELL_STEPS = [
  { step: '1', label: 'Register / Login', desc: 'Sign up with your mobile number — takes 30 seconds.' },
  { step: '2', label: 'Create Your Listing', desc: 'Add product name, category, price, photos and your location.' },
  { step: '3', label: 'Receive Buyer Leads', desc: 'Buyers will call or WhatsApp you directly from the listing page.' },
]

function SellTab({ navigate, onStartSelling }) {
  return (
    <div>
      {/* Sell Hero */}
      <div className="bb-hero" style={{ padding: '48px 0' }}>
        <div className="container text-center">
          <div className="hero-badge">🏪 For Sellers & Suppliers</div>
          <h1 className="mb-3">
            Reach Bulk Buyers Across<br />
            <span className="text-accent">Tamil Nadu — For Free</span>
          </h1>
          <p className="mb-4" style={{ color: 'rgba(255,255,255,0.75)', fontSize: 16, maxWidth: 520, margin: '0 auto 28px' }}>
            List your products once and let buyers find you. No monthly fee, no commission, no middlemen — ever.
          </p>
          <button
            className="btn btn-lg fw-bold px-5 py-3"
            style={{ background: 'white', color: 'var(--bb-green)', fontSize: 16, borderRadius: 12 }}
            onClick={onStartSelling}
          >
            🚀 Start Selling Free →
          </button>
        </div>
      </div>

      {/* Benefits */}
      <div style={{ background: 'white', padding: '48px 0' }}>
        <div className="container">
          <div className="text-center mb-4">
            <div style={{ fontSize: 20, fontWeight: 700 }}>Why Sell on BulkBazaar?</div>
            <div className="text-muted" style={{ fontSize: 14 }}>Thousands of buyers search for bulk products every day</div>
          </div>
          <div className="row g-3">
            {SELL_BENEFITS.map((b, i) => (
              <div key={i} className="col-md-4 col-6">
                <div className="p-3 rounded-3 h-100" style={{ border: '1px solid var(--bb-border)', background: 'var(--bb-bg)' }}>
                  <div style={{ fontSize: 28, marginBottom: 8 }}>{b.icon}</div>
                  <div className="fw-bold mb-1" style={{ fontSize: 14 }}>{b.title}</div>
                  <div className="text-muted" style={{ fontSize: 13 }}>{b.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* How it works */}
      <div style={{ background: 'var(--bb-bg)', padding: '48px 0' }}>
        <div className="container">
          <div className="text-center mb-4">
            <div style={{ fontSize: 20, fontWeight: 700 }}>How It Works</div>
          </div>
          <div className="row g-4 justify-content-center">
            {SELL_STEPS.map((s, i) => (
              <div key={i} className="col-md-4">
                <div className="text-center p-4 rounded-3" style={{ background: 'white', border: '1px solid var(--bb-border)' }}>
                  <div
                    className="mx-auto mb-3 d-flex align-items-center justify-content-center fw-bold"
                    style={{ width: 48, height: 48, borderRadius: '50%', background: 'var(--bb-green)', color: 'white', fontSize: 20 }}
                  >
                    {s.step}
                  </div>
                  <div className="fw-bold mb-1">{s.label}</div>
                  <div className="text-muted" style={{ fontSize: 13 }}>{s.desc}</div>
                </div>
              </div>
            ))}
          </div>

          <div className="text-center mt-4">
            <button
              className="btn btn-primary btn-lg fw-bold px-5"
              onClick={onStartSelling}
            >
              🚀 Create Your Free Listing Now
            </button>
            <div className="text-muted mt-2" style={{ fontSize: 13 }}>No credit card needed · 100% free forever</div>
          </div>
        </div>
      </div>

      <footer className="bb-footer">
        Bulk<span className="accent fw-bold">Bazaar</span> &copy; 2025 &nbsp;·&nbsp; Tamil Nadu's Bulk B2B Marketplace &nbsp;·&nbsp; bulkbazaar.in &nbsp;·&nbsp; 0% Commission
      </footer>
    </div>
  )
}

export default function FeedPage() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [activeTab, setActiveTab] = useState('buy')

  function onStartSelling() {
    if (!user) return navigate('/login')
    if (user.role === 'seller') return navigate('/create')
    navigate('/role-select')
  }
  const [category, setCategory] = useState('all')
  const [listings, setListings] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

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

  return (
    <>
      <Header />

      {/* Tab Bar */}
      <div style={{ background: 'white', borderBottom: '1px solid var(--bb-border)', position: 'sticky', top: 60, zIndex: 100 }}>
        <div className="container">
          <div className="d-flex">
            {[
              { id: 'buy', label: '🛒 Browse & Buy' },
              { id: 'sell', label: '🏪 Sell on BulkBazaar' },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                style={{
                  padding: '14px 24px',
                  border: 'none',
                  background: 'none',
                  fontWeight: activeTab === tab.id ? 700 : 400,
                  color: activeTab === tab.id ? 'var(--bb-green)' : 'var(--bb-muted)',
                  borderBottom: activeTab === tab.id ? '2px solid var(--bb-green)' : '2px solid transparent',
                  fontSize: 15,
                  cursor: 'pointer',
                  transition: 'all 0.15s',
                }}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {activeTab === 'sell' ? (
        <SellTab navigate={navigate} onStartSelling={onStartSelling} />
      ) : (
        <>
          {/* Hero */}
          <div className="bb-hero">
            <div className="container text-center">
              <div className="hero-badge">🇮🇳 Tamil Nadu's Bulk B2B Marketplace</div>
              <h1 className="mb-3">
                Buy Bulk Direct from<br />
                <span className="text-accent">Farms & Factories</span>
              </h1>
              <p className="mb-4" style={{ color: 'rgba(255,255,255,0.7)', fontSize: 16, maxWidth: 540, margin: '0 auto 24px' }}>
                Connect directly with Tamil Nadu's best farms, factories and wholesalers.
                Browse, compare prices and contact sellers — 100% free, no commission ever.
              </p>
              <div className="d-flex justify-content-center align-items-center gap-4 flex-wrap mb-4">
                <div>
                  <div className="stat-num">30+</div>
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
              <div className="d-flex justify-content-center gap-2 flex-wrap">
                <div className="px-3 py-2 rounded-3" style={{ background: 'rgba(255,255,255,0.1)', fontSize: 13, color: 'rgba(255,255,255,0.85)' }}>
                  ✓ Free to browse
                </div>
                <div className="px-3 py-2 rounded-3" style={{ background: 'rgba(255,255,255,0.1)', fontSize: 13, color: 'rgba(255,255,255,0.85)' }}>
                  ✓ Free to contact sellers
                </div>
                <div className="px-3 py-2 rounded-3" style={{ background: 'rgba(255,255,255,0.1)', fontSize: 13, color: 'rgba(255,255,255,0.85)' }}>
                  ✓ No middlemen
                </div>
              </div>
            </div>
          </div>

          {/* Category cards */}
          <div style={{ background: 'white', borderBottom: '1px solid var(--bb-border)', padding: '28px 0' }}>
            <div className="container">
              <div className="d-flex justify-content-between align-items-center mb-3">
                <div>
                  <div style={{ fontSize: 17, fontWeight: 700 }}>Browse by Category</div>
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
              <button className="btn btn-outline-primary btn-sm" onClick={onStartSelling}>
                List Your Products Free →
              </button>
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
                {listings.map(l => <ListingCard key={l.id} listing={l} />)}
              </div>
            )}
          </div>

          <footer className="bb-footer">
            Bulk<span className="accent fw-bold">Bazaar</span> &copy; 2025 &nbsp;·&nbsp; Tamil Nadu's Bulk B2B Marketplace &nbsp;·&nbsp; bulkbazaar.in &nbsp;·&nbsp; 0% Commission
          </footer>
        </>
      )}
    </>
  )
}

import React, { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { api } from '../api.js'
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

export default function FeedPage() {
  const navigate = useNavigate()
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
          <button className="btn btn-outline-primary btn-sm" onClick={() => navigate('/login')}>
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
  )
}

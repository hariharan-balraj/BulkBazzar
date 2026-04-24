import React from 'react'
import { useNavigate } from 'react-router-dom'
import { api } from '../api.js'
import { incrementContact, canContact, isPromoActive } from '../contactTracker.js'

const CAT_EMOJI = {
  agriculture: '🌾', livestock: '🐄', textile: '🧵', manufacturing: '🏭',
  spices: '🌶️', construction: '🏗️', electrical: '⚡',
  handicrafts: '🪴', healthcare: '💊', plastics: '📦',
}

function timeAgo(dateStr) {
  const diff = (Date.now() - new Date(dateStr + 'Z')) / 1000
  if (diff < 60) return 'Just now'
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`
  return `${Math.floor(diff / 86400)}d ago`
}

export default function ListingCard({ listing, onContactLimited }) {
  const navigate = useNavigate()
  const img = listing.media_urls?.[0]
  const emoji = CAT_EMOJI[listing.category] || '📦'
  const isVerified = listing.seller_subscription === 'verified'

  function handleWhatsApp(e) {
    e.stopPropagation()
    if (!canContact()) {
      onContactLimited?.()
      return
    }
    incrementContact()
    api.trackContact(listing.id).catch(() => {})
    const msg = `Hi, I'm interested in "${listing.title}" listed on BulkBazaar (bulkbazaar.in). Is it available?`
    window.open(`https://wa.me/${listing.seller_phone}?text=${encodeURIComponent(msg)}`, '_blank')
  }

  return (
    <div className="product-card" onClick={() => navigate(`/listing/${listing.id}`)}>
      <div className="product-card-img-wrap">
        {img ? (
          <img src={img} alt={listing.title} className="product-card-img" loading="lazy" />
        ) : (
          <div className="product-card-img-placeholder">{emoji}</div>
        )}
        <div className="product-card-cat-badge">{listing.category}</div>
        {isVerified && (
          <div style={{ position: 'absolute', top: 10, right: 10 }}>
            <span className="verified-badge">✓ Verified</span>
          </div>
        )}
      </div>

      <div className="product-card-body">
        <div className="product-card-title">{listing.title}</div>
        <div className="product-card-price-row">
          <div className="product-card-price">₹{listing.price.toLocaleString('en-IN')}</div>
          <div className="product-card-unit">/ {listing.unit}</div>
        </div>
        {listing.quantity > 0 && (
          <div className="product-card-qty">Qty: {listing.quantity.toLocaleString('en-IN')} {listing.unit}</div>
        )}
        <div className="product-card-meta">
          {listing.location_name && (
            <div className="product-card-location">📍 {listing.location_name}</div>
          )}
          <div className="product-card-time">Updated {timeAgo(listing.created_at)}</div>
        </div>
      </div>

      <div className="product-card-footer">
        <div className="product-card-seller" style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
          👤 {listing.seller_name || 'Seller'}
          {isVerified && <span style={{ color: '#2563eb', fontSize: 13 }}>✓</span>}
        </div>
        <button className="wa-mini-btn" onClick={handleWhatsApp}>
          💬 WhatsApp
        </button>
      </div>
    </div>
  )
}

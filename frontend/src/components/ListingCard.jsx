import React from 'react'
import { useNavigate } from 'react-router-dom'
import { api } from '../api.js'

const CAT_EMOJI = {
  agriculture: '🌾', livestock: '🐄', textile: '🧵', manufacturing: '🏭',
  spices: '🌶️', construction: '🏗️', electrical: '⚡',
  handicrafts: '🪴', healthcare: '💊', plastics: '📦',
}

function calcRating(listing) {
  let score = 0
  if (listing.description && listing.description.length > 30) score++
  if (listing.media_urls && listing.media_urls.length > 0) score++
  if (listing.video_url) score++
  if (listing.quantity > 0) score++
  if (listing.location_name) score++
  return score
}

export function QualityBadge({ listing, size = 'sm' }) {
  const score = calcRating(listing)
  const color = score >= 4 ? '#16a34a' : score >= 3 ? '#d97706' : '#6b7280'
  const label = score >= 4 ? 'Excellent' : score >= 3 ? 'Good' : score >= 2 ? 'Fair' : 'Basic'
  const fs = size === 'sm' ? 11 : 13
  return (
    <div className="d-flex align-items-center gap-1" style={{ fontSize: fs }}>
      <span style={{ color: '#f59e0b', letterSpacing: -1 }}>
        {'★'.repeat(score)}{'☆'.repeat(5 - score)}
      </span>
      <span style={{ color, fontWeight: 600 }}>{label}</span>
    </div>
  )
}

export default function ListingCard({ listing }) {
  const navigate = useNavigate()
  const firstImg = listing.media_urls?.[0]

  function handleContact(e) {
    e.stopPropagation()
    api.trackContact(listing.id).catch(() => {})
    const msg = `Hi, I'm interested in "${listing.title}" listed on BulkBazaar (bulkbazaar.in). Is it available?`
    window.open(`https://wa.me/${listing.seller_phone}?text=${encodeURIComponent(msg)}`, '_blank')
  }

  return (
    <div className="listing-card" onClick={() => navigate(`/listing/${listing.id}`)}>
      <div className="position-relative">
        {firstImg ? (
          <img src={firstImg} className="listing-card-img" alt={listing.title} loading="lazy" />
        ) : (
          <div className="listing-card-img d-flex align-items-center justify-content-center bg-light" style={{ fontSize: 48 }}>
            {CAT_EMOJI[listing.category] || '📦'}
          </div>
        )}
        {listing.video_url && (
          <span className="position-absolute bottom-0 start-0 m-2 badge bg-dark bg-opacity-75" style={{ fontSize: 11 }}>
            ▶ Video
          </span>
        )}
        <span className="position-absolute top-0 end-0 m-2 badge bg-white text-dark shadow-sm" style={{ fontSize: 12 }}>
          {CAT_EMOJI[listing.category] || '📦'}
        </span>
      </div>

      <div className="listing-card-body">
        <div className="listing-card-title">{listing.title}</div>
        <div className="listing-card-loc">📍 {listing.location_name || listing.category}</div>
        <div className="mb-1">
          <span className="listing-card-price">₹{listing.price.toLocaleString('en-IN')}</span>
          <span className="listing-card-unit"> / {listing.unit}</span>
        </div>
        <QualityBadge listing={listing} size="sm" />
      </div>

      <div className="listing-card-footer">
        <span style={{ fontSize: 12, color: 'var(--bb-muted)' }}>
          {listing.quantity > 0 ? `${listing.quantity.toLocaleString('en-IN')} ${listing.unit} avail.` : 'Out of stock'}
        </span>
        <button
          className="btn btn-sm btn-primary"
          style={{ fontSize: 12, padding: '4px 10px' }}
          onClick={handleContact}
        >
          💬 Contact
        </button>
      </div>
    </div>
  )
}

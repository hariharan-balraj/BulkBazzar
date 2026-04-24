import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { api } from '../api.js'
import { useAuth } from '../App.jsx'
import Header from '../components/Header.jsx'
import { incrementContact, canContact, isPromoActive } from '../contactTracker.js'

const CAT_EMOJI = {
  agriculture: '🌾', livestock: '🐄', textile: '🧵', manufacturing: '🏭',
  spices: '🌶️', construction: '🏗️', electrical: '⚡',
  handicrafts: '🪴', healthcare: '💊', plastics: '📦',
}

function timeAgo(dateStr) {
  const diff = (Date.now() - new Date(dateStr + 'Z')) / 1000
  if (diff < 60) return 'Just now'
  if (diff < 3600) return `${Math.floor(diff / 60)} minutes ago`
  if (diff < 86400) return `${Math.floor(diff / 3600)} hours ago`
  return `${Math.floor(diff / 86400)} days ago`
}

function formatDate(dateStr) {
  return new Date(dateStr + 'Z').toLocaleDateString('en-IN', {
    day: 'numeric', month: 'long', year: 'numeric'
  })
}

export default function ListingDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const [listing, setListing] = useState(null)
  const [loading, setLoading] = useState(true)
  const [activeImg, setActiveImg] = useState(0)
  const [contactBlocked, setContactBlocked] = useState(false)

  useEffect(() => {
    api.getListing(id)
      .then(data => {
        setListing(data)
        api.trackView(parseInt(id)).catch(() => {})
      })
      .catch(() => navigate('/feed'))
      .finally(() => setLoading(false))
  }, [id])

  if (loading) return <><Header /><div className="loading-screen"><div className="spinner" /></div></>
  if (!listing) return null

  const isMine = user?.id === listing.seller_id
  const isBuyer = user?.role === 'buyer'
  const isVerified = listing.seller_subscription === 'verified'
  const imgs = listing.media_urls || []
  const emoji = CAT_EMOJI[listing.category] || '📦'

  function handleWhatsApp() {
    if (!canContact() && !isMine) {
      setContactBlocked(true)
      return
    }
    if (isBuyer) incrementContact()
    api.trackContact(listing.id).catch(() => {})
    const msg = `Hi ${listing.seller_name || 'there'}, I saw your listing "${listing.title}" on BulkBazaar (bulkbazaar.in) and I'm interested. Could you share more details about availability and bulk pricing?`
    window.open(`https://wa.me/${listing.seller_phone}?text=${encodeURIComponent(msg)}`, '_blank')
  }

  function handleCall() {
    if (!canContact() && !isMine) {
      setContactBlocked(true)
      return
    }
    if (isBuyer) incrementContact()
    api.trackContact(listing.id).catch(() => {})
    window.location.href = `tel:${listing.seller_phone}`
  }

  async function handleDelete() {
    if (!confirm('Delete this listing permanently?')) return
    try {
      await api.deleteListing(listing.id)
      navigate('/dashboard')
    } catch (err) {
      alert('Failed to delete: ' + err.message)
    }
  }

  const sellerInitial = (listing.seller_name || 'S')[0].toUpperCase()

  return (
    <>
      <Header />
      <div className="detail-page">
        {/* Breadcrumb */}
        <div style={{ background: 'var(--bg)', borderBottom: '1px solid var(--border-light)', padding: '10px 0' }}>
          <div className="container" style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: 'var(--text-muted)' }}>
            <span style={{ cursor: 'pointer' }} onClick={() => navigate('/feed')}>Home</span>
            <span>›</span>
            <span style={{ cursor: 'pointer', textTransform: 'capitalize' }} onClick={() => navigate('/feed')}>{listing.category}</span>
            <span>›</span>
            <span style={{ color: 'var(--text)', fontWeight: 500 }}>{listing.title}</span>
          </div>
        </div>

        <div className="container">
          <div className="detail-grid">
            {/* Gallery */}
            <div className="detail-gallery">
              <div className="detail-gallery-main">
                {imgs.length > 0 ? (
                  <img src={imgs[activeImg]} alt={listing.title} />
                ) : (
                  <div className="detail-gallery-placeholder">{emoji}</div>
                )}
              </div>
              {imgs.length > 1 && (
                <div className="detail-gallery-thumbs">
                  {imgs.map((img, i) => (
                    <div
                      key={i}
                      className={`detail-gallery-thumb ${i === activeImg ? 'active' : ''}`}
                      onClick={() => setActiveImg(i)}
                    >
                      <img src={img} alt="" />
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Info */}
            <div className="detail-info">
              <div className="detail-badge-row">
                <span className="detail-badge badge-cat">{emoji} {listing.category}</span>
                <span className="detail-badge badge-avail">In Stock</span>
                <span className="detail-badge badge-fresh">Direct Source</span>
                {isVerified && <span className="verified-badge-lg">✓ Verified Supplier</span>}
              </div>

              <h1 className="detail-title">{listing.title}</h1>

              <div className="detail-price-block">
                <div className="detail-price">
                  ₹{listing.price.toLocaleString('en-IN')}
                  <span> / {listing.unit}</span>
                </div>
                <div className="detail-qty-row">
                  {listing.quantity > 0 && (
                    <div className="detail-qty-item">
                      <div className="detail-qty-label">Available Qty</div>
                      <div className="detail-qty-val">{listing.quantity.toLocaleString('en-IN')} {listing.unit}</div>
                    </div>
                  )}
                  <div className="detail-qty-item">
                    <div className="detail-qty-label">Unit</div>
                    <div className="detail-qty-val">{listing.unit}</div>
                  </div>
                  <div className="detail-qty-item">
                    <div className="detail-qty-label">Category</div>
                    <div className="detail-qty-val" style={{ textTransform: 'capitalize' }}>{listing.category}</div>
                  </div>
                </div>
              </div>

              {/* Specs */}
              <div className="detail-section">
                <div className="detail-section-title">Product Details</div>
                <div className="detail-specs">
                  <div className="detail-spec-item">
                    <div className="detail-spec-label">Price</div>
                    <div className="detail-spec-val">₹{listing.price.toLocaleString('en-IN')} / {listing.unit}</div>
                  </div>
                  <div className="detail-spec-item">
                    <div className="detail-spec-label">Stock</div>
                    <div className="detail-spec-val">{listing.quantity > 0 ? `${listing.quantity.toLocaleString('en-IN')} ${listing.unit}` : 'On request'}</div>
                  </div>
                  <div className="detail-spec-item">
                    <div className="detail-spec-label">Location</div>
                    <div className="detail-spec-val">{listing.location_name || '—'}</div>
                  </div>
                  <div className="detail-spec-item">
                    <div className="detail-spec-label">Listed On</div>
                    <div className="detail-spec-val">{formatDate(listing.created_at)}</div>
                  </div>
                </div>
              </div>

              {listing.description && (
                <div className="detail-section">
                  <div className="detail-section-title">Description</div>
                  <div className="detail-desc">{listing.description}</div>
                </div>
              )}

              {/* Seller */}
              <div className="detail-section">
                <div className="detail-section-title">Seller Information</div>
                <div className="detail-seller-card">
                  <div className="detail-seller-top">
                    <div className="detail-seller-avatar">{sellerInitial}</div>
                    <div>
                      <div className="detail-seller-name" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        {listing.seller_name || 'Seller'}
                        {isVerified && <span className="verified-badge">✓ Verified</span>}
                      </div>
                      <div className="detail-seller-role">
                        {isVerified ? 'Verified Supplier on BulkBazaar' : 'Supplier on BulkBazaar'}
                      </div>
                    </div>
                  </div>
                  <div className="detail-seller-info">
                    <div className="detail-seller-row">📱 <strong>{listing.seller_phone}</strong></div>
                    {listing.location_name && (
                      <div className="detail-seller-row">📍 <strong>{listing.location_name}</strong></div>
                    )}
                    <div className="detail-seller-row">🕐 Last updated <strong>{timeAgo(listing.created_at)}</strong></div>
                  </div>
                </div>
              </div>

              {/* Contact blocked notice */}
              {contactBlocked && (
                <div style={{ background: '#fef3c7', border: '1px solid #fde68a', borderRadius: 10, padding: '14px 16px', marginBottom: 16 }}>
                  <div style={{ fontWeight: 700, color: '#78350f', marginBottom: 4 }}>Free contacts used up</div>
                  <div style={{ fontSize: 13, color: '#92400e', lineHeight: 1.5 }}>
                    You've used your 10 free monthly contacts. Buy a Contact Pack (₹100 for 10 contacts) or get Unlimited access at ₹199/month.
                  </div>
                  <button className="btn btn-accent btn-sm" style={{ marginTop: 10 }} onClick={() => navigate('/pricing')}>
                    View Plans
                  </button>
                </div>
              )}

              {/* CTA */}
              {!isMine ? (
                <>
                  <div className="detail-cta">
                    <button className="btn btn-call" onClick={handleCall}>
                      📞 Call Seller
                    </button>
                    <button className="btn btn-whatsapp" onClick={handleWhatsApp}>
                      💬 WhatsApp
                    </button>
                  </div>
                  <div className="detail-updated">
                    {isPromoActive()
                      ? '🎉 All contacts FREE during 3-month launch offer'
                      : 'Direct contact — no commission charged'}
                  </div>
                </>
              ) : (
                <div style={{ display: 'flex', gap: 10 }}>
                  <button className="btn btn-secondary" style={{ flex: 1 }} onClick={() => navigate('/dashboard')}>
                    ← Dashboard
                  </button>
                  <button className="btn btn-danger" style={{ flex: 1 }} onClick={handleDelete}>
                    Delete Listing
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <footer className="footer">
        Bulk<strong style={{ color: 'var(--primary-light)' }}>Bazaar</strong> &copy; 2025 — Tamil Nadu's Bulk B2B Marketplace &nbsp;·&nbsp;
        <span>bulkbazaar.in</span> &nbsp;·&nbsp; 0% Commission
      </footer>
    </>
  )
}

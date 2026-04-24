import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { api } from '../api.js'
import { useAuth } from '../App.jsx'
import Header from '../components/Header.jsx'
import { QualityBadge } from '../components/ListingCard.jsx'

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
  return new Date(dateStr + 'Z').toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })
}

function QualityTooltip() {
  return (
    <div className="mt-2 p-2 rounded-3" style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', fontSize: 12 }}>
      <div className="fw-semibold mb-1" style={{ color: '#16a34a' }}>ℹ️ How is this rating calculated?</div>
      <div style={{ color: '#374151' }}>Seller rating is based on listing completeness: description filled, photos uploaded, video added, stock quantity updated, and location mentioned.</div>
    </div>
  )
}

export default function ListingDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const [listing, setListing] = useState(null)
  const [loading, setLoading] = useState(true)
  const [activeImg, setActiveImg] = useState(0)
  const [showVideo, setShowVideo] = useState(false)
  const [showRatingInfo, setShowRatingInfo] = useState(false)

  useEffect(() => {
    api.getListing(id)
      .then(data => { setListing(data); api.trackView(parseInt(id)).catch(() => {}) })
      .catch(() => navigate('/feed'))
      .finally(() => setLoading(false))
  }, [id])

  if (loading) return <><Header /><div className="bb-spinner"><div className="spin" /></div></>
  if (!listing) return null

  const isMine = user?.id === listing.seller_id
  const imgs = listing.media_urls || []
  const emoji = CAT_EMOJI[listing.category] || '📦'
  const sellerInitial = (listing.seller_name || 'S')[0].toUpperCase()
  const hasVideo = !!listing.video_url
  const mapQuery = listing.location_name ? encodeURIComponent(listing.location_name + ', India') : null

  function handleWhatsApp() {
    api.trackContact(listing.id).catch(() => {})
    const msg = `Hi ${listing.seller_name || 'there'}, I saw your listing "${listing.title}" on BulkBazaar (bulkbazaar.in) and I'm interested. Could you share more details about availability and bulk pricing?`
    window.open(`https://wa.me/${listing.seller_phone}?text=${encodeURIComponent(msg)}`, '_blank')
  }

  function handleCall() {
    api.trackContact(listing.id).catch(() => {})
    window.location.href = `tel:${listing.seller_phone}`
  }

  async function handleDelete() {
    if (!confirm('Delete this listing permanently?')) return
    try { await api.deleteListing(listing.id); navigate('/dashboard') }
    catch (err) { alert('Failed to delete: ' + err.message) }
  }

  return (
    <>
      <Header />

      {/* Breadcrumb */}
      <div style={{ background: 'white', borderBottom: '1px solid var(--bb-border)', padding: '10px 0', fontSize: 13 }}>
        <div className="container d-flex align-items-center gap-2 text-muted">
          <span className="cursor-pointer" onClick={() => navigate('/feed')}>Home</span>
          <span>›</span>
          <span className="cursor-pointer text-capitalize" onClick={() => navigate('/feed')}>{listing.category}</span>
          <span>›</span>
          <span style={{ color: 'var(--bb-dark)', fontWeight: 500 }}>{listing.title}</span>
        </div>
      </div>

      <div style={{ background: 'var(--bb-bg)', minHeight: '100vh', padding: '32px 0 64px' }}>
        <div className="container">
          <div className="row g-4">
            {/* Gallery + Video */}
            <div className="col-lg-6">
              {hasVideo && (
                <div className="d-flex gap-2 mb-2">
                  <button
                    className={`btn btn-sm ${!showVideo ? 'btn-primary' : 'btn-outline-secondary'}`}
                    onClick={() => setShowVideo(false)}
                  >
                    📷 Photos
                  </button>
                  <button
                    className={`btn btn-sm ${showVideo ? 'btn-primary' : 'btn-outline-secondary'}`}
                    onClick={() => setShowVideo(true)}
                  >
                    ▶ Product Video
                  </button>
                </div>
              )}

              {showVideo && hasVideo ? (
                <div className="detail-gallery-main mb-2">
                  <video
                    src={listing.video_url}
                    controls
                    autoPlay
                    className="w-100"
                    style={{ height: 380, objectFit: 'contain', background: '#000' }}
                  />
                </div>
              ) : (
                <>
                  <div className="detail-gallery-main mb-2">
                    {imgs.length > 0 ? (
                      <img src={imgs[activeImg]} alt={listing.title} />
                    ) : (
                      <div style={{ height: 380, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 80, background: 'var(--bb-bg)' }}>
                        {emoji}
                      </div>
                    )}
                  </div>
                  {imgs.length > 1 && (
                    <div className="d-flex gap-2 flex-wrap">
                      {imgs.map((img, i) => (
                        <div key={i} className={`detail-thumb-bb ${i === activeImg ? 'active' : ''}`} onClick={() => setActiveImg(i)}>
                          <img src={img} alt="" />
                        </div>
                      ))}
                    </div>
                  )}
                </>
              )}
            </div>

            {/* Info */}
            <div className="col-lg-6">
              <div style={{ position: 'sticky', top: 80 }}>
                {/* Badges */}
                <div className="d-flex flex-wrap gap-2 mb-3">
                  <span className="badge bg-light text-dark border" style={{ fontSize: 12 }}>{emoji} {listing.category}</span>
                  <span className="badge" style={{ background: listing.quantity > 0 ? 'var(--bb-green-light)' : '#fee2e2', color: listing.quantity > 0 ? 'var(--bb-green)' : '#dc2626', fontSize: 12 }}>
                    {listing.quantity > 0 ? 'In Stock' : 'Out of Stock'}
                  </span>
                  <span className="badge bg-light text-dark border" style={{ fontSize: 12 }}>Direct Source</span>
                  {hasVideo && <span className="badge bg-dark" style={{ fontSize: 12 }}>▶ Video Available</span>}
                </div>

                <h3 className="fw-bold mb-2" style={{ color: 'var(--bb-dark)', lineHeight: 1.3 }}>{listing.title}</h3>

                {/* Quality Rating */}
                <div className="mb-3">
                  <div
                    className="d-inline-flex align-items-center gap-2 cursor-pointer"
                    onClick={() => setShowRatingInfo(v => !v)}
                    style={{ cursor: 'pointer' }}
                  >
                    <QualityBadge listing={listing} size="lg" />
                    <span style={{ fontSize: 12, color: 'var(--bb-muted)' }}>Seller Quality Score ℹ️</span>
                  </div>
                  {showRatingInfo && <QualityTooltip />}
                </div>

                {/* Price */}
                <div className="p-3 rounded-3 mb-3" style={{ background: 'white', border: '1px solid var(--bb-border)' }}>
                  <div style={{ fontSize: 32, fontWeight: 800, color: 'var(--bb-green)' }}>
                    ₹{listing.price.toLocaleString('en-IN')}
                    <span style={{ fontSize: 16, fontWeight: 400, color: 'var(--bb-muted)' }}> / {listing.unit}</span>
                  </div>
                  <div className="d-flex gap-4 mt-2">
                    {listing.quantity > 0 && (
                      <div>
                        <div style={{ fontSize: 11, color: 'var(--bb-muted)', textTransform: 'uppercase', letterSpacing: 0.5 }}>Available Qty</div>
                        <div style={{ fontSize: 14, fontWeight: 600 }}>{listing.quantity.toLocaleString('en-IN')} {listing.unit}</div>
                      </div>
                    )}
                    <div>
                      <div style={{ fontSize: 11, color: 'var(--bb-muted)', textTransform: 'uppercase', letterSpacing: 0.5 }}>Location</div>
                      <div style={{ fontSize: 14, fontWeight: 600 }}>{listing.location_name || '—'}</div>
                    </div>
                  </div>
                </div>

                {/* Description */}
                {listing.description && (
                  <div className="mb-3">
                    <div className="fw-semibold mb-1" style={{ fontSize: 14 }}>Product Details</div>
                    <p className="text-muted" style={{ fontSize: 14, lineHeight: 1.7, margin: 0, whiteSpace: 'pre-line' }}>{listing.description}</p>
                  </div>
                )}

                {/* Seller card */}
                <div className="p-3 rounded-3 mb-3" style={{ background: 'white', border: '1px solid var(--bb-border)' }}>
                  <div className="fw-semibold mb-2" style={{ fontSize: 11, color: 'var(--bb-muted)', textTransform: 'uppercase', letterSpacing: 0.5 }}>Seller Information</div>
                  <div className="d-flex align-items-center gap-3 mb-2">
                    <div className="seller-avatar-bb">{sellerInitial}</div>
                    <div>
                      <div className="fw-bold" style={{ fontSize: 15 }}>{listing.seller_name || 'Seller'}</div>
                      {listing.store_name && listing.store_name !== listing.seller_name && (
                        <div style={{ fontSize: 12, color: 'var(--bb-muted)' }}>🏪 {listing.store_name}</div>
                      )}
                      {!listing.store_name && (
                        <div className="text-muted" style={{ fontSize: 12 }}>Supplier on BulkBazaar</div>
                      )}
                    </div>
                  </div>
                  <div style={{ fontSize: 13, color: 'var(--bb-muted)' }}>
                    <div>📱 <strong style={{ color: 'var(--bb-dark)' }}>{listing.seller_phone}</strong></div>
                    {listing.location_name && <div className="mt-1">📍 <strong style={{ color: 'var(--bb-dark)' }}>{listing.location_name}</strong></div>}
                    <div className="mt-1">🕐 Updated <strong style={{ color: 'var(--bb-dark)' }}>{timeAgo(listing.created_at)}</strong></div>
                  </div>
                </div>

                {/* CTA */}
                {!isMine ? (
                  <>
                    <div className="d-flex gap-2 mb-2">
                      <button className="btn btn-outline-primary btn-lg flex-fill fw-bold" onClick={handleCall}>📞 Call Seller</button>
                      <button className="btn btn-primary btn-lg flex-fill fw-bold" onClick={handleWhatsApp}>💬 WhatsApp</button>
                    </div>
                    <div className="text-center text-muted" style={{ fontSize: 12 }}>
                      ✓ Direct contact — free, no commission charged
                    </div>
                  </>
                ) : (
                  <div className="d-flex gap-2">
                    <button className="btn btn-outline-secondary flex-fill" onClick={() => navigate('/dashboard')}>← Dashboard</button>
                    <button className="btn btn-outline-danger flex-fill" onClick={handleDelete}>Delete Listing</button>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="row mt-4 g-4">
            {/* Specs table */}
            <div className="col-lg-6">
              <div style={{ background: 'white', border: '1px solid var(--bb-border)', borderRadius: 14, padding: 24 }}>
                <div className="fw-bold mb-3" style={{ fontSize: 15 }}>Product Specifications</div>
                <table className="table table-sm mb-0" style={{ fontSize: 14 }}>
                  <tbody>
                    <tr><td className="text-muted border-0">Price</td><td className="fw-semibold border-0">₹{listing.price.toLocaleString('en-IN')} / {listing.unit}</td></tr>
                    <tr><td className="text-muted">Stock</td><td className="fw-semibold">{listing.quantity > 0 ? `${listing.quantity.toLocaleString('en-IN')} ${listing.unit}` : 'Out of stock'}</td></tr>
                    <tr><td className="text-muted">Location</td><td className="fw-semibold">{listing.location_name || '—'}</td></tr>
                    {listing.store_name && <tr><td className="text-muted">Store</td><td className="fw-semibold">{listing.store_name}</td></tr>}
                    <tr><td className="text-muted">Category</td><td className="fw-semibold text-capitalize">{listing.category}</td></tr>
                    <tr><td className="text-muted">Listed On</td><td className="fw-semibold">{formatDate(listing.created_at)}</td></tr>
                    <tr><td className="text-muted border-0">Video</td><td className="fw-semibold border-0">{hasVideo ? '✓ Available' : '—'}</td></tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* Map */}
            {mapQuery && (
              <div className="col-lg-6">
                <div style={{ background: 'white', border: '1px solid var(--bb-border)', borderRadius: 14, overflow: 'hidden' }}>
                  <div className="fw-bold p-3 pb-2" style={{ fontSize: 15 }}>📍 Seller Location</div>
                  <iframe
                    title="Seller Location Map"
                    src={`https://maps.google.com/maps?q=${mapQuery}&output=embed&z=13`}
                    width="100%"
                    height="240"
                    style={{ border: 0, display: 'block' }}
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                  />
                  <div className="p-2 text-center" style={{ fontSize: 12 }}>
                    <a
                      href={`https://maps.google.com/maps?q=${mapQuery}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{ color: 'var(--bb-green)', textDecoration: 'none' }}
                    >
                      View on Google Maps ↗
                    </a>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <footer className="bb-footer">
        Bulk<span className="accent fw-bold">Bazaar</span> &copy; 2025 &nbsp;·&nbsp; bulkbazaar.in &nbsp;·&nbsp; 0% Commission
      </footer>
    </>
  )
}

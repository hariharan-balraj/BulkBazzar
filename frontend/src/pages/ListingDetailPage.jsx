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
  return new Date(dateStr + 'Z').toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })
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
      .then(data => { setListing(data); api.trackView(parseInt(id)).catch(() => {}) })
      .catch(() => navigate('/feed'))
      .finally(() => setLoading(false))
  }, [id])

  if (loading) return <><Header /><div className="bb-spinner"><div className="spin" /></div></>
  if (!listing) return null

  const isMine = user?.id === listing.seller_id
  const isBuyer = user?.role === 'buyer'
  const isVerified = listing.seller_subscription === 'verified'
  const imgs = listing.media_urls || []
  const emoji = CAT_EMOJI[listing.category] || '📦'
  const sellerInitial = (listing.seller_name || 'S')[0].toUpperCase()

  function handleWhatsApp() {
    if (!canContact() && !isMine) { setContactBlocked(true); return }
    if (isBuyer) incrementContact()
    api.trackContact(listing.id).catch(() => {})
    const msg = `Hi ${listing.seller_name || 'there'}, I saw your listing "${listing.title}" on BulkBazaar (bulkbazaar.in) and I'm interested. Could you share more details about availability and bulk pricing?`
    window.open(`https://wa.me/${listing.seller_phone}?text=${encodeURIComponent(msg)}`, '_blank')
  }

  function handleCall() {
    if (!canContact() && !isMine) { setContactBlocked(true); return }
    if (isBuyer) incrementContact()
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
            {/* Gallery */}
            <div className="col-lg-6">
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
            </div>

            {/* Info */}
            <div className="col-lg-6">
              <div style={{ position: 'sticky', top: 80 }}>
                {/* Badges */}
                <div className="d-flex flex-wrap gap-2 mb-3">
                  <span className="badge bg-light text-dark border" style={{ fontSize: 12 }}>{emoji} {listing.category}</span>
                  <span className="badge" style={{ background: 'var(--bb-green-light)', color: 'var(--bb-green)', fontSize: 12 }}>In Stock</span>
                  <span className="badge bg-light text-dark border" style={{ fontSize: 12 }}>Direct Source</span>
                  {isVerified && <span className="badge-verified-lg">✓ Verified Supplier</span>}
                </div>

                <h3 className="fw-bold mb-3" style={{ color: 'var(--bb-dark)', lineHeight: 1.3 }}>{listing.title}</h3>

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
                    <p className="text-muted" style={{ fontSize: 14, lineHeight: 1.7, margin: 0 }}>{listing.description}</p>
                  </div>
                )}

                {/* Seller card */}
                <div className="detail-seller-card p-3 rounded-3 mb-3" style={{ background: 'white', border: '1px solid var(--bb-border)' }}>
                  <div className="fw-semibold mb-2" style={{ fontSize: 13, color: 'var(--bb-muted)', textTransform: 'uppercase', letterSpacing: 0.5 }}>Seller Information</div>
                  <div className="d-flex align-items-center gap-3 mb-2">
                    <div className="seller-avatar-bb">{sellerInitial}</div>
                    <div>
                      <div className="fw-bold d-flex align-items-center gap-2" style={{ fontSize: 15 }}>
                        {listing.seller_name || 'Seller'}
                        {isVerified && <span className="badge-verified">✓ Verified</span>}
                      </div>
                      <div className="text-muted" style={{ fontSize: 12 }}>
                        {isVerified ? 'Verified Supplier on BulkBazaar' : 'Supplier on BulkBazaar'}
                      </div>
                    </div>
                  </div>
                  <div style={{ fontSize: 13, color: 'var(--bb-muted)' }}>
                    <div>📱 <strong style={{ color: 'var(--bb-dark)' }}>{listing.seller_phone}</strong></div>
                    {listing.location_name && <div className="mt-1">📍 <strong style={{ color: 'var(--bb-dark)' }}>{listing.location_name}</strong></div>}
                    <div className="mt-1">🕐 Updated <strong style={{ color: 'var(--bb-dark)' }}>{timeAgo(listing.created_at)}</strong></div>
                  </div>
                </div>

                {/* Contact blocked notice */}
                {contactBlocked && (
                  <div className="alert alert-warning mb-3" style={{ fontSize: 13 }}>
                    <strong>Free contacts used up.</strong> You've used your 10 free monthly contacts.
                    Buy a Contact Pack (₹100 for 10 contacts) or get Unlimited at ₹199/month.
                    <br />
                    <button className="btn btn-warning btn-sm mt-2" onClick={() => navigate('/pricing')}>View Plans</button>
                  </div>
                )}

                {/* CTA */}
                {!isMine ? (
                  <>
                    <div className="d-flex gap-2 mb-2">
                      <button className="btn btn-outline-primary btn-lg flex-fill fw-bold" onClick={handleCall}>📞 Call Seller</button>
                      <button className="btn btn-primary btn-lg flex-fill fw-bold" onClick={handleWhatsApp}>💬 WhatsApp</button>
                    </div>
                    <div className="text-center text-muted" style={{ fontSize: 12 }}>
                      {isPromoActive()
                        ? '🎉 All contacts FREE during 3-month launch offer'
                        : '✓ Direct contact — no commission charged'}
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

          {/* Specs table */}
          <div className="row mt-4">
            <div className="col-lg-6">
              <div style={{ background: 'white', border: '1px solid var(--bb-border)', borderRadius: 14, padding: 24 }}>
                <div className="fw-bold mb-3" style={{ fontSize: 15 }}>Product Specifications</div>
                <table className="table table-sm mb-0" style={{ fontSize: 14 }}>
                  <tbody>
                    <tr><td className="text-muted">Price</td><td className="fw-semibold">₹{listing.price.toLocaleString('en-IN')} / {listing.unit}</td></tr>
                    <tr><td className="text-muted">Stock</td><td className="fw-semibold">{listing.quantity > 0 ? `${listing.quantity.toLocaleString('en-IN')} ${listing.unit}` : 'On request'}</td></tr>
                    <tr><td className="text-muted">Location</td><td className="fw-semibold">{listing.location_name || '—'}</td></tr>
                    <tr><td className="text-muted">Category</td><td className="fw-semibold text-capitalize">{listing.category}</td></tr>
                    <tr className="table-borderless"><td className="text-muted">Listed On</td><td className="fw-semibold">{formatDate(listing.created_at)}</td></tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>

      <footer className="bb-footer">
        Bulk<span className="accent fw-bold">Bazaar</span> &copy; 2025 &nbsp;·&nbsp; bulkbazaar.in &nbsp;·&nbsp; 0% Commission
      </footer>
    </>
  )
}

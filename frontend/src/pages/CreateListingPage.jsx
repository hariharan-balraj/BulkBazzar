import React, { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { api } from '../api.js'
import Header from '../components/Header.jsx'

const CATEGORIES = [
  { id: 'agriculture', label: '🌾 Agriculture (Vegetables, Fruits, Grains, Flowers)' },
  { id: 'livestock', label: '🐄 Livestock & Food (Poultry, Fish, Dairy, Meat)' },
  { id: 'textile', label: '🧵 Textile (Fabrics, Garments, Uniforms)' },
  { id: 'manufacturing', label: '🏭 Manufacturing (Building Materials, Industrial Goods)' },
  { id: 'spices', label: '🌶️ Food & Spices (Masalas, Oils, Jaggery, Condiments)' },
  { id: 'construction', label: '🏗️ Construction (Blocks, Sand, Stone, Glass, Steel)' },
  { id: 'electrical', label: '⚡ Electrical & Electronics (Solar, Motors, LEDs, CCTV)' },
  { id: 'handicrafts', label: '🪴 Handicrafts & Gifts (Art, Brass, Pottery, Candles)' },
  { id: 'healthcare', label: '💊 Healthcare & Pharma (Herbal, Ayurvedic, Medical)' },
  { id: 'plastics', label: '📦 Plastics & Packaging (Bags, Bottles, Boxes, Films)' },
]
const UNITS = ['kg', 'g', 'tonne', 'litre', 'dozen', 'piece', 'box', 'bag', 'bundle', 'metre', 'set', 'pair', 'can']

export default function CreateListingPage() {
  const navigate = useNavigate()
  const fileRef = useRef()
  const [form, setForm] = useState({ title: '', category: '', description: '', price: '', unit: 'kg', quantity: '', location_name: '' })
  const [images, setImages] = useState([])
  const [uploading, setUploading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const set = (field, value) => setForm(f => ({ ...f, [field]: value }))

  async function handleImageSelect(e) {
    const files = Array.from(e.target.files)
    if (images.length + files.length > 5) { setError('Max 5 images allowed'); return }
    setUploading(true); setError('')
    try {
      for (const file of files) {
        const preview = URL.createObjectURL(file)
        const res = await api.uploadImage(file)
        setImages(prev => [...prev, { preview, url: res.url }])
      }
    } catch (err) { setError('Image upload failed: ' + err.message) }
    finally { setUploading(false) }
  }

  async function handleSubmit(e) {
    e.preventDefault(); setError('')
    if (!form.title.trim()) { setError('Title is required'); return }
    if (!form.category) { setError('Select a category'); return }
    if (!form.price || isNaN(form.price) || Number(form.price) <= 0) { setError('Enter a valid price'); return }
    setSaving(true)
    try {
      await api.createListing({
        title: form.title.trim(), category: form.category, description: form.description.trim(),
        price: Number(form.price), unit: form.unit,
        quantity: form.quantity ? Number(form.quantity) : 0,
        location_name: form.location_name.trim(), media_urls: images.map(i => i.url),
      })
      navigate('/dashboard')
    } catch (err) { setError(err.message) }
    finally { setSaving(false) }
  }

  return (
    <>
      <Header />
      <div style={{ background: 'var(--bb-bg)', minHeight: '100vh', padding: '32px 0 64px' }}>
        <div className="container">
          <div style={{ maxWidth: 680, margin: '0 auto' }}>
            <div className="mb-4">
              <h4 className="fw-bold mb-1" style={{ color: 'var(--bb-dark)' }}>Create New Listing</h4>
              <p className="text-muted" style={{ fontSize: 14 }}>Better photos and descriptions get more buyer enquiries.</p>
            </div>

            {error && <div className="error-msg-bb">⚠️ {error}</div>}

            <form onSubmit={handleSubmit} noValidate>
              {/* Photos */}
              <div className="create-card-bb">
                <div className="create-card-title">📷 Product Photos (up to 5)</div>
                <div className="d-flex gap-2 flex-wrap">
                  {images.map((img, i) => (
                    <div key={i} className="img-thumb-wrap">
                      <img src={img.preview} alt="" />
                      <button type="button" className="img-remove-btn" onClick={() => setImages(prev => prev.filter((_, idx) => idx !== i))}>×</button>
                    </div>
                  ))}
                  {images.length < 5 && (
                    <div className="img-add-btn" onClick={() => fileRef.current.click()}>
                      <span style={{ fontSize: 22 }}>{uploading ? '⏳' : '📷'}</span>
                      <span>{uploading ? 'Uploading…' : 'Add Photo'}</span>
                    </div>
                  )}
                </div>
                <input ref={fileRef} type="file" accept="image/*" multiple style={{ display: 'none' }} onChange={handleImageSelect} />
                <div className="form-text mt-2">Good photos get 5× more enquiries. Minimum 1 photo recommended.</div>
              </div>

              {/* Basic info */}
              <div className="create-card-bb">
                <div className="create-card-title">📝 Product Information</div>
                <div className="mb-3">
                  <label className="form-label fw-semibold" style={{ fontSize: 13 }}>Product Title *</label>
                  <input className="form-control" placeholder="e.g. Fresh Grade A Tomatoes from Thiruvallur" value={form.title} onChange={e => set('title', e.target.value)} maxLength={100} />
                </div>
                <div className="mb-3">
                  <label className="form-label fw-semibold" style={{ fontSize: 13 }}>Category *</label>
                  <select className="form-select" value={form.category} onChange={e => set('category', e.target.value)}>
                    <option value="">Select a category…</option>
                    {CATEGORIES.map(c => <option key={c.id} value={c.id}>{c.label}</option>)}
                  </select>
                </div>
                <div className="mb-0">
                  <label className="form-label fw-semibold" style={{ fontSize: 13 }}>Description</label>
                  <textarea className="form-control" placeholder="Describe quality, variety, freshness, minimum order, delivery info…" value={form.description} onChange={e => set('description', e.target.value)} rows={4} />
                  <div className="form-text">More detail = more trust = more enquiries</div>
                </div>
              </div>

              {/* Pricing */}
              <div className="create-card-bb">
                <div className="create-card-title">💰 Pricing & Availability</div>
                <div className="row g-3 mb-3">
                  <div className="col-6">
                    <label className="form-label fw-semibold" style={{ fontSize: 13 }}>Price (₹) *</label>
                    <input className="form-control" type="number" placeholder="0.00" min="0" step="0.01" value={form.price} onChange={e => set('price', e.target.value)} />
                  </div>
                  <div className="col-6">
                    <label className="form-label fw-semibold" style={{ fontSize: 13 }}>Unit</label>
                    <select className="form-select" value={form.unit} onChange={e => set('unit', e.target.value)}>
                      {UNITS.map(u => <option key={u} value={u}>{u}</option>)}
                    </select>
                  </div>
                </div>
                <div>
                  <label className="form-label fw-semibold" style={{ fontSize: 13 }}>Available Quantity</label>
                  <input className="form-control" type="number" placeholder={`e.g. 500 ${form.unit}`} min="0" value={form.quantity} onChange={e => set('quantity', e.target.value)} />
                </div>
              </div>

              {/* Location */}
              <div className="create-card-bb">
                <div className="create-card-title">📍 Location</div>
                <label className="form-label fw-semibold" style={{ fontSize: 13 }}>Location / Market Name</label>
                <input className="form-control" placeholder="e.g. Koyambedu Market, Chennai" value={form.location_name} onChange={e => set('location_name', e.target.value)} />
              </div>

              <button className="btn btn-primary btn-lg w-100" type="submit" disabled={saving || uploading}>
                {saving ? 'Publishing…' : '🚀 Publish Listing'}
              </button>
            </form>
          </div>
        </div>
      </div>

      <footer className="bb-footer">
        Bulk<span className="accent fw-bold">Bazaar</span> &copy; 2025 &nbsp;·&nbsp; bulkbazaar.in &nbsp;·&nbsp; 0% Commission
      </footer>
    </>
  )
}

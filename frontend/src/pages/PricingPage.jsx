import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../App.jsx'
import Header from '../components/Header.jsx'
import { isPromoActive } from '../contactTracker.js'
import { api } from '../api.js'

const PROMO_END = 'July 31, 2026'
const promoActive = isPromoActive()

const SELLER_PLANS = [
  {
    id: 'free',
    icon: '🆓', name: 'Free Listing', price: '₹0', period: '/month',
    desc: 'Get started and list your products for free.',
    promo: null,
    features: [
      { ok: true, text: 'Up to 5 product listings' },
      { ok: true, text: 'Direct buyer contact via WhatsApp & call' },
      { ok: true, text: 'Basic product page with photos' },
      { ok: true, text: 'Listed in all category feeds' },
      { ok: false, text: 'Verified badge on listings' },
      { ok: false, text: 'Priority search placement' },
      { ok: false, text: 'Advanced analytics' },
      { ok: false, text: 'Unlimited listings' },
    ],
    cta: 'Start for Free', ctaVariant: 'btn-outline-primary',
  },
  {
    id: 'verified',
    icon: '✅', name: 'Verified Seller', price: '₹49', period: '/month', featured: true, badge: 'Most Popular',
    desc: 'Build trust with buyers and get more leads with a Verified badge.',
    promo: `FREE until ${PROMO_END} — 3-month launch offer`,
    features: [
      { ok: true, text: 'Unlimited product listings' },
      { ok: true, text: 'Verified badge on every listing' },
      { ok: true, text: 'Priority placement in search results' },
      { ok: true, text: 'Advanced analytics (views, contacts, trends)' },
      { ok: true, text: 'Highlighted seller card with trust seal' },
      { ok: true, text: 'Priority customer support' },
      { ok: true, text: 'Direct buyer contact via WhatsApp & call' },
      { ok: true, text: '5× more buyer enquiries on average' },
    ],
    cta: promoActive ? 'Get Verified Free' : 'Subscribe — ₹49/month', ctaVariant: 'btn-purple',
  },
]

const BUYER_PLANS = [
  {
    id: 'free_buyer',
    icon: '🛒', name: 'Free Buyer', price: '₹0', period: '/month',
    desc: 'Browse freely and make up to 10 seller contacts per month.',
    promo: `All contacts unlimited during launch offer until ${PROMO_END}`,
    features: [
      { ok: true, text: '10 free seller contacts per month' },
      { ok: true, text: 'Browse all categories and listings' },
      { ok: true, text: 'WhatsApp & call sellers directly' },
      { ok: true, text: 'View full product details and photos' },
      { ok: false, text: 'More than 10 contacts/month' },
      { ok: false, text: 'Priority seller alerts' },
    ],
    cta: 'Browse Free', ctaVariant: 'btn-outline-primary', navigateTo: '/feed',
  },
  {
    id: 'contact_pack',
    icon: '📦', name: 'Contact Pack', price: '₹100', period: 'for 10 contacts',
    desc: 'Need a few more contacts? Buy a one-time pack.',
    promo: `FREE during launch — Offer till ${PROMO_END}`,
    features: [
      { ok: true, text: '10 additional seller contacts (one-time)' },
      { ok: true, text: 'Valid for 30 days from purchase' },
      { ok: true, text: 'Any category — full flexibility' },
      { ok: true, text: 'WhatsApp & call access' },
      { ok: false, text: 'Unlimited contacts' },
      { ok: false, text: 'Monthly rollover' },
    ],
    cta: promoActive ? 'Free During Offer' : 'Buy Pack — ₹100',
    ctaVariant: promoActive ? 'btn-outline-secondary' : 'btn-primary',
    planType: 'contact_pack',
  },
  {
    id: 'unlimited',
    icon: '♾️', name: 'Unlimited Buyer', price: '₹199', period: '/month', featured: true, badge: 'Best Value',
    desc: 'Contact any seller, as many times as you want, no limits.',
    promo: `FREE during launch — Offer till ${PROMO_END}`,
    features: [
      { ok: true, text: 'Unlimited seller contacts every month' },
      { ok: true, text: 'Contact same seller multiple times' },
      { ok: true, text: 'Priority new listing alerts by category' },
      { ok: true, text: 'WhatsApp & call access to all sellers' },
      { ok: true, text: 'Access across all 10 categories' },
      { ok: true, text: 'Cancel anytime' },
    ],
    cta: promoActive ? 'Free During Offer' : 'Subscribe — ₹199/month',
    ctaVariant: promoActive ? 'btn-outline-secondary' : 'btn-purple',
    planType: 'unlimited_buyer',
  },
]

function PlanCard({ plan, onCta }) {
  return (
    <div className={`plan-card-bb ${plan.featured ? 'featured' : ''} ${plan.id === 'verified' ? 'featured' : ''}`}>
      {plan.badge && (
        <div className="plan-badge-bb" style={{ background: plan.featured ? 'var(--bb-purple)' : 'var(--bb-green)' }}>
          {plan.badge}
        </div>
      )}
      <div style={{ fontSize: 32, marginBottom: 10 }}>{plan.icon}</div>
      <div className="fw-bold mb-1" style={{ fontSize: 17 }}>{plan.name}</div>
      <div className="text-muted mb-3" style={{ fontSize: 13, lineHeight: 1.5 }}>{plan.desc}</div>
      <div className="mb-2">
        <span style={{ fontSize: 28, fontWeight: 800 }}>{plan.price}</span>
        <span className="text-muted" style={{ fontSize: 13 }}> {plan.period}</span>
      </div>
      {plan.promo && (
        <div className="mb-2 px-3 py-2 rounded-3" style={{ background: 'var(--bb-green-light)', color: 'var(--bb-green)', fontSize: 12, fontWeight: 600 }}>
          🎉 {plan.promo}
        </div>
      )}
      <ul className="plan-feature-list">
        {plan.features.map((f, i) => (
          <li key={i}>
            <span className={f.ok ? 'fc' : 'fx'}>{f.ok ? '✓' : '✗'}</span>
            <span style={{ color: f.ok ? 'var(--bb-dark)' : '#d1d5db' }}>{f.text}</span>
          </li>
        ))}
      </ul>
      <button className={`btn ${plan.ctaVariant} w-100 mt-auto`} onClick={() => onCta(plan)}>
        {plan.cta}
      </button>
    </div>
  )
}

function UpiModal({ plan, onClose }) {
  const [upi, setUpi] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  async function handleSubscribe(e) {
    e.preventDefault()
    if (!upi.includes('@')) { setError('Enter a valid UPI ID (e.g. name@upi)'); return }
    setError(''); setLoading(true)
    try {
      await api.createSubscription({ plan_type: plan.planType, upi_id: upi })
      setSuccess(true)
    } catch (err) {
      setError(err.message)
    } finally { setLoading(false) }
  }

  return (
    <div className="modal d-block" style={{ background: 'rgba(0,0,0,0.6)' }}>
      <div className="modal-dialog modal-dialog-centered">
        <div className="modal-content border-0 rounded-4 p-4">
          {success ? (
            <div className="text-center py-3">
              <div style={{ fontSize: 48, marginBottom: 12 }}>✅</div>
              <h5 className="fw-bold mb-2">Subscription Initiated!</h5>
              <p className="text-muted" style={{ fontSize: 14 }}>
                A UPI autopay mandate request has been sent to <strong>{upi}</strong>. Approve it in your UPI app to activate your plan.
              </p>
              <button className="btn btn-primary w-100" onClick={onClose}>Done</button>
            </div>
          ) : (
            <>
              <div className="d-flex justify-content-between align-items-start mb-3">
                <div>
                  <h5 className="fw-bold mb-1">Subscribe — {plan.name}</h5>
                  <p className="text-muted mb-0" style={{ fontSize: 13 }}>{plan.price} {plan.period} via UPI Autopay</p>
                </div>
                <button className="btn-close" onClick={onClose} />
              </div>

              <div className="p-3 rounded-3 mb-3" style={{ background: 'var(--bb-green-light)', fontSize: 13 }}>
                <strong style={{ color: 'var(--bb-green)' }}>How UPI Autopay works:</strong>
                <ol className="mt-1 mb-0 ps-3" style={{ color: 'var(--bb-dark)', lineHeight: 1.8 }}>
                  <li>Enter your UPI ID below</li>
                  <li>You'll receive a mandate request in your UPI app</li>
                  <li>Approve it — subscription activates immediately</li>
                  <li>Payment is deducted automatically each month</li>
                </ol>
              </div>

              {error && <div className="error-msg-bb">⚠️ {error}</div>}

              <form onSubmit={handleSubscribe} noValidate>
                <div className="mb-3">
                  <label className="form-label fw-semibold" style={{ fontSize: 13 }}>Your UPI ID</label>
                  <input
                    className="form-control form-control-lg"
                    type="text"
                    placeholder="e.g. yourname@okaxis"
                    value={upi}
                    onChange={e => setUpi(e.target.value)}
                    autoFocus
                  />
                  <div className="form-text">Supported: @okaxis, @oksbi, @ybl, @paytm, @okhdfcbank, etc.</div>
                </div>
                <button className="btn btn-purple w-100 btn-lg" type="submit" disabled={loading}>
                  {loading ? 'Processing…' : `Activate — ${plan.price} ${plan.period}`}
                </button>
              </form>
              <p className="text-center text-muted mt-2 mb-0" style={{ fontSize: 12 }}>
                Powered by Razorpay &nbsp;·&nbsp; Cancel anytime &nbsp;·&nbsp; Secure & encrypted
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

const FAQ = [
  { q: 'Is the 3-month offer really free? No credit card needed?', a: 'Yes — completely free. No credit card, no payment details needed. During the launch period (until July 31, 2026), all plans including Verified Seller and Unlimited Buyer are free with full features.' },
  { q: 'What happens after July 31, 2026?', a: 'Verified Seller becomes ₹49/month and Unlimited Buyer becomes ₹199/month, billed via UPI Autopay. Free plans continue with their limits. You will receive advance notice before billing begins.' },
  { q: 'How does UPI Autopay work?', a: 'When you subscribe, you enter your UPI ID and approve a one-time mandate in your UPI app (PhonePe, GPay, Paytm, etc.). After that, payments are deducted automatically each month — no manual action needed. You can cancel anytime.' },
  { q: 'What does "Verified" mean for sellers?', a: 'Verified sellers display a blue checkmark badge on all their listings. This tells buyers the seller is a legitimate, trusted business on BulkBazaar. Verified listings are also placed higher in search results.' },
  { q: 'How are "contacts" counted for buyers?', a: 'Each time you tap WhatsApp or Call to contact a seller, that counts as one contact. The count resets each calendar month. During the launch offer, all contacts are free with no limits.' },
  { q: 'Is there any commission on sales?', a: 'No — zero commission, ever. BulkBazaar connects buyers and sellers directly. We only charge for the subscription plan, not your sales.' },
]

export default function PricingPage() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [upiModal, setUpiModal] = useState(null)

  function handleSellerCta(plan) {
    if (plan.id === 'free') { navigate(user ? '/dashboard' : '/login'); return }
    if (promoActive) { navigate(user ? '/dashboard' : '/login'); return }
    if (!user) { navigate('/login'); return }
    setUpiModal(plan)
  }

  function handleBuyerCta(plan) {
    if (plan.navigateTo) { navigate(plan.navigateTo); return }
    if (promoActive) return
    if (!user) { navigate('/login'); return }
    setUpiModal(plan)
  }

  return (
    <>
      <Header />
      <div style={{ background: 'var(--bb-bg)', minHeight: '100vh', paddingBottom: 64 }}>
        <div className="container py-5">
          {/* Hero */}
          <div className="text-center mb-5">
            <div className="pricing-promo-badge">🎉 3-Month Launch Offer — All Plans FREE until July 31, 2026</div>
            <h2 className="fw-bold mb-2" style={{ fontSize: 34 }}>Simple, Transparent Pricing</h2>
            <p className="text-muted mb-3" style={{ fontSize: 16, maxWidth: 500, margin: '0 auto 16px' }}>
              BulkBazaar is free to list and browse. Upgrade for verified badges and unlimited contacts — all free during our 3-month launch.
            </p>
            <div className="d-inline-flex align-items-center gap-3 px-4 py-2 rounded-3" style={{ background: 'white', border: '1px solid var(--bb-border)', fontSize: 13, color: 'var(--bb-muted)' }}>
              <span>✓ No credit card required</span>
              <span>·</span>
              <span>✓ Cancel anytime</span>
              <span>·</span>
              <span>✓ 0% commission on sales</span>
            </div>
          </div>

          {/* Seller plans */}
          <div className="mb-5">
            <div className="text-center mb-4">
              <div className="badge bg-light text-dark border mb-2" style={{ fontSize: 13, padding: '6px 14px' }}>🏪 For Sellers</div>
              <h4 className="fw-bold mb-1">Build Trust. Get More Leads.</h4>
              <p className="text-muted" style={{ fontSize: 14 }}>Listing is always free. Upgrade to Verified to get a trust badge and priority placement.</p>
            </div>
            <div className="row g-4 justify-content-center">
              {SELLER_PLANS.map((plan, i) => (
                <div key={i} className="col-md-5">
                  <PlanCard plan={plan} onCta={handleSellerCta} />
                </div>
              ))}
            </div>
          </div>

          <hr className="my-5" />

          {/* Buyer plans */}
          <div className="mb-5">
            <div className="text-center mb-4">
              <div className="badge bg-light text-dark border mb-2" style={{ fontSize: 13, padding: '6px 14px' }}>🛒 For Buyers</div>
              <h4 className="fw-bold mb-1">Contact Sellers Directly. No Commission.</h4>
              <p className="text-muted" style={{ fontSize: 14 }}>The first 10 seller contacts every month are free. Everything is free during our 3-month launch.</p>
            </div>
            <div className="row g-4 justify-content-center">
              {BUYER_PLANS.map((plan, i) => (
                <div key={i} className="col-md-4">
                  <PlanCard plan={plan} onCta={handleBuyerCta} />
                </div>
              ))}
            </div>
          </div>

          {/* FAQ */}
          <div style={{ maxWidth: 700, margin: '0 auto 48px' }}>
            <h4 className="fw-bold text-center mb-4">Frequently Asked Questions</h4>
            <div className="accordion" id="pricingFaq">
              {FAQ.map((item, i) => (
                <div key={i} className="accordion-item border rounded-3 mb-2" style={{ overflow: 'hidden' }}>
                  <h2 className="accordion-header">
                    <button
                      className="accordion-button collapsed fw-semibold"
                      style={{ fontSize: 14, background: 'white' }}
                      type="button"
                      data-bs-toggle="collapse"
                      data-bs-target={`#faq${i}`}
                    >
                      {item.q}
                    </button>
                  </h2>
                  <div id={`faq${i}`} className="accordion-collapse collapse" data-bs-parent="#pricingFaq">
                    <div className="accordion-body text-muted" style={{ fontSize: 14, lineHeight: 1.7 }}>
                      {item.a}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Bottom CTA */}
          <div className="text-center p-5 rounded-4" style={{ background: 'white', border: '1px solid var(--bb-border)' }}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>🚀</div>
            <h4 className="fw-bold mb-2">Ready to get started?</h4>
            <p className="text-muted mb-4" style={{ fontSize: 15, maxWidth: 400, margin: '0 auto 20px' }}>
              Join hundreds of Tamil Nadu businesses already on BulkBazaar. Free for 3 months — no credit card required.
            </p>
            <div className="d-flex gap-3 justify-content-center flex-wrap">
              <button className="btn btn-primary btn-lg px-4" onClick={() => navigate('/login')}>Start Selling Free</button>
              <button className="btn btn-outline-primary btn-lg px-4" onClick={() => navigate('/feed')}>Browse Listings</button>
            </div>
          </div>
        </div>
      </div>

      {upiModal && <UpiModal plan={upiModal} onClose={() => setUpiModal(null)} />}

      <footer className="bb-footer">
        Bulk<span className="accent fw-bold">Bazaar</span> &copy; 2025 &nbsp;·&nbsp; bulkbazaar.in &nbsp;·&nbsp; 0% Commission
      </footer>
    </>
  )
}

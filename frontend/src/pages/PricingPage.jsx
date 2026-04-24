import React from 'react'
import { useNavigate } from 'react-router-dom'
import Header from '../components/Header.jsx'

const PROMO_END = 'July 31, 2026'

const SELLER_PLANS = [
  {
    icon: '🆓',
    name: 'Free Listing',
    price: '₹0',
    period: '/month',
    desc: 'Get started and list your products for free.',
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
    cta: 'Start for Free',
    ctaStyle: 'btn-outline',
  },
  {
    icon: '✅',
    name: 'Verified Seller',
    price: '₹49',
    period: '/month',
    origPrice: null,
    desc: 'Build trust with buyers and get more leads with a Verified badge.',
    promo: `FREE until ${PROMO_END} — 3-month launch offer`,
    featured: true,
    badge: 'Most Popular',
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
    cta: 'Get Verified Free',
    ctaStyle: 'btn-purple',
  },
]

const BUYER_PLANS = [
  {
    icon: '🛒',
    name: 'Free Buyer',
    price: '₹0',
    period: '/month',
    desc: 'Browse freely and make up to 10 seller contacts per month.',
    promo: `FREE — All contacts unlimited until ${PROMO_END}`,
    features: [
      { ok: true, text: '10 free seller contacts per month' },
      { ok: true, text: 'Browse all categories and listings' },
      { ok: true, text: 'WhatsApp & call sellers directly' },
      { ok: true, text: 'View full product details and photos' },
      { ok: false, text: 'More than 10 contacts/month' },
      { ok: false, text: 'Priority seller alerts' },
    ],
    cta: 'Browse Free',
    ctaStyle: 'btn-outline',
    navigateTo: '/feed',
  },
  {
    icon: '📦',
    name: 'Contact Pack',
    price: '₹100',
    period: 'for 10 contacts',
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
    cta: 'Buy Pack — Coming Soon',
    ctaStyle: 'btn-secondary',
    disabled: true,
  },
  {
    icon: '♾️',
    name: 'Unlimited Buyer',
    price: '₹199',
    period: '/month',
    desc: 'Contact any seller, as many times as you want, no limits.',
    promo: `FREE during launch — Offer till ${PROMO_END}`,
    featured: true,
    badge: 'Best Value',
    features: [
      { ok: true, text: 'Unlimited seller contacts every month' },
      { ok: true, text: 'Contact same seller multiple times' },
      { ok: true, text: 'Priority new listing alerts by category' },
      { ok: true, text: 'WhatsApp & call access to all sellers' },
      { ok: true, text: 'Access across all 10 categories' },
      { ok: true, text: 'Cancel anytime' },
    ],
    cta: 'Subscribe — Coming Soon',
    ctaStyle: 'btn-secondary',
    disabled: true,
  },
]

function PlanCard({ plan, onCta }) {
  return (
    <div className={`plan-card ${plan.featured ? 'featured' : ''}`}>
      {plan.badge && <div className="plan-card-badge">{plan.badge}</div>}
      <div className="plan-card-icon">{plan.icon}</div>
      <div className="plan-card-name">{plan.name}</div>
      <div className="plan-card-desc">{plan.desc}</div>
      <div className="plan-card-price">
        <span className="plan-card-price-main">{plan.price}</span>
        <span className="plan-card-price-period">{plan.period}</span>
      </div>
      {plan.promo && <div className="plan-card-promo">🎉 {plan.promo}</div>}
      <ul className="plan-card-features">
        {plan.features.map((f, i) => (
          <li key={i}>
            <span className={f.ok ? 'plan-feature-check' : 'plan-feature-cross'}>{f.ok ? '✓' : '✗'}</span>
            <span style={{ color: f.ok ? 'var(--text)' : 'var(--text-light)' }}>{f.text}</span>
          </li>
        ))}
      </ul>
      <button
        className={`btn ${plan.ctaStyle} btn-block`}
        disabled={plan.disabled}
        onClick={() => onCta(plan)}
      >
        {plan.cta}
      </button>
    </div>
  )
}

export default function PricingPage() {
  const navigate = useNavigate()

  function handleSellerCta(plan) {
    if (plan.navigateTo) { navigate(plan.navigateTo); return }
    navigate('/login')
  }

  function handleBuyerCta(plan) {
    if (plan.navigateTo) { navigate(plan.navigateTo); return }
    navigate('/feed')
  }

  return (
    <>
      <Header />
      <div className="pricing-page">
        <div className="container">
          {/* Hero */}
          <div className="pricing-hero">
            <div className="pricing-hero-promo">
              🎉 3-Month Launch Offer — All Plans FREE until July 31, 2026
            </div>
            <h1 className="pricing-hero-title">Simple, Transparent Pricing</h1>
            <p className="pricing-hero-sub">
              BulkBazaar is free to list and browse. Upgrade for verified badges and unlimited contacts — and it's all free during our 3-month launch.
            </p>
            <div className="pricing-promo-box">
              ✓ No credit card required &nbsp;·&nbsp; ✓ Cancel anytime &nbsp;·&nbsp; ✓ 0% commission on sales
            </div>
          </div>

          {/* Seller Plans */}
          <div className="pricing-section">
            <div className="pricing-section-label">🏪 For Sellers</div>
            <div className="pricing-section-title">Build Trust. Get More Leads.</div>
            <div className="pricing-section-sub">
              Listing is always free. Upgrade to Verified to get a trust badge and priority placement — currently free for 3 months.
            </div>
            <div className="pricing-grid">
              {SELLER_PLANS.map((plan, i) => (
                <PlanCard key={i} plan={plan} onCta={handleSellerCta} />
              ))}
            </div>
          </div>

          <div className="pricing-divider">For Buyers</div>

          {/* Buyer Plans */}
          <div className="pricing-section">
            <div className="pricing-section-label">🛒 For Buyers</div>
            <div className="pricing-section-title">Contact Sellers Directly. No Commission.</div>
            <div className="pricing-section-sub">
              The first 10 seller contacts every month are free. Need more? Buy a contact pack or go unlimited — everything is free during our 3-month launch.
            </div>
            <div className="pricing-grid">
              {BUYER_PLANS.map((plan, i) => (
                <PlanCard key={i} plan={plan} onCta={handleBuyerCta} />
              ))}
            </div>
          </div>

          {/* FAQ */}
          <div className="pricing-faq">
            <div className="pricing-faq-title">Frequently Asked Questions</div>
            {[
              {
                q: 'Is the 3-month offer really free? No credit card needed?',
                a: 'Yes — completely free. No credit card, no payment details needed. During the launch period (until July 31, 2026), all plans including Verified Seller and Unlimited Buyer are free to use with full features.',
              },
              {
                q: 'What happens after the 3-month offer ends?',
                a: 'After July 31, 2026, Verified Seller will be ₹49/month and Unlimited Buyer will be ₹199/month. Free plans continue with their limits. You will receive advance notice before billing begins.',
              },
              {
                q: 'What does "Verified" mean for sellers?',
                a: 'Verified sellers display a blue checkmark badge on all their listings and profile. This tells buyers the seller is a legitimate, trusted business on BulkBazaar. Verified listings are also placed higher in search results.',
              },
              {
                q: 'How are "contacts" counted for buyers?',
                a: 'Each time you tap WhatsApp or Call to contact a seller, that counts as one contact. The count resets each calendar month. During the launch offer period, all contacts are free with no limits.',
              },
              {
                q: 'Can I list on BulkBazaar even without a Verified badge?',
                a: 'Yes. Listing is always free, forever. The Free plan allows up to 5 listings. The Verified plan removes this limit and adds the badge and priority features.',
              },
              {
                q: 'Is there any commission on sales made through BulkBazaar?',
                a: 'No — zero commission, ever. BulkBazaar connects buyers and sellers directly. Any deal you make is between you and the buyer. We only charge for the subscription plan, not your sales.',
              },
            ].map((item, i) => (
              <div key={i} className="pricing-faq-item">
                <div className="pricing-faq-q">{item.q}</div>
                <div className="pricing-faq-a">{item.a}</div>
              </div>
            ))}
          </div>

          {/* Bottom CTA */}
          <div style={{ textAlign: 'center', marginTop: 56, padding: '48px 24px', background: 'white', borderRadius: 20, border: '1px solid var(--border-light)' }}>
            <div style={{ fontSize: 36, marginBottom: 12 }}>🚀</div>
            <h2 style={{ fontSize: 26, fontWeight: 800, color: 'var(--dark)', marginBottom: 10 }}>Ready to get started?</h2>
            <p style={{ fontSize: 15, color: 'var(--text-muted)', marginBottom: 24, maxWidth: 420, margin: '0 auto 24px' }}>
              Join hundreds of Tamil Nadu businesses already on BulkBazaar. Free for 3 months — no credit card required.
            </p>
            <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
              <button className="btn btn-primary btn-lg" onClick={() => navigate('/login')}>
                Start Selling Free
              </button>
              <button className="btn btn-outline btn-lg" onClick={() => navigate('/feed')}>
                Browse Listings
              </button>
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

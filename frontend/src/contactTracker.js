export const PROMO_END = new Date('2026-07-31T23:59:59')
export const isPromoActive = () => new Date() < PROMO_END
export const FREE_CONTACTS = 10

function currentMonth() {
  return new Date().toISOString().slice(0, 7)
}

export function getContactStats() {
  const month = currentMonth()
  try {
    const s = JSON.parse(localStorage.getItem('sdm_contacts') || '{}')
    if (s.month !== month) return { count: 0, month }
    return s
  } catch {
    return { count: 0, month: currentMonth() }
  }
}

export function incrementContact() {
  const s = getContactStats()
  s.count = (s.count || 0) + 1
  localStorage.setItem('sdm_contacts', JSON.stringify(s))
  return s.count
}

export function remainingFree() {
  if (isPromoActive()) return Infinity
  return Math.max(0, FREE_CONTACTS - getContactStats().count)
}

export function canContact() {
  return isPromoActive() || getContactStats().count < FREE_CONTACTS
}

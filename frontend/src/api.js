const BASE = import.meta.env.VITE_API_URL || ''

function getToken() {
  return localStorage.getItem('sdm_token')
}

function authHeaders() {
  const token = getToken()
  return token ? { Authorization: `Bearer ${token}` } : {}
}

function parseError(data) {
  if (!data) return 'Request failed'
  if (typeof data.detail === 'string') return data.detail
  if (Array.isArray(data.detail)) return data.detail.map(e => e.msg || String(e)).join(', ')
  if (data.message) return data.message
  return 'Request failed'
}

async function request(method, path, body, isForm = false) {
  const headers = { ...authHeaders() }
  let bodyData

  if (body && !isForm) {
    headers['Content-Type'] = 'application/json'
    bodyData = JSON.stringify(body)
  } else if (isForm) {
    bodyData = body
  }

  let res
  try {
    res = await fetch(BASE + path, { method, headers, body: bodyData })
  } catch {
    throw new Error('Cannot connect to server. Please check your connection.')
  }

  const data = await res.json().catch(() => ({}))
  if (!res.ok) throw new Error(parseError(data))
  return data
}

export const api = {
  requestOtp: (phone) => request('POST', '/auth/request-otp', { phone }),

  verifyOtp: (phone, otp) => request('POST', '/auth/verify-otp', { phone, otp }),

  getMe: () => request('GET', '/auth/me'),

  updateMe: (data) => request('PUT', '/auth/me', data),

  getListings: (params = {}) => {
    const qs = new URLSearchParams(
      Object.fromEntries(Object.entries(params).filter(([, v]) => v != null && v !== ''))
    ).toString()
    return request('GET', `/listings${qs ? '?' + qs : ''}`)
  },

  getListing: (id) => request('GET', `/listings/${id}`),

  getMyListings: () => request('GET', '/listings/my-listings'),

  createListing: (data) => request('POST', '/listings', data),

  updateListing: (id, data) => request('PUT', `/listings/${id}`, data),

  deleteListing: (id) => request('DELETE', `/listings/${id}`),

  trackView: (listing_id) => request('POST', '/events/view', { listing_id, event_type: 'view' }),

  trackContact: (listing_id) => request('POST', '/events/contact', { listing_id, event_type: 'contact' }),

  uploadImage: (file) => {
    const form = new FormData()
    form.append('file', file)
    return request('POST', '/upload/image', form, true)
  },

  uploadVideo: (file) => {
    const form = new FormData()
    form.append('file', file)
    return request('POST', '/upload/video', form, true)
  },

  createSubscription: (data) => request('POST', '/payment/create-subscription', data),

  getPaymentConfig: () => request('GET', '/payment/config'),
}

const API_BASE = import.meta.env.VITE_API_URL || ''

async function request(path, options = {}) {
  const response = await fetch(`${API_BASE}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    },
    ...options,
  })

  const payload = await response.json().catch(() => ({}))

  if (!response.ok) {
    const error = new Error(payload.message || 'Request failed')
    error.status = response.status
    error.errors = payload.errors || []
    throw error
  }

  return payload
}

export function signup({ name, email, password }) {
  return request('/api/v1/auth/signup', {
    method: 'POST',
    body: JSON.stringify({ name, email, password }),
  })
}

export function signin({ email, password }) {
  return request('/api/v1/auth/signin', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  })
}

export function getProfile(token) {
  return request('/api/v1/auth/profile', {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })
}

const BASE_URL = import.meta.env.VITE_API_URL

const request = async (path, options = {}) => {
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  })

  if (!res.ok) {
    let serverMessage = ''
    try {
      const body = await res.json()
      serverMessage = body.error || body.message || ''
    } catch {}
    throw new Error(`API 錯誤 ${res.status}: ${serverMessage || res.statusText} (${options.method || 'GET'} ${path})`)
  }

  // 204 No Content 沒有 body，直接回傳 null
  if (res.status === 204) return null

  return res.json()
}

export const api = {
  get: (path) => request(path),
  post: (path, body) => request(path, { method: 'POST', body: JSON.stringify(body) }),
  put: (path, body) => request(path, { method: 'PUT', body: JSON.stringify(body) }),
  patch: (path) => request(path, { method: 'PATCH' }),
  delete: (path) => request(path, { method: 'DELETE' }),
}

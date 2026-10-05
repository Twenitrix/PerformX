import axios from 'axios'

const TOKEN_KEY = 'performx.token'

export const tokenStore = {
  get: () => localStorage.getItem(TOKEN_KEY) || sessionStorage.getItem(TOKEN_KEY),
  set: (t, remember) => {
    tokenStore.clear()
    ;(remember ? localStorage : sessionStorage).setItem(TOKEN_KEY, t)
  },
  clear: () => { localStorage.removeItem(TOKEN_KEY); sessionStorage.removeItem(TOKEN_KEY) },
}

export const http = axios.create({ baseURL: '/api/v1', timeout: 15000 })

http.interceptors.request.use((cfg) => {
  const t = tokenStore.get()
  if (t) cfg.headers.Authorization = `Bearer ${t}`
  return cfg
})

let onUnauthorized = () => {}
export const setUnauthorizedHandler = (fn) => { onUnauthorized = fn }

http.interceptors.response.use(
  (r) => r.data?.data,
  (err) => {
    const status = err.response?.status
    if (status === 401 && !err.config.url.includes('/auth/login')) onUnauthorized()
    const message = err.response?.data?.message || (status === 403 ? 'You do not have permission for this action.' : err.message === 'Network Error' ? 'Cannot reach the PERFORMX server. Is the backend running?' : 'Something went wrong')
    return Promise.reject(Object.assign(new Error(message), { status }))
  },
)

export const api = {
  login: (identifier, password) => http.post('/auth/login', { identifier, password, device: deviceLabel() }),
  me: () => http.get('/auth/me'),
  logout: () => http.post('/auth/logout'),
  notifications: () => http.get('/notifications'),
  search: (q) => http.get('/search', { params: { q } }),
  chats: () => http.get('/chats'),
  messages: (id) => http.get(`/chats/${id}/messages`),
  send: (body) => http.post('/chats/messages', body),
  aiFeedback: (employeeId) => http.post('/ai/generate-feedback', { employeeId }),
  admin: {
    overview: () => http.get('/admin/overview'),
    users: () => http.get('/admin/users'),
    employees: () => http.get('/admin/employees'),
    supervisors: () => http.get('/admin/supervisors'),
    tasks: () => http.get('/admin/tasks'),
    activity: () => http.get('/admin/activity'),
    analytics: () => http.get('/admin/analytics'),
    createUser: (b) => http.post('/admin/users', b),
    updateUser: (id, b) => http.patch(`/admin/users/${id}`, b),
    setStatus: (id, active) => http.patch(`/admin/users/${id}/status`, { active }),
    logs: () => http.get('/admin/logs'),
    deleteLogs: (ids) => http.post('/admin/logs/delete', { ids }),
    chats: () => http.get('/admin/chats'),
    messages: (id) => http.get(`/admin/chats/${id}/messages`),
    removeChat: (id) => http.delete(`/admin/chats/${id}`),
  },
  sup: {
    dashboard: () => http.get('/supervisor/dashboard'),
    team: () => http.get('/supervisor/team'),
    member: (id) => http.get(`/supervisor/team/${id}`),
    tasks: () => http.get('/supervisor/tasks'),
    assign: (b) => http.post('/supervisor/tasks', b),
    edit: (id, b) => http.patch(`/supervisor/tasks/${id}`, b),
    feedback: (id, feedback) => http.post(`/supervisor/tasks/${id}/feedback`, { feedback }),
    review: (id) => http.post(`/supervisor/tasks/${id}/review`),
    reviews: () => http.get('/supervisor/reviews'),
    submitReview: (b) => http.post('/supervisor/reviews', b),
    logs: () => http.get('/supervisor/logs'),
  },
  emp: {
    dashboard: () => http.get('/employee/dashboard'),
    tasks: () => http.get('/employee/tasks'),
    progress: (id, progress, update) => http.patch(`/employee/tasks/${id}/progress`, { progress, update }),
    complete: (id) => http.post(`/employee/tasks/${id}/complete`),
    performance: () => http.get('/employee/performance'),
    feedback: () => http.get('/employee/feedback'),
    activity: () => http.get('/employee/activity'),
  },
}

function deviceLabel() {
  const ua = navigator.userAgent
  const browser = /Edg\//.test(ua) ? 'Edge' : /Chrome\//.test(ua) ? 'Chrome' : /Firefox\//.test(ua) ? 'Firefox' : /Safari\//.test(ua) ? 'Safari' : 'Browser'
  const os = /Windows/.test(ua) ? 'Windows' : /Mac OS/.test(ua) ? 'macOS' : /Android/.test(ua) ? 'Android' : /iPhone|iPad/.test(ua) ? 'iOS' : /Linux/.test(ua) ? 'Linux' : 'Unknown OS'
  return `${browser} · ${os}`
}

import axios from 'axios'

const api = axios.create({ baseURL: '/api' })

api.interceptors.request.use(cfg => {
  const token = localStorage.getItem('fwms_token')
  if (token) cfg.headers.Authorization = `Bearer ${token}`
  return cfg
})

api.interceptors.response.use(
  r => r,
  err => {
    if (err.response?.status === 401) {
      localStorage.removeItem('fwms_token')
      localStorage.removeItem('fwms_user')
      window.location.href = '/login'
    }
    return Promise.reject(err)
  }
)

// ─── Auth ───────────────────────────────────────────────
export const authAPI = {
  login:           data => api.post('/auth/login', data),
  registerFarmer:  fd   => api.post('/auth/register/farmer', fd, { headers: { 'Content-Type': 'multipart/form-data' } }),
  registerWorker:  fd   => api.post('/auth/register/worker', fd, { headers: { 'Content-Type': 'multipart/form-data' } }),
  me:              ()   => api.get('/auth/me'),
}

// ─── Tasks ──────────────────────────────────────────────
export const taskAPI = {
  getAll:      ()         => api.get('/tasks'),
  getById:     id         => api.get(`/tasks/${id}`),
  create:      data       => api.post('/tasks', data),
  update:      (id, data) => api.put(`/tasks/${id}`, data),
  delete:      id         => api.delete(`/tasks/${id}`),
  accept:      id         => api.post(`/tasks/${id}/accept`),
  reject:      id         => api.post(`/tasks/${id}/reject`),
  complete:    id         => api.post(`/tasks/${id}/complete`),
  getMyTasks:  ()         => api.get('/tasks/my'),
  getAvailable:()         => api.get('/tasks/available'),
}

// ─── Users ──────────────────────────────────────────────
export const userAPI = {
  getFarmers:  () => api.get('/users/farmers'),
  getWorkers:  () => api.get('/users/workers'),
  getAll:      () => api.get('/users'),
  getById:     id => api.get(`/users/${id}`),
  delete:      id => api.delete(`/users/${id}`),
  updateStatus:(id, status) => api.patch(`/users/${id}/status`, { status }),
}

// ─── Chat ───────────────────────────────────────────────
export const chatAPI = {
  getMessages: taskId => api.get(`/chat/${taskId}`),
  sendMessage: (taskId, message) => api.post(`/chat/${taskId}`, { message }),
}

// ─── Dashboard ──────────────────────────────────────────
export const dashboardAPI = {
  adminStats:  () => api.get('/dashboard/admin'),
  adminCharts: () => api.get('/dashboard/admin/charts'),
  farmerStats: () => api.get('/dashboard/farmer'),
  workerStats: () => api.get('/dashboard/worker'),
}

// ─── Ratings ────────────────────────────────────────────
export const ratingAPI = {
  submit:       (taskId, data)  => api.post(`/ratings/task/${taskId}`, data),
  getForUser:   (userId)        => api.get(`/ratings/user/${userId}`),
  getForTask:   (taskId)        => api.get(`/ratings/task/${taskId}`),
  myRating:     (taskId)        => api.get(`/ratings/task/${taskId}/my`),
}

export default api

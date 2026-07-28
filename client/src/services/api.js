import axios from 'axios';
import { API_URL } from '../utils/constants';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(
  (config) => {
    const token = sessionStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      sessionStorage.removeItem('token');
      sessionStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  logout: () => api.post('/auth/logout'),
  getMe: () => api.get('/auth/me'),
  verify: (data) => api.post('/auth/verify', data),
};

export const userAPI = {
  getProfile: () => api.get('/users/profile'),
  updateProfile: (data) => api.put('/users/profile', data),
  updatePassword: (data) => api.put('/users/password', data),
};

export const serviceAPI = {
  getAll: (params) => api.get('/services', { params }),
  getById: (id) => api.get(`/services/${id}`),
  create: (data) => api.post('/services', data),
  update: (id, data) => api.put(`/services/${id}`, data),
  delete: (id) => api.delete(`/services/${id}`),
  getMyServices: () => api.get('/services/my'),
  getRecentEvents: (id) => api.get(`/services/${id}/recent-events`),
};

export const bookingAPI = {
  getAll: (params) => api.get('/bookings', { params }),
  getById: (id) => api.get(`/bookings/${id}`),
  create: (data) => api.post('/bookings', data),
  confirm: (id) => api.put(`/bookings/${id}/confirm`),
  reject: (id, data) => api.put(`/bookings/${id}/reject`, data),
  cancel: (id, data) => api.put(`/bookings/${id}/cancel`, data),
  complete: (id) => api.put(`/bookings/${id}/complete`),
  updateStatus: (id, status) => api.put(`/bookings/${id}/status`, { status }),
  getServiceBookings: (serviceId) => api.get(`/bookings/service/${serviceId}`),
  getAvailableSlots: (serviceId, date) => api.get(`/availability/${serviceId}/available`, { params: { date } }),
};

export const availabilityAPI = {
  get: (serviceId, params) => api.get(`/availability/${serviceId}`, { params }),
  set: (serviceId, data) => api.post(`/availability/${serviceId}`, data),
  delete: (serviceId, slotId) => api.delete(`/availability/${serviceId}/slots/${slotId}`),
  getAvailable: (serviceId, date) => api.get(`/availability/${serviceId}/available`, { params: { date } }),
  getCalendar: (serviceId, month, year) => api.get(`/availability/${serviceId}/calendar`, { params: { month, year } }),
  getTimeSlots: () => api.get('/availability/slots'),
};

export const locationAPI = {
  getCities: () => api.get('/cities'),
  getAreas: (cityId) => api.get(`/cities/${cityId}/areas`),
};

export const reviewAPI = {
  getByService: (serviceId, params) => api.get(`/reviews/service/${serviceId}`, { params }),
  create: (data) => api.post('/reviews', data),
  update: (id, data) => api.put(`/reviews/${id}`, data),
  delete: (id) => api.delete(`/reviews/${id}`),
  canReview: (bookingId) => api.get(`/reviews/can-review/${bookingId}`),
};

export const paymentAPI = {
  createOrder: (data) => api.post('/payments/create-order', data),
  verify: (data) => api.post('/payments/verify', data),
  getById: (id) => api.get(`/payments/${id}`),
  getByBooking: (bookingId) => api.get(`/payments/booking/${bookingId}`),
  mockSuccess: (orderId) => api.post(`/payments/mock-success/${orderId}`),
  markCashPayment: (bookingId) => api.post(`/payments/cash/${bookingId}`),
};

export const dishAPI = {
  getByService: (serviceId) => api.get(`/dishes/${serviceId}`),
  add: (serviceId, data) => api.post(`/dishes/${serviceId}`, data),
  update: (dishId, data) => api.put(`/dishes/${dishId}`, data),
  delete: (dishId) => api.delete(`/dishes/${dishId}`),
};

export const historyAPI = {
  getByService: (serviceId, params) => api.get(`/history/${serviceId}`, { params }),
  add: (serviceId, data) => api.post(`/history/${serviceId}`, data),
  update: (eventId, data) => api.put(`/history/${eventId}`, data),
  delete: (eventId) => api.delete(`/history/${eventId}`),
  setFeatured: (eventId) => api.put(`/history/${eventId}/feature`),
  unsetFeatured: (eventId) => api.put(`/history/${eventId}/unfeature`),
};

export const messageAPI = {
  getConversations: () => api.get('/messages/conversations'),
  getConversation: (id, params) => api.get(`/messages/conversations/${id}`, { params }),
  createConversation: (data) => api.post('/messages/conversations', data),
  sendMessage: (conversationId, data) => api.post(`/messages/conversations/${conversationId}/messages`, data),
  getUnreadCount: () => api.get('/messages/unread-count'),
};

export const notificationAPI = {
  getAll: (params) => api.get('/notifications', { params }),
  getUnreadCount: () => api.get('/notifications/unread-count'),
  markAsRead: (id) => api.put(`/notifications/${id}/read`),
  markAllAsRead: () => api.put('/notifications/read-all'),
  delete: (id) => api.delete(`/notifications/${id}`),
};

export const adminAPI = {
  getDashboard: () => api.get('/admin/dashboard'),
  getUsers: (params) => api.get('/admin/users', { params }),
  getUser: (id) => api.get(`/admin/users/${id}`),
  verifyUser: (id) => api.put(`/admin/users/${id}/verify`),
  unverifyUser: (id) => api.put(`/admin/users/${id}/unverify`),
  activateUser: (id) => api.put(`/admin/users/${id}/activate`),
  deactivateUser: (id) => api.put(`/admin/users/${id}/deactivate`),
  getServices: (params) => api.get('/admin/services', { params }),
  verifyService: (id) => api.put(`/admin/services/${id}/verify`),
  unverifyService: (id) => api.put(`/admin/services/${id}/unverify`),
  activateService: (id) => api.put(`/admin/services/${id}/activate`),
  deactivateService: (id) => api.put(`/admin/services/${id}/deactivate`),
  getBookings: (params) => api.get('/admin/bookings', { params }),
  getBooking: (id) => api.get(`/admin/bookings/${id}`),
  updateBookingStatus: (id, status) => api.put(`/admin/bookings/${id}/status`, { status }),
  getCities: () => api.get('/admin/locations/cities'),
  createCity: (data) => api.post('/admin/locations/cities', data),
  updateCity: (id, data) => api.put(`/admin/locations/cities/${id}`, data),
  deleteCity: (id) => api.delete(`/admin/locations/cities/${id}`),
  getAreas: (cityId) => api.get('/admin/locations/areas', { params: { city_id: cityId } }),
  createArea: (data) => api.post('/admin/locations/areas', data),
  updateArea: (id, data) => api.put(`/admin/locations/areas/${id}`, data),
  deleteArea: (id) => api.delete(`/admin/locations/areas/${id}`),
  getAnalytics: (period) => api.get('/admin/analytics', { params: { period } }),
};

export const chatAPI = {
  sendMessage: (data) => api.post('/chat/message', data),
  getHistory: (sessionId) => api.get(`/chat/history/${sessionId}`),
  getSimilar: (serviceId) => api.get(`/chat/similar/${serviceId}`),
};

export default api;

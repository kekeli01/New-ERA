/**
 * ⭐ IMPORTANT: API Client for all backend requests
 * Base URL should be updated for production
 */

import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// ⭐ Important: Add phone to Authorization header for customer requests
const api = axios.create({
  baseURL: API_BASE_URL,
});

// Request interceptor to add authorization
api.interceptors.request.use((config) => {
  const phone = localStorage.getItem('customerPhone');
  const adminToken = localStorage.getItem('adminToken');
  
  if (phone && !config.headers.Authorization) {
    config.headers.Authorization = `Bearer ${phone}`;
  } else if (adminToken) {
    config.headers.Authorization = `Bearer ${adminToken}`;
  }
  
  return config;
});

// ==================== AUTHENTICATION ====================

export const authAPI = {
  sendOTP: (phone) => api.post('/auth/send-otp', { phone }),
  
  verifyOTP: (phone, otp_code, name, email) =>
    api.post('/auth/verify-otp', { phone, otp_code, name, email }),
  
  adminLogin: (username, password) =>
    api.post('/auth/admin/login', { username, password })
};

// ==================== PASTRIES ====================

export const pastriesAPI = {
  getAllPastries: (categoryId = null, page = 1, limit = 20) =>
    api.get('/pastries', { params: { category_id: categoryId, page, limit } }),
  
  getPastryById: (id) => api.get(`/pastries/${id}`),
  
  getCategories: () => api.get('/pastries/categories'),
  
  // Admin endpoints
  createPastry: (data) => api.post('/pastries', data),
  
  updatePastry: (id, data) => api.put(`/pastries/${id}`, data),
  
  deletePastry: (id) => api.delete(`/pastries/${id}`),
  
  updateStock: (id, qty, reason) =>
    api.patch(`/pastries/stock/${id}`, { qty, reason })
};

// ==================== ORDERS ====================

export const ordersAPI = {
  // Customer endpoints
  createOrder: (items, deliveryType, paymentMethod, deliveryAddress, deliveryZone) =>
    api.post('/orders', {
      items,
      delivery_type: deliveryType,
      payment_method: paymentMethod,
      delivery_address: deliveryAddress,
      delivery_zone: deliveryZone
    }),
  
  getOrder: (id) => api.get(`/orders/${id}`),
  
  getMyOrders: () => api.get('/orders'),
  
  // Admin endpoints
  getAllOrders: (status = null, page = 1) =>
    api.get('/admin/orders', { params: { status, page } }),
  
  updateOrderStatus: (id, status) =>
    api.patch(`/admin/orders/${id}/status`, { status }),
  
  cancelOrder: (id) => api.delete(`/admin/orders/${id}`)
};

// ==================== ADMIN DASHBOARD ====================

export const adminAPI = {
  getDashboard: () => api.get('/admin/dashboard'),
  
  getStockAlerts: () => api.get('/admin/stock-alerts'),
  
  getStockHistory: (pastryId, page = 1) =>
    api.get(`/admin/stock-history/${pastryId}`, { params: { page } }),
  
  getNotifications: (status = null, page = 1) =>
    api.get('/admin/notifications', { params: { status, page } }),
  
  getCustomers: (page = 1) => api.get('/admin/customers', { params: { page } }),
  
  getCustomerOrders: (customerId) =>
    api.get(`/admin/customers/${customerId}/orders`),
  
  getRevenueAnalytics: (period = 'day') =>
    api.get('/admin/analytics/revenue', { params: { period } }),
  
  getSystemHealth: () => api.get('/admin/health')
};

export default api;

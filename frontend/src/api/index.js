import axios from 'axios';
import { showToast } from 'vant';

const api = axios.create({
  baseURL: '/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
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
  (response) => {
    const { data } = response;
    if (data.success) {
      return data.data;
    } else {
      showToast(data.message || '请求失败');
      return Promise.reject(new Error(data.message));
    }
  },
  (error) => {
    const message = error.response?.data?.message || error.message || '网络错误';
    showToast(message);
    return Promise.reject(error);
  }
);

export const productApi = {
  getAll: (params) => api.get('/products', { params }),
  getById: (id) => api.get(`/products/${id}`),
  getByType: (type, params) => api.get(`/products/type/${type}`, { params }),
  getHot: (params) => api.get('/products/hot', { params }),
  create: (data) => api.post('/products', data),
  update: (id, data) => api.put(`/products/${id}`, data),
  delete: (id) => api.delete(`/products/${id}`)
};

export const orderApi = {
  getAll: (params) => api.get('/orders', { params }),
  getById: (id) => api.get(`/orders/${id}`),
  getByOrderNo: (orderNo) => api.get(`/orders/orderNo/${orderNo}`),
  create: (data) => api.post('/orders', data),
  updateStatus: (id, data) => api.put(`/orders/${id}/status`, data),
  pay: (id, data) => api.post(`/orders/${id}/pay`, data),
  getStatistics: (params) => api.get('/orders/statistics', { params })
};

export const deliveryApi = {
  getPersons: (params) => api.get('/delivery/persons', { params }),
  createPerson: (data) => api.post('/delivery/persons', data),
  updatePerson: (id, data) => api.put(`/delivery/persons/${id}`, data),
  updatePersonLocation: (id, data) => api.put(`/delivery/persons/${id}/location`, data),
  getPending: (params) => api.get('/delivery/pending', { params }),
  assign: (data) => api.post('/delivery/assign', data),
  batchAssign: (data) => api.post('/delivery/batch-assign', data),
  confirm: (data) => api.post('/delivery/confirm', data),
  optimizeRoute: (data) => api.post('/delivery/optimize-route', data)
};

export const greetingCardApi = {
  getAll: (params) => api.get('/greeting-cards', { params }),
  getById: (id) => api.get(`/greeting-cards/${id}`),
  getByCategory: (category, params) => api.get(`/greeting-cards/category/${category}`, { params }),
  getByHoliday: (holiday, params) => api.get(`/greeting-cards/holiday/${holiday}`, { params }),
  getPremium: (params) => api.get('/greeting-cards/premium', { params }),
  create: (data) => api.post('/greeting-cards', data),
  update: (id, data) => api.put(`/greeting-cards/${id}`, data),
  delete: (id) => api.delete(`/greeting-cards/${id}`)
};

export const promotionApi = {
  getAll: (params) => api.get('/holiday-promotions', { params }),
  getActive: () => api.get('/holiday-promotions/active'),
  getUpcoming: () => api.get('/holiday-promotions/upcoming'),
  getById: (id) => api.get(`/holiday-promotions/${id}`),
  getProducts: (id, params) => api.get(`/holiday-promotions/${id}/products`, { params }),
  create: (data) => api.post('/holiday-promotions', data),
  update: (id, data) => api.put(`/holiday-promotions/${id}`, data),
  delete: (id) => api.delete(`/holiday-promotions/${id}`),
  publish: (id) => api.post(`/holiday-promotions/${id}/publish`),
  cancel: (id) => api.post(`/holiday-promotions/${id}/cancel`)
};

export const authApi = {
  login: (data) => api.post('/auth/login', data),
  register: (data) => api.post('/auth/register', data),
  getCurrentUser: () => api.get('/auth/me'),
  updateProfile: (data) => api.put('/auth/profile', data),
  changePassword: (data) => api.put('/auth/change-password', data)
};

export const cartApi = {
  getCart: () => api.get('/carts'),
  addToCart: (data) => api.post('/carts/add', data),
  updateQuantity: (data) => api.put('/carts/quantity', data),
  removeFromCart: (cartId) => api.delete(`/carts/${cartId}`),
  clearCart: () => api.post('/carts/clear')
};

export default api;

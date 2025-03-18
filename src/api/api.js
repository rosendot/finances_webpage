import axios from 'axios';

// Base URL configuration - can be changed for different environments
const API_BASE_URL = 'http://localhost:5000/api';

// Create an axios instance with default config
const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json'
    }
});

// Response interceptor to directly return data and handle errors
api.interceptors.response.use(
    response => response.data,
    error => {
        console.error('API Error:', error);
        return Promise.reject(error);
    }
);

// Revenue API endpoints
export const revenueApi = {
    getAll: () => api.get('/revenue'),
    getById: (id) => api.get(`/revenue/${id}`),
    create: (data) => api.post('/revenue', data),
    update: (id, data) => api.put(`/revenue/${id}`, data),
    delete: (id) => api.delete(`/revenue/${id}`),
    bulkDelete: (ids) => api.delete('/revenue/bulk', { data: { ids } }),
    bulkCreate: (items) => api.post('/revenue/bulk', { items })
};

// Expenses API endpoints
export const expensesApi = {
    getAll: () => api.get('/expenses'),
    getById: (id) => api.get(`/expenses/${id}`),
    create: (data) => api.post('/expenses', data),
    update: (id, data) => api.put(`/expenses/${id}`, data),
    delete: (id) => api.delete(`/expenses/${id}`),
    bulkDelete: (ids) => api.delete('/expenses/bulk', { data: { ids } }),
    bulkCreate: (items) => api.post('/expenses/bulk', { items })
};

// Monthly data API functions (for reports)
export const reportApi = {
    getMonthlyData: (year) => api.get(`/monthly-data/${year}`),
    saveMonthlyReport: (data) => api.post('/monthly-report', data),
    getYearlySummary: (year) => api.get(`/yearly-summary/${year}`)
};

// Main export with all API namespaces
export default {
    revenue: revenueApi,
    expenses: expensesApi,
    report: reportApi
};
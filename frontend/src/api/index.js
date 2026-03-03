import axios from 'axios';

const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000/api',
});

// Add Interceptor for Token
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// Auth API
export const login = async (credentials) => {
    const response = await api.post('/auth/login', credentials);
    return response.data;
};

export const register = async (userData) => {
    const response = await api.post('/auth/register', userData);
    return response.data;
};

export const guestLogin = async () => {
    const response = await api.post('/auth/guest-login');
    return response.data;
};

// Income API
export const getIncomes = async () => {
    const response = await api.get('/incomes');
    return response.data;
};

export const logIncome = async (data) => {
    const response = await api.post('/incomes', data);
    return response.data;
};

export const deleteIncome = async (id) => {
    const response = await api.delete(`/incomes/${id}`);
    return response.data;
};

export const getDashboardAnalytics = async (month, year) => {
    const params = {};
    if (month) params.month = month;
    if (year) params.year = year;
    const response = await api.get('/dashboard', { params });
    return response.data;
};

export const sendChatMessage = async (message) => {
    const response = await api.post('/chat', { message });
    return response.data;
};

export const uploadCSV = async (formData) => {
    const response = await api.post('/upload', formData, {
        headers: {
            'Content-Type': 'multipart/form-data',
        },
    });
    return response.data;
};

export const getHistory = async () => {
    const response = await api.get('/history');
    return response.data;
};

export const deleteExpense = async (id) => {
    const response = await api.delete(`/expenses/${id}`);
    return response.data;
};

export const updateExpense = async (id, data) => {
    const response = await api.put(`/expenses/${id}`, data);
    return response.data;
};

export const deleteLastExpense = async () => {
    const response = await api.delete('/expenses/last');
    return response.data;
};

export default api;

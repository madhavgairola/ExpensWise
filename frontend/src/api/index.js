import axios from 'axios';

const api = axios.create({
    baseURL: 'http://localhost:3000/api',
});

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

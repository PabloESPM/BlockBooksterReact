import apiClient from '../api/client';

export const authService = {
    getUser: async () => {
        const response = await apiClient.get('/auth/user');
        return response.data.data;
    },
    
    csrfCookie: async () => {
        return apiClient.get('/sanctum/csrf-cookie', { baseURL: '' });
    },
    
    login: async (email, password) => {
        await authService.csrfCookie();
        const response = await apiClient.post('/auth/login', { email, password });
        return response.data;
    },
    
    register: async (data) => {
        await authService.csrfCookie();
        const response = await apiClient.post('/auth/register', data);
        return response.data;
    },
    
    logout: async () => {
        const response = await apiClient.post('/auth/logout');
        return response.data;
    }
};

export default authService;

import apiClient from '../api/client';

export const userService = {
    getUserProfile: async (id) => {
        const response = await apiClient.get(`/users/${id}`);
        return response.data;
    },
    
    getUserLists: async (id, params) => {
        const response = await apiClient.get(`/users/${id}/lists`, { params });
        return response.data;
    },
    
    getUserAuthors: async (id, params) => {
        const response = await apiClient.get(`/users/${id}/authors`, { params });
        return response.data;
    },
    
    getUserFollowing: async (id, params) => {
        const response = await apiClient.get(`/users/${id}/following`, { params });
        return response.data;
    },
    
    getUserFollowers: async (id, params) => {
        const response = await apiClient.get(`/users/${id}/followers`, { params });
        return response.data;
    },
    
    getUserBooks: async (id, params) => {
        const response = await apiClient.get(`/users/${id}/books`, { params });
        return response.data;
    },
    
    getUserReviews: async (id, params) => {
        const response = await apiClient.get(`/users/${id}/reviews`, { params });
        return response.data;
    },
    
    toggleFollowUser: async (id) => {
        const response = await apiClient.post(`/users/${id}/follow`);
        return response.data;
    },
    
    toggleFollowAuthor: async (id) => {
        const response = await apiClient.post(`/authors/${id}/follow`);
        return response.data;
    },
    
    getDashboard: async () => {
        const response = await apiClient.get('/dashboard');
        return response.data;
    },
    
    getDashboardProfile: async () => {
        const response = await apiClient.get('/dashboard/profile');
        return response.data;
    },
    
    updateDashboardProfile: async (formData) => {
        const response = await apiClient.post('/dashboard/profile', formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
        });
        return response.data;
    },
    
    getDashboardSettings: async () => {
        const response = await apiClient.get('/dashboard/settings');
        return response.data;
    },
    
    updateDashboardSettings: async (settingsData) => {
        const response = await apiClient.put('/dashboard/settings', settingsData);
        return response.data;
    },
    
    updateDashboardPrivacy: async (privacyData) => {
        const response = await apiClient.put('/dashboard/settings/privacy', privacyData);
        return response.data;
    },
    
    deleteAccount: async (currentPassword) => {
        const response = await apiClient.delete('/dashboard/account', { data: { current_password: currentPassword } });
        return response.data;
    },
    
    getCommunityData: async () => {
        const response = await apiClient.get('/community');
        return response.data;
    },
    
    getDashboardSocial: async (params) => {
        const response = await apiClient.get('/dashboard/social', { params });
        return response.data;
    }
};

export default userService;

import apiClient from '../api/client';

export const reviewService = {
    getDashboardReviews: async () => {
        const response = await apiClient.get('/dashboard/reviews');
        return response.data;
    },

    createReview: async (reviewData) => {
        const response = await apiClient.post('/reviews', reviewData);
        return response.data;
    },
    
    updateReview: async (id, reviewData) => {
        const response = await apiClient.put(`/reviews/${id}`, reviewData);
        return response.data;
    },
    
    deleteReview: async (id) => {
        const response = await apiClient.delete(`/reviews/${id}`);
        return response.data;
    },
    
    toggleLikeReview: async (id) => {
        const response = await apiClient.post(`/reviews/${id}/like`);
        return response.data;
    }
};

export default reviewService;

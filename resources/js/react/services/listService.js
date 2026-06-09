import apiClient from '../api/client';

export const listService = {
    getPublicLists: async (params) => {
        const response = await apiClient.get('/lists', { params });
        return response.data;
    },
    
    getListDetails: async (id, params) => {
        const response = await apiClient.get(`/lists/${id}`, { params });
        return response.data;
    },
    
    getDashboardLists: async (params) => {
        const response = await apiClient.get('/dashboard/lists', { params });
        return response.data;
    },
    
    createList: async (listData) => {
        const response = await apiClient.post('/lists', listData);
        return response.data;
    },
    
    updateList: async (id, listData) => {
        const response = await apiClient.put(`/lists/${id}`, listData);
        return response.data;
    },
    
    createListAndAttach: async (listData) => {
        const response = await apiClient.post('/lists/store-and-attach', listData);
        return response.data;
    },
    
    addBookToList: async (listId, bookIsbn) => {
        const response = await apiClient.post(`/lists/${listId}/books`, { book_isbn: bookIsbn });
        return response.data;
    },
    
    deleteList: async (listId) => {
        const response = await apiClient.delete(`/lists/${listId}`);
        return response.data;
    },
    
    toggleLikeList: async (id) => {
        const response = await apiClient.post(`/lists/${id}/like`);
        return response.data;
    },
    
    toggleFollowList: async (id) => {
        const response = await apiClient.post(`/lists/${id}/follow`);
        return response.data;
    }
};

export default listService;

import apiClient from '../api/client';

export const bookService = {
    getBooks: async (params, config = {}) => {
        const response = await apiClient.get('/books', { params, ...config });
        return response.data;
    },
    
    getBookDetails: async (isbn, reviewPage = 1) => {
        const response = await apiClient.get(`/books/${isbn}`, { params: { page: reviewPage } });
        return response.data;
    },
    
    updateBookStatus: async (isbn, status) => {
        const response = await apiClient.post(`/books/${isbn}/status`, { status });
        return response.data;
    },
    
    getGenres: async () => {
        const response = await apiClient.get('/genres');
        return response.data;
    },
    
    getLanguages: async () => {
        const response = await apiClient.get('/languages');
        return response.data;
    },
    
    getCountries: async () => {
        const response = await apiClient.get('/countries');
        return response.data;
    },
    
    getHomeData: async () => {
        const response = await apiClient.get('/home');
        return response.data;
    },
    
    search: async (query) => {
        const response = await apiClient.get('/search', { params: { q: query } });
        return response.data;
    },
    
    getStats: async () => {
        const response = await apiClient.get('/stats');
        return response.data;
    },
    
    adminGetBook: async (isbn) => {
        const response = await apiClient.get(`/admin/books/${isbn}`);
        return response.data;
    },
    
    adminSaveBook: async (formData) => {
        const response = await apiClient.post('/admin/books', formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
        });
        return response.data;
    },
    
    adminSearchAuthors: async (query) => {
        const response = await apiClient.get('/admin/authors-search', { params: { q: query } });
        return response.data;
    }
};

export default bookService;

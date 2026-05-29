import axios from 'axios';

/**
 * Pre-configured Axios instance for Laravel API communication.
 * Uses Sanctum cookie-based authentication (same domain, withCredentials).
 */
const apiClient = axios.create({
    baseURL: '/api',
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'X-Requested-With': 'XMLHttpRequest',
    },
    withCredentials: true,
    withXSRFToken: true,
});

/**
 * Response interceptor — handles common error patterns centrally.
 */
apiClient.interceptors.response.use(
    (response) => response,
    (error) => {
        const status = error.response?.status;

        if (status === 401) {
            // Session expired — redirect to login
            // Only redirect if we're not already on the login page and it's not the initial user check
            const isAuthUserCheck = error.config?.url?.endsWith('/auth/user');
            if (!isAuthUserCheck && !window.location.pathname.startsWith('/login')) {
                window.location.href = '/login';
            }
        }

        if (status === 403) {
            console.error('Forbidden: You do not have permission to access this resource.');
        }

        if (status === 419) {
            // CSRF token mismatch — refresh and retry
            console.warn('CSRF token mismatch — refreshing page.');
            window.location.reload();
        }

        return Promise.reject(error);
    }
);

export default apiClient;

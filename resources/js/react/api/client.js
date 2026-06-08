import axios from 'axios';

/**
 * Instancia de Axios preconfigurada para la comunicación con la API de Laravel.
 * Usa autenticación basada en cookies de Sanctum (mismo dominio, conCredentials).
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
            // Sesión expirada — redirigir a inicio de sesión
            // Solo redirigir si no estamos ya en la página de inicio de sesión y no es la verificación inicial del usuario
            const isAuthUserCheck = error.config?.url?.endsWith('/auth/user');
            if (!isAuthUserCheck && !window.location.pathname.startsWith('/login')) {
                window.location.href = '/login';
            }
        }

        if (status === 403) {
            console.error('Forbidden: You do not have permission to access this resource.');
        }

        if (status === 419) {
            // Discordancia del token CSRF — refrescar y reintentar
            console.warn('CSRF token mismatch — refreshing page.');
            window.location.reload();
        }

        return Promise.reject(error);
    }
);

export default apiClient;

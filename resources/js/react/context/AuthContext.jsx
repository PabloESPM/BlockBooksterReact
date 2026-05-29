import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import apiClient from '../api/client';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    // Load the authenticated user on mount
    const fetchUser = useCallback(async () => {
        try {
            const response = await apiClient.get('/auth/user');
            setUser(response.data.data);
        } catch {
            setUser(null);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchUser();
    }, [fetchUser]);

    const login = async (email, password) => {
        await apiClient.get('/sanctum/csrf-cookie', { baseURL: '' });
        const response = await apiClient.post('/auth/login', { email, password });
        setUser(response.data.data);
        return response.data;
    };

    const register = async (data) => {
        await apiClient.get('/sanctum/csrf-cookie', { baseURL: '' });
        const response = await apiClient.post('/auth/register', data);
        setUser(response.data.data);
        return response.data;
    };

    const logout = async () => {
        try {
            await apiClient.post('/auth/logout');
        } catch (error) {
            console.error('Logout error on backend:', error);
        } finally {
            setUser(null);
        }
    };

    const value = {
        user,
        loading,
        login,
        register,
        logout,
        fetchUser,
        isAuthenticated: !!user,
        isAdmin: user?.type === 'admin' || user?.type === 'worker',
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}

export default AuthContext;

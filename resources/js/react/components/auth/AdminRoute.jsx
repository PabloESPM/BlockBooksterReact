import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

/**
 * AdminRoute — Protege rutas que requieren rol admin o worker.
 * Redirige a la home si el usuario no tiene permisos suficientes.
 * Nota: este componente asume que ya está envuelto en un ProtectedRoute,
 * por lo que el usuario ya está autenticado.
 */
export default function AdminRoute({ children }) {
    const { isAdmin, loading } = useAuth();

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-gray-50">
                <div className="neo-spinner"></div>
            </div>
        );
    }

    if (!isAdmin) {
        return <Navigate to="/" replace />;
    }

    return children;
}

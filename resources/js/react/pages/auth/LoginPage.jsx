import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export default function LoginPage() {
    const { login } = useAuth();
    const navigate = useNavigate();

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setErrors({});
        setLoading(true);

        try {
            const result = await login(email, password);
            const user = result.data;

            // Redirigir admin/worker al panel de administración
            if (user.type === 'admin' || user.type === 'worker') {
                navigate('/admin');
            } else {
                navigate('/');
            }
        } catch (error) {
            if (error.response?.status === 422) {
                setErrors(error.response.data.errors || {});
            } else {
                setErrors({ email: ['Ha ocurrido un error. Inténtalo de nuevo.'] });
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div>
            <div className="mb-6 text-center">
                <h1 className="text-2xl font-black uppercase mb-2">Bienvenido de Nuevo</h1>
                <p className="text-xs font-bold uppercase tracking-widest text-gray-500">
                    Ingresa tus credenciales
                </p>
            </div>

            {/* Social Login */}
            <div className="space-y-3 mb-8">
                <button className="w-full neo-btn-secondary flex items-center justify-center gap-3">
                    <img src="https://www.svgrepo.com/show/475656/google-color.svg" className="w-5 h-5" alt="Google" />
                    Continuar con Google
                </button>
                <button className="w-full neo-btn-secondary flex items-center justify-center gap-3">
                    <img src="https://www.svgrepo.com/show/452062/microsoft.svg" className="w-5 h-5" alt="Microsoft" />
                    Continuar con Microsoft
                </button>
                <button className="w-full neo-btn-secondary flex items-center justify-center gap-3">
                    <img src="https://www.svgrepo.com/show/511330/apple-173.svg" className="w-5 h-5" alt="Apple" />
                    Continuar con Apple
                </button>
            </div>

            <div className="relative flex items-center py-5">
                <div className="flex-grow border-t-2 border-black"></div>
                <span className="flex-shrink-0 mx-4 text-xs font-black uppercase">
                    O iniciar sesión con correo
                </span>
                <div className="flex-grow border-t-2 border-black"></div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                    <label htmlFor="email" className="block text-xs font-bold uppercase mb-2">
                        Correo Electrónico
                    </label>
                    <input
                        id="email"
                        type="email"
                        className="neo-input"
                        placeholder="juan.perez@ejemplo.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        autoFocus
                    />
                    {errors.email && (
                        <span className="text-red-600 text-xs font-bold mt-1 block">
                            {errors.email[0]}
                        </span>
                    )}
                </div>

                <div>
                    <div className="flex justify-between items-center mb-2">
                        <label htmlFor="password" className="block text-xs font-bold uppercase">
                            Contraseña
                        </label>
                        <Link
                            to="/forgot-password"
                            className="text-xs font-bold uppercase text-brand-blue hover:underline"
                        >
                            ¿Olvidaste tu contraseña?
                        </Link>
                    </div>
                    <input
                        id="password"
                        type="password"
                        className="neo-input"
                        placeholder="••••••••"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />
                    {errors.password && (
                        <span className="text-red-600 text-xs font-bold mt-1 block">
                            {errors.password[0]}
                        </span>
                    )}
                </div>

                <button type="submit" className="w-full neo-btn-primary" disabled={loading}>
                    {loading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
                </button>
            </form>

            {/* Footer */}
            <div className="mt-8 pt-4 border-t-2 border-black text-center text-sm font-bold">
                <span className="text-gray-600">¿Nuevo en BlockBookster?</span>
                <Link
                    to="/register"
                    className="ml-1 text-black font-black uppercase hover:text-brand-blue hover:underline"
                >
                    Crear Cuenta
                </Link>
            </div>
        </div>
    );
}

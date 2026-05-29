import { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import apiClient from '../../api/client';

/**
 * ResetPasswordPage — Página de restablecimiento de contraseña.
 * Captura token y email de la URL y envía la nueva clave a la API.
 */
export default function ResetPasswordPage() {
    const [searchParams] = useSearchParams();
    const token = searchParams.get('token') || '';
    const email = searchParams.get('email') || '';

    const [password, setPassword] = useState('');
    const [passwordConfirmation, setPasswordConfirmation] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [successMessage, setSuccessMessage] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        if (password !== passwordConfirmation) {
            setError('Las contraseñas no coinciden.');
            setLoading(false);
            return;
        }

        try {
            const res = await apiClient.post('/auth/reset-password', {
                token,
                email,
                password,
                password_confirmation: passwordConfirmation,
            });
            setSuccessMessage(res.data.message || 'Tu contraseña ha sido cambiada con éxito.');
        } catch (err) {
            console.error("Error resetting password:", err);
            const serverErrors = err.response?.data?.errors;
            if (serverErrors && typeof serverErrors === 'object') {
                const messages = Object.values(serverErrors).flat().join(' ');
                setError(messages);
            } else {
                setError(err.response?.data?.message || err.response?.data?.error || 'No se pudo restablecer la contraseña.');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div>
            <div className="mb-6 text-center">
                <h1 className="text-2xl font-black uppercase mb-2">Restablecer Contraseña</h1>
                <p className="text-xs font-bold uppercase tracking-widest text-gray-500">
                    Introduce tu nueva contraseña
                </p>
            </div>

            {error && (
                <div className="p-3 mb-4 bg-red-100 border-2 border-red-500 font-bold text-red-700 text-xs uppercase text-center">
                    ⚠️ {error}
                </div>
            )}

            {successMessage ? (
                <div className="text-center space-y-4">
                    <div className="neo-card p-6 bg-brand-yellow">
                        <p className="font-bold text-sm uppercase">
                            {successMessage}
                        </p>
                    </div>
                    <Link
                        to="/login"
                        className="inline-block neo-btn-primary text-sm"
                    >
                        Iniciar sesión ahora
                    </Link>
                </div>
            ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Campo email oculto/lectura */}
                    <div>
                        <label className="block text-xs font-bold uppercase mb-2">
                            Correo Electrónico
                        </label>
                        <input
                            type="email"
                            className="neo-input bg-gray-100 cursor-not-allowed"
                            value={email}
                            disabled
                            required
                        />
                    </div>

                    <div>
                        <label htmlFor="password" className="block text-xs font-bold uppercase mb-2">
                            Nueva Contraseña
                        </label>
                        <input
                            id="password"
                            type="password"
                            className="neo-input"
                            placeholder="Mínimo 8 caracteres"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            autoFocus
                        />
                    </div>

                    <div>
                        <label htmlFor="password_confirmation" className="block text-xs font-bold uppercase mb-2">
                            Confirmar Contraseña
                        </label>
                        <input
                            id="password_confirmation"
                            type="password"
                            className="neo-input"
                            placeholder="Repite la contraseña"
                            value={passwordConfirmation}
                            onChange={(e) => setPasswordConfirmation(e.target.value)}
                            required
                        />
                    </div>

                    <button type="submit" disabled={loading} className="w-full neo-btn-primary">
                        {loading ? 'Restableciendo...' : 'Restablecer contraseña'}
                    </button>
                </form>
            )}

            {/* Footer */}
            <div className="mt-8 pt-4 border-t-2 border-black text-center text-sm font-bold">
                <Link
                    to="/login"
                    className="text-black font-black uppercase hover:text-brand-blue hover:underline"
                >
                    ← Volver al inicio de sesión
                </Link>
            </div>
        </div>
    );
}

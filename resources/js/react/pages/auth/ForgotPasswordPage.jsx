import { useState } from 'react';
import { Link } from 'react-router-dom';
import apiClient from '../../api/client';

/**
 * ForgotPasswordPage — Página de recuperación de contraseña.
 * Replica la vista Livewire pages.auth.forgot-password.
 * Nota: el backend no tiene un endpoint real para reset de password,
 * así que por ahora mostramos el formulario sin funcionalidad real.
 */
export default function ForgotPasswordPage() {
    const [email, setEmail] = useState('');
    const [sent, setSent] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [successMessage, setSuccessMessage] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        try {
            const res = await apiClient.post('/auth/forgot-password', { email });
            setSuccessMessage(res.data.message);
            setSent(true);
        } catch (err) {
            console.error("Error on forgot-password:", err);
            setError(err.response?.data?.message || err.response?.data?.error || 'No se pudo enviar el correo de recuperación.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div>
            <div className="mb-6 text-center">
                <h1 className="text-2xl font-black uppercase mb-2">Recuperar Contraseña</h1>
                <p className="text-xs font-bold uppercase tracking-widest text-gray-500">
                    Te enviaremos un enlace de recuperación
                </p>
            </div>

            {error && (
                <div className="p-3 mb-4 bg-red-100 border-2 border-red-500 font-bold text-red-700 text-xs uppercase text-center">
                    ⚠️ {error}
                </div>
            )}

            {sent ? (
                <div className="text-center space-y-4">
                    <div className="neo-card p-6 bg-brand-yellow">
                        <p className="font-bold text-sm uppercase">
                            {successMessage || 'Si existe una cuenta con ese correo, recibirás un enlace para restablecer tu contraseña.'}
                        </p>
                    </div>
                    <Link
                        to="/login"
                        className="inline-block neo-btn-primary text-sm"
                    >
                        Volver al inicio de sesión
                    </Link>
                </div>
            ) : (
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
                    </div>

                    <button type="submit" disabled={loading} className="w-full neo-btn-primary">
                        {loading ? 'Enviando...' : 'Enviar enlace de recuperación'}
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

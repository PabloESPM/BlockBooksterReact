import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import apiClient from '../../api/client';
import { useAuth } from '../../context/AuthContext';

/**
 * Ajustes de cuenta — Replica pages.dashboard.settings.
 */
export default function DashboardSettingsPage() {
    const { logout } = useAuth();
    const navigate = useNavigate();
    const [form, setForm] = useState({ email: '', telephone: '', password: '', password_confirmation: '' });
    const [privacy, setPrivacy] = useState('public');
    const [errors, setErrors] = useState({});
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        apiClient.get('/dashboard/settings').then((res) => {
            const user = res.data.data;
            setForm(f => ({ ...f, email: user.email || '', telephone: user.telephone || '' }));
            setPrivacy(user.profile_visibility || 'public');
            setLoading(false);
        });
    }, []);

    const handleSaveCredentials = async (e) => {
        e.preventDefault();
        setErrors({}); setSaving(true); setMessage('');
        try {
            const res = await apiClient.put('/dashboard/settings', form);
            setMessage(res.data.message);
            setForm(f => ({ ...f, password: '', password_confirmation: '' }));
        } catch (error) {
            if (error.response?.status === 422) setErrors(error.response.data.errors || {});
        } finally { setSaving(false); }
    };

    const handleSavePrivacy = async () => {
        const res = await apiClient.put('/dashboard/settings/privacy', { profile_visibility: privacy });
        setMessage(res.data.message);
    };

    const handleDeleteAccount = async () => {
        if (!confirm('⚠️ ¿Estás seguro? Esta acción es IRREVERSIBLE.')) return;
        if (!confirm('Última oportunidad: ¿REALMENTE quieres eliminar tu cuenta y todos tus datos?')) return;
        await apiClient.delete('/dashboard/account');
        await logout();
        navigate('/');
    };

    if (loading) return <div className="flex justify-center py-12"><div className="neo-spinner"></div></div>;

    return (
        <div className="space-y-8">
            <h1 className="text-2xl font-black uppercase tracking-tight">Ajustes</h1>

            {message && (
                <div className="neo-card p-3 bg-brand-yellow border-2 border-black">
                    <p className="text-xs font-bold uppercase">{message}</p>
                </div>
            )}

            {/* Credenciales */}
            <form onSubmit={handleSaveCredentials} className="neo-card p-6 space-y-4">
                <h2 className="text-sm font-black uppercase tracking-widest border-b-2 border-black pb-2">Credenciales</h2>
                <div>
                    <label className="block text-xs font-bold uppercase mb-2">Email</label>
                    <input type="email" className="neo-input" value={form.email} onChange={(e) => setForm(f => ({ ...f, email: e.target.value }))} required />
                    {errors.email && <span className="text-red-600 text-xs font-bold mt-1 block">{errors.email[0]}</span>}
                </div>
                <div>
                    <label className="block text-xs font-bold uppercase mb-2">Teléfono</label>
                    <input type="tel" className="neo-input" value={form.telephone} onChange={(e) => setForm(f => ({ ...f, telephone: e.target.value }))} />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-xs font-bold uppercase mb-2">Nueva contraseña</label>
                        <input type="password" className="neo-input" placeholder="Dejar vacío para no cambiar" value={form.password} onChange={(e) => setForm(f => ({ ...f, password: e.target.value }))} />
                        {errors.password && <span className="text-red-600 text-xs font-bold mt-1 block">{errors.password[0]}</span>}
                    </div>
                    <div>
                        <label className="block text-xs font-bold uppercase mb-2">Confirmar contraseña</label>
                        <input type="password" className="neo-input" value={form.password_confirmation} onChange={(e) => setForm(f => ({ ...f, password_confirmation: e.target.value }))} />
                    </div>
                </div>
                <button type="submit" className="neo-btn-primary text-xs" disabled={saving}>
                    {saving ? 'Guardando...' : 'Guardar credenciales'}
                </button>
            </form>

            {/* Privacidad */}
            <div className="neo-card p-6 space-y-4">
                <h2 className="text-sm font-black uppercase tracking-widest border-b-2 border-black pb-2">Privacidad</h2>
                <div>
                    <label className="block text-xs font-bold uppercase mb-2">Visibilidad del perfil</label>
                    <select className="neo-input bg-white" value={privacy} onChange={(e) => setPrivacy(e.target.value)}>
                        <option value="public">Público — Todos pueden ver</option>
                        <option value="followers">Seguidores — Solo quien te sigue</option>
                        <option value="friends">Amigos — Solo seguidores mutuos</option>
                        <option value="private">Privado — Solo tú</option>
                    </select>
                </div>
                <button onClick={handleSavePrivacy} className="neo-btn-secondary text-xs">
                    Guardar privacidad
                </button>
            </div>

            {/* Zona peligrosa */}
            <div className="neo-card p-6 border-red-600">
                <h2 className="text-sm font-black uppercase tracking-widest text-red-600 border-b-2 border-red-600 pb-2 mb-4">
                    Zona Peligrosa
                </h2>
                <p className="text-sm text-gray-600 mb-4">
                    Eliminar tu cuenta es una acción permanente. Se borrarán todos tus datos, reseñas, listas y conexiones.
                </p>
                <button onClick={handleDeleteAccount} className="bg-red-600 text-white text-xs font-bold uppercase px-6 py-3 border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:-translate-y-1 transition-all">
                    Eliminar mi cuenta permanentemente
                </button>
            </div>
        </div>
    );
}

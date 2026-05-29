import { useState, useEffect } from 'react';
import apiClient from '../../api/client';
import { useAuth } from '../../context/AuthContext';

/**
 * Edición de perfil — Replica pages.dashboard.profile.
 */
export default function DashboardProfilePage() {
    const { fetchUser } = useAuth();
    const [form, setForm] = useState({ name: '', bio: '', country_id: '' });
    const [avatarPreview, setAvatarPreview] = useState(null);
    const [avatarFile, setAvatarFile] = useState(null);
    const [countries, setCountries] = useState([]);
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState('');

    useEffect(() => {
        apiClient.get('/dashboard/profile').then((res) => {
            const user = res.data.data;
            setForm({ name: user.name || '', bio: user.bio || '', country_id: user.country_id || '' });
            setAvatarPreview(user.avatar_url);
            setCountries(res.data.countries);
            setLoading(false);
        });
    }, []);

    const handleAvatarChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setAvatarFile(file);
            setAvatarPreview(URL.createObjectURL(file));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setErrors({});
        setSaving(true);
        setMessage('');

        const formData = new FormData();
        formData.append('name', form.name);
        formData.append('bio', form.bio || '');
        formData.append('country_id', form.country_id || '');
        if (avatarFile) formData.append('avatar', avatarFile);

        try {
            const res = await apiClient.post('/dashboard/profile', formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });
            setMessage(res.data.message);
            fetchUser(); // Actualizar estado global
        } catch (error) {
            if (error.response?.status === 422) {
                setErrors(error.response.data.errors || {});
            }
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <div className="flex justify-center py-12"><div className="neo-spinner"></div></div>;

    return (
        <div>
            <h1 className="text-2xl font-black uppercase tracking-tight mb-6">Mi Perfil</h1>

            {message && (
                <div className="neo-toast--success neo-card p-3 mb-4 bg-brand-yellow border-2 border-black">
                    <p className="text-xs font-bold uppercase">{message}</p>
                </div>
            )}

            <form onSubmit={handleSubmit} className="neo-card p-6 space-y-6">
                {/* Avatar */}
                <div className="flex items-center gap-6">
                    <img
                        src={avatarPreview || `https://ui-avatars.com/api/?name=U&size=200&background=FFA903&color=000`}
                        alt="Avatar"
                        className="w-24 h-24 border-4 border-black object-cover"
                        onError={(e) => {
                            e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(form.name || 'U')}&size=200&background=FFA903&color=000`;
                        }}
                    />
                    <div>
                        <label className="neo-btn-secondary text-xs cursor-pointer">
                            Cambiar avatar
                            <input type="file" accept="image/*" onChange={handleAvatarChange} className="hidden" />
                        </label>
                        {errors.avatar && <span className="text-red-600 text-xs font-bold block mt-1">{errors.avatar[0]}</span>}
                    </div>
                </div>

                {/* Nombre */}
                <div>
                    <label className="block text-xs font-bold uppercase mb-2">Nombre</label>
                    <input type="text" className="neo-input" value={form.name} onChange={(e) => setForm(f => ({ ...f, name: e.target.value }))} required />
                    {errors.name && <span className="text-red-600 text-xs font-bold mt-1 block">{errors.name[0]}</span>}
                </div>

                {/* Bio */}
                <div>
                    <label className="block text-xs font-bold uppercase mb-2">Biografía</label>
                    <textarea className="neo-input" rows="4" maxLength={1000} value={form.bio} onChange={(e) => setForm(f => ({ ...f, bio: e.target.value }))} placeholder="Cuéntanos sobre ti..." />
                    <span className="text-xs text-gray-400">{form.bio.length}/1000</span>
                    {errors.bio && <span className="text-red-600 text-xs font-bold mt-1 block">{errors.bio[0]}</span>}
                </div>

                {/* País */}
                <div>
                    <label className="block text-xs font-bold uppercase mb-2">País</label>
                    <select className="neo-input bg-white" value={form.country_id} onChange={(e) => setForm(f => ({ ...f, country_id: e.target.value }))}>
                        <option value="">Selecciona un país</option>
                        {countries.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                </div>

                <button type="submit" className="neo-btn-primary" disabled={saving}>
                    {saving ? 'Guardando...' : 'Guardar cambios'}
                </button>
            </form>
        </div>
    );
}

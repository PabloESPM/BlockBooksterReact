import { useState, useEffect, useRef } from 'react';
import apiClient from '../../api/client';
import { useAuth } from '../../context/AuthContext';

/**
 * Edición de perfil — Replica la maquetación del formulario original de Blade.
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

    // Mock social links state (visual placeholders matching Blade template)
    const [website, setWebsite] = useState('');
    const [twitter, setTwitter] = useState('');

    const fileInputRef = useRef(null);

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

    const triggerFileInput = () => {
        fileInputRef.current?.click();
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
            fetchUser(); // Actualizar estado global del usuario
        } catch (error) {
            if (error.response?.status === 422) {
                setErrors(error.response.data.errors || {});
            }
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center py-12">
                <div className="neo-spinner"></div>
            </div>
        );
    }

    const hasErrors = Object.keys(errors).length > 0;

    return (
        <div className="flex-grow space-y-8">
            {/* Cabecera principal */}
            <header className="mb-8 border-b-4 border-black pb-4">
                <h1 className="text-3xl font-black uppercase font-display">Editar Perfil</h1>
                <p className="text-gray-600 font-bold mt-1">Actualiza tu información personal</p>
            </header>

            <div className="neo-card p-6 bg-white space-y-6">
                {/* Mensajes de éxito o error */}
                {message && (
                    <div className="p-4 bg-green-100 border-2 border-green-600 text-green-700 font-bold uppercase text-sm relative">
                        {message}
                        <button onClick={() => setMessage('')} className="absolute top-2 right-2 text-xl font-bold hover:text-green-900 cursor-pointer">&times;</button>
                    </div>
                )}

                {hasErrors && (
                    <div className="p-4 bg-red-100 border-2 border-red-600 text-red-700 font-bold uppercase text-sm relative">
                        Por favor, corrige los errores del formulario.
                        <button onClick={() => setErrors({})} className="absolute top-2 right-2 text-xl font-bold hover:text-red-900 cursor-pointer">&times;</button>
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Sección Avatar con previsualización en tiempo real */}
                    <div className="flex items-center gap-6 pb-6 border-b-2 border-gray-200">
                        <div
                            onClick={triggerFileInput}
                            className="w-24 h-24 bg-gray-200 rounded-full border-2 border-black flex-shrink-0 relative overflow-hidden group cursor-pointer shadow-[2px_2px_0px_#000]"
                        >
                            {/* Imagen actual o previsualizada */}
                            <img
                                src={avatarPreview || `https://ui-avatars.com/api/?name=${encodeURIComponent(form.name || 'U')}&size=200&background=FFA903&color=000`}
                                alt={`Avatar de ${form.name}`}
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                    e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(form.name || 'U')}&size=200&background=FFA903&color=000`;
                                }}
                            />
                            {/* Overlay en hover */}
                            <div className="absolute inset-0 bg-black/50 hidden group-hover:flex items-center justify-center text-white text-xs font-bold uppercase select-none animate-fade-in">
                                Subir
                            </div>
                        </div>

                        <div>
                            <h3 className="font-bold uppercase text-sm mb-1">Foto de Perfil</h3>
                            <p className="text-xs text-gray-500 mb-2">Tamaño recomendado: 500x500px. Máx. 3 MB.</p>
                            
                            {errors.avatar && (
                                <p className="text-xs text-red-600 font-bold mb-2">{errors.avatar[0]}</p>
                            )}

                            {/* Input oculto */}
                            <input
                                type="file"
                                accept="image/*"
                                ref={fileInputRef}
                                onChange={handleAvatarChange}
                                className="hidden"
                            />
                            {/* Botón decorativo */}
                            <button
                                type="button"
                                onClick={triggerFileInput}
                                className="neo-btn-secondary py-1 px-3 text-xs cursor-pointer"
                            >
                                Cambiar Foto
                            </button>
                        </div>
                    </div>

                    {/* Campos de perfil */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Campo: Nombre de usuario */}
                        <div>
                            <label className="block text-xs font-bold uppercase mb-2">Nombre Visible</label>
                            <input
                                type="text"
                                value={form.name}
                                onChange={(e) => setForm(f => ({ ...f, name: e.target.value }))}
                                className="neo-input w-full"
                                required
                            />
                            {errors.name && (
                                <p className="text-xs text-red-600 font-bold mt-1">{errors.name[0]}</p>
                            )}
                        </div>

                        {/* Campo: País */}
                        <div>
                            <label className="block text-xs font-bold uppercase mb-2">País</label>
                            <select
                                value={form.country_id}
                                onChange={(e) => setForm(f => ({ ...f, country_id: e.target.value }))}
                                className="neo-input w-full bg-white cursor-pointer"
                            >
                                <option value="">— Sin especificar —</option>
                                {countries.map((c) => (
                                    <option key={c.id} value={c.id}>
                                        {c.name}
                                    </option>
                                ))}
                            </select>
                            {errors.country_id && (
                                <p className="text-xs text-red-600 font-bold mt-1">{errors.country_id[0]}</p>
                            )}
                        </div>

                        {/* Campo: Biografía */}
                        <div className="md:col-span-2">
                            <div className="flex justify-between items-center mb-2">
                                <label className="block text-xs font-bold uppercase">Biografía</label>
                                <span className="text-[10px] text-gray-400 font-bold">{form.bio?.length || 0}/1000</span>
                            </div>
                            <textarea
                                rows="4"
                                maxLength={1000}
                                value={form.bio}
                                onChange={(e) => setForm(f => ({ ...f, bio: e.target.value }))}
                                placeholder="Cuéntanos sobre tus hábitos de lectura..."
                                className="neo-input w-full"
                            />
                            {errors.bio && (
                                <p className="text-xs text-red-600 font-bold mt-1">{errors.bio[0]}</p>
                            )}
                        </div>
                    </div>

                    {/* Enlaces Sociales (Mockup Visual) */}
                    <div className="border-t-2 border-black pt-6 mt-6">
                        <h3 className="font-bold uppercase text-sm mb-4">Enlaces Sociales</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-xs font-bold uppercase mb-2">Sitio Web</label>
                                <input
                                    type="url"
                                    value={website}
                                    onChange={(e) => setWebsite(e.target.value)}
                                    placeholder="https://"
                                    className="neo-input w-full"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold uppercase mb-2">Twitter / X</label>
                                <input
                                    type="text"
                                    value={twitter}
                                    onChange={(e) => setTwitter(e.target.value)}
                                    placeholder="@usuario"
                                    className="neo-input w-full"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Botón de guardar */}
                    <div className="pt-6 flex justify-end">
                        <button
                            type="submit"
                            disabled={saving}
                            className="neo-btn-primary px-8 flex items-center gap-2 cursor-pointer disabled:opacity-60 disabled:cursor-wait"
                        >
                            {saving && (
                                <span className="inline-block w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin"></span>
                            )}
                            Guardar Cambios
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

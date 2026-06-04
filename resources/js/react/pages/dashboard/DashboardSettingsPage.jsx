import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import apiClient from '../../api/client';
import { useAuth } from '../../context/AuthContext';

/**
 * Ajustes de cuenta — Replica la maquetación y la lógica visual de Blade.
 */
export default function DashboardSettingsPage() {
    const { logout } = useAuth();
    const navigate = useNavigate();

    const [form, setForm] = useState({
        email: '',
        telephone: '',
        current_password: '',
        password: '',
        password_confirmation: '',
    });

    const [privacy, setPrivacy] = useState('public');
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(true);

    // Saving states per button
    const [savingCredentials, setSavingCredentials] = useState(false);
    const [savingPrivacy, setSavingPrivacy] = useState(false);

    const [message, setMessage] = useState('');
    const [privacyMessage, setPrivacyMessage] = useState('');

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
        setErrors({});
        setSavingCredentials(true);
        setMessage('');

        try {
            const res = await apiClient.put('/dashboard/settings', form);
            setMessage(res.data.message);
            // HAL-AUTH-04: limpiar contraseñas tras guardar
            setForm(f => ({ ...f, current_password: '', password: '', password_confirmation: '' }));
        } catch (error) {
            if (error.response?.status === 422) {
                setErrors(error.response.data.errors || {});
            }
        } finally {
            setSavingCredentials(false);
        }
    };


    const handleSavePrivacy = async (e) => {
        e.preventDefault();
        setSavingPrivacy(true);
        setPrivacyMessage('');

        try {
            const res = await apiClient.put('/dashboard/settings/privacy', { profile_visibility: privacy });
            setPrivacyMessage(res.data.message);
        } catch (error) {
            console.error('Error saving privacy preferences:', error);
        } finally {
            setSavingPrivacy(false);
        }
    };

    const [deletePassword, setDeletePassword] = useState('');
    const [deleteError, setDeleteError] = useState('');
    const [deletingAccount, setDeletingAccount] = useState(false);

    const handleDeleteAccount = async () => {
        if (!confirm('⚠️ ¿Estás seguro? Esta acción es IRREVERSIBLE.')) return;
        if (!confirm('Última oportunidad: ¿REALMENTE quieres eliminar tu cuenta y todos tus datos?')) return;

        setDeleteError('');
        setDeletingAccount(true);
        try {
            // HAL-AUTH-03: enviar current_password para confirmar identidad antes de eliminar
            await apiClient.delete('/dashboard/account', { data: { current_password: deletePassword } });
            await logout();
            navigate('/');
        } catch (err) {
            if (err.response?.status === 422) {
                setDeleteError(err.response.data.errors?.current_password?.[0] || 'Contraseña incorrecta.');
            } else {
                setDeleteError('Error al eliminar la cuenta. Inténtalo de nuevo.');
            }
        } finally {
            setDeletingAccount(false);
        }
    };


    if (loading) {
        return (
            <div className="flex justify-center py-12">
                <div className="neo-spinner"></div>
            </div>
        );
    }

    return (
        <div className="flex-grow space-y-8">
            {/* Cabecera principal */}
            <header className="mb-8 border-b-4 border-black pb-4">
                <h1 className="text-3xl font-black uppercase font-display">Configuración de Cuenta</h1>
                <p class="text-gray-600 font-bold mt-1">Preferencias de seguridad y privacidad</p>
            </header>

            <div className="space-y-8">
                {/* Email y Contraseña */}
                <div className="neo-card p-6 bg-white space-y-6">
                    <h3 className="font-black text-lg uppercase mb-6 flex items-center gap-2">
                        <span className="w-3 h-3 bg-brand-blue border border-black"></span>
                        Inicio de Sesión y Seguridad
                    </h3>

                    {message && (
                        <div className="p-4 bg-green-100 border-2 border-green-600 text-green-700 font-bold uppercase text-sm relative">
                            {message}
                            <button onClick={() => setMessage('')} className="absolute top-2 right-2 text-xl font-bold hover:text-green-900 cursor-pointer">&times;</button>
                        </div>
                    )}

                    <form onSubmit={handleSaveCredentials} className="space-y-6">
                        {/* HAL-AUTH-04: Contraseña actual requerida para guardar cambios */}
                        <div className="p-4 bg-amber-50 border-2 border-amber-400">
                            <label className="block text-xs font-bold uppercase mb-2">🔑 Contraseña Actual (requerida para guardar cambios)</label>
                            <input
                                id="current-password-settings"
                                type="password"
                                value={form.current_password}
                                onChange={(e) => setForm(f => ({ ...f, current_password: e.target.value }))}
                                placeholder="Tu contraseña actual"
                                className="neo-input w-full"
                                required
                                autoComplete="current-password"
                            />
                            {errors.current_password && (
                                <p className="text-xs text-red-600 font-bold mt-1">{errors.current_password[0]}</p>
                            )}
                        </div>

                        <div>
                            <label className="block text-xs font-bold uppercase mb-2">Correo Electrónico</label>
                            <input
                                type="email"
                                value={form.email}
                                onChange={(e) => setForm(f => ({ ...f, email: e.target.value }))}
                                className="neo-input w-full"
                                required
                            />
                            {errors.email && (
                                <p className="text-xs text-red-600 font-bold mt-1">{errors.email[0]}</p>
                            )}
                        </div>

                        <div>
                            <label className="block text-xs font-bold uppercase mb-2">Número de Teléfono</label>
                            <input
                                type="tel"
                                value={form.telephone}
                                onChange={(e) => setForm(f => ({ ...f, telephone: e.target.value }))}
                                placeholder="Ej. +34 600 000 000"
                                className="neo-input w-full"
                            />
                            {errors.telephone && (
                                <p className="text-xs text-red-600 font-bold mt-1">{errors.telephone[0]}</p>
                            )}
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-gray-200">
                            <div>
                                <label className="block text-xs font-bold uppercase mb-2">Nueva Contraseña</label>
                                <input
                                    type="password"
                                    value={form.password}
                                    onChange={(e) => setForm(f => ({ ...f, password: e.target.value }))}
                                    placeholder="Dejar en blanco para no cambiarla"
                                    className="neo-input w-full"
                                />
                                {errors.password && (
                                    <p className="text-xs text-red-600 font-bold mt-1">{errors.password[0]}</p>
                                )}
                            </div>
                            <div>
                                <label className="block text-xs font-bold uppercase mb-2">Confirmar Contraseña</label>
                                <input
                                    type="password"
                                    value={form.password_confirmation}
                                    onChange={(e) => setForm(f => ({ ...f, password_confirmation: e.target.value }))}
                                    placeholder="Repite la nueva contraseña"
                                    className="neo-input w-full"
                                />
                            </div>
                        </div>

                        <div className="flex justify-end">
                            <button
                                type="submit"
                                disabled={savingCredentials}
                                className="neo-btn-secondary bg-brand-yellow px-6 flex items-center gap-2 cursor-pointer disabled:opacity-60 disabled:cursor-wait"
                            >
                                {savingCredentials && (
                                    <span className="inline-block w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin"></span>
                                )}
                                Actualizar Credenciales
                            </button>
                        </div>
                    </form>
                </div>

                {/* Privacidad del Perfil */}
                <div className="neo-card p-6 bg-white space-y-6">
                    <h3 className="font-black text-lg uppercase mb-6 flex items-center gap-2">
                        <span className="w-3 h-3 bg-brand-yellow border border-black"></span>
                        Privacidad del Perfil
                    </h3>

                    {privacyMessage && (
                        <div className="p-4 bg-green-100 border-2 border-green-600 text-green-700 font-bold uppercase text-sm relative">
                            {privacyMessage}
                            <button onClick={() => setPrivacyMessage('')} className="absolute top-2 right-2 text-xl font-bold hover:text-green-900 cursor-pointer">&times;</button>
                        </div>
                    )}

                    <form onSubmit={handleSavePrivacy} className="space-y-3">
                        {/* Option: Public */}
                        <label className={`flex items-start gap-4 cursor-pointer p-4 border-2 transition-colors ${privacy === 'public' ? 'border-black bg-brand-yellow/10' : 'border-gray-200'} hover:border-black`}>
                            <input
                                type="radio"
                                name="profile_visibility"
                                value="public"
                                checked={privacy === 'public'}
                                onChange={() => setPrivacy('public')}
                                className="mt-1 w-4 h-4 accent-black cursor-pointer"
                            />
                            <div>
                                <div className="font-bold uppercase text-sm select-none">🌐 Público</div>
                                <div className="text-xs text-gray-500 mt-0.5 select-none">Cualquier visitante puede ver tus listas, reseñas y actividad de lectura.</div>
                            </div>
                        </label>

                        {/* Option: Followers */}
                        <label className={`flex items-start gap-4 cursor-pointer p-4 border-2 transition-colors ${privacy === 'followers' ? 'border-black bg-brand-yellow/10' : 'border-gray-200'} hover:border-black`}>
                            <input
                                type="radio"
                                name="profile_visibility"
                                value="followers"
                                checked={privacy === 'followers'}
                                onChange={() => setPrivacy('followers')}
                                className="mt-1 w-4 h-4 accent-black cursor-pointer"
                            />
                            <div>
                                <div className="font-bold uppercase text-sm select-none">👥 Solo Seguidores</div>
                                <div className="text-xs text-gray-500 mt-0.5 select-none">Únicamente los usuarios que te siguen pueden ver tu actividad completa.</div>
                            </div>
                        </label>

                        {/* Option: Friends */}
                        <label className={`flex items-start gap-4 cursor-pointer p-4 border-2 transition-colors ${privacy === 'friends' ? 'border-black bg-brand-yellow/10' : 'border-gray-200'} hover:border-black`}>
                            <input
                                type="radio"
                                name="profile_visibility"
                                value="friends"
                                checked={privacy === 'friends'}
                                onChange={() => setPrivacy('friends')}
                                className="mt-1 w-4 h-4 accent-black cursor-pointer"
                            />
                            <div>
                                <div className="font-bold uppercase text-sm select-none">🤝 Solo Amigos</div>
                                <div className="text-xs text-gray-500 mt-0.5 select-none">Solo los usuarios con los que te sigues mutuamente pueden ver tu perfil.</div>
                            </div>
                        </label>

                        {/* Option: Private */}
                        <label className={`flex items-start gap-4 cursor-pointer p-4 border-2 transition-colors ${privacy === 'private' ? 'border-black bg-brand-yellow/10' : 'border-gray-200'} hover:border-black`}>
                            <input
                                type="radio"
                                name="profile_visibility"
                                value="private"
                                checked={privacy === 'private'}
                                onChange={() => setPrivacy('private')}
                                className="mt-1 w-4 h-4 accent-black cursor-pointer"
                            />
                            <div>
                                <div className="font-bold uppercase text-sm select-none">🔒 Privado</div>
                                <div className="text-xs text-gray-500 mt-0.5 select-none">Nadie puede ver tu actividad ni tus secciones de perfil, solo el encabezado con tu nombre.</div>
                            </div>
                        </label>

                        <div className="flex justify-end mt-6">
                            <button
                                type="submit"
                                disabled={savingPrivacy}
                                className="neo-btn-secondary bg-brand-yellow px-6 flex items-center gap-2 cursor-pointer disabled:opacity-60 disabled:cursor-wait"
                            >
                                {savingPrivacy && (
                                    <span className="inline-block w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin"></span>
                                )}
                                Guardar Preferencias
                            </button>
                        </div>
                    </form>
                </div>

                {/* Zona de Peligro */}
                <div className="border-2 border-red-600 p-6 bg-red-50 shadow-[4px_4px_0px_#dc2626]">
                    <h3 className="font-black text-lg uppercase mb-4 text-red-600">Zona de Peligro</h3>
                    <p className="text-sm font-bold text-gray-800 mb-4">
                        Una vez que elimines tu cuenta, no habrá vuelta atrás. Por favor, asegúrate de tu decisión.
                    </p>
                    {/* HAL-AUTH-03: Confirmar identidad con contraseña antes de eliminar */}
                    <div className="mb-4">
                        <label className="block text-xs font-bold uppercase mb-2 text-red-700">🔑 Confirma tu Contraseña para Eliminar la Cuenta</label>
                        <input
                            id="delete-account-password"
                            type="password"
                            value={deletePassword}
                            onChange={(e) => setDeletePassword(e.target.value)}
                            placeholder="Tu contraseña actual"
                            className="neo-input w-full border-red-400 focus:border-red-600"
                            autoComplete="current-password"
                        />
                        {deleteError && (
                            <p className="text-xs text-red-600 font-bold mt-1">{deleteError}</p>
                        )}
                    </div>
                    <div className="flex justify-end">
                        <button
                            onClick={handleDeleteAccount}
                            disabled={!deletePassword || deletingAccount}
                            className="bg-red-600 text-white font-black uppercase px-6 py-2 border-2 border-black shadow-[2px_2px_0px_#000] hover:translate-y-[-1px] hover:shadow-[4px_4px_0px_#000] transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {deletingAccount ? 'Eliminando...' : 'Eliminar Cuenta'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

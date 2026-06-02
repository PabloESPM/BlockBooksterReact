import { useState, useEffect } from 'react';
import apiClient from '../../../api/client';
import Pagination from '../../../components/ui/Pagination';

/**
 * Gestión de usuarios en admin — Tabla con búsqueda, bloqueo y cambio de rol.
 * Replica admin.users.index Livewire SFC.
 */
export default function AdminUsersPage() {
    const [users, setUsers] = useState([]);
    const [meta, setMeta] = useState(null);
    const [search, setSearch] = useState('');
    const [page, setPage] = useState(1);
    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState('');

    const loadUsers = () => {
        setLoading(true);
        const params = { page };
        if (search) params.search = search;
        apiClient.get('/admin/users', { params }).then((res) => {
            setUsers(res.data.data);
            setMeta(res.data.meta);
            setLoading(false);
        });
    };

    useEffect(() => { loadUsers(); }, [page, search]);

    const handleToggleBlock = async (userId) => {
        const res = await apiClient.post(`/admin/users/${userId}/toggle-block`);
        setMessage(res.data.message);
        loadUsers();
    };

    const handleChangeRole = async (userId, newRole) => {
        const res = await apiClient.post(`/admin/users/${userId}/change-role`, { type: newRole });
        setMessage(res.data.message);
        loadUsers();
    };

    const avatarUrl = (user) => user.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&size=80&background=0E3FA9&color=fff`;

    return (
        <div>
            <h1 className="text-3xl font-black uppercase font-display mb-8">Usuarios</h1>

            {message && (
                <div className="mb-4 p-4 bg-green-100 border border-green-400 text-green-800 font-bold text-sm shadow-[2px_2px_0px_#000]">
                    {message}
                </div>
            )}

            <div className="bg-white border-2 border-black p-4 mb-8">
                <input
                    type="text"
                    placeholder="Buscar por nombre o email..."
                    className="neo-input w-full bg-white"
                    value={search}
                    onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                />
            </div>

            <div className="bg-white border-2 border-black overflow-hidden mb-8">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-black text-white text-xs font-bold uppercase tracking-wider">
                            <th className="p-4">Usuario</th>
                            <th className="p-4">Email</th>
                            <th className="p-4 text-center">Rol</th>
                            <th className="p-4 text-center">Estado</th>
                            <th className="p-4 text-right">Acciones</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-black/10">
                        {loading ? (
                            <tr><td colSpan="5" className="p-8 text-center"><div className="neo-spinner mx-auto"></div></td></tr>
                        ) : users.length === 0 ? (
                            <tr><td colSpan="5" className="p-8 text-center text-gray-500 font-bold uppercase">No se encontraron usuarios</td></tr>
                        ) : users.map((user) => (
                            <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                                <td className="p-4">
                                    <div className="flex items-center gap-3">
                                        <img
                                            src={avatarUrl(user)}
                                            alt=""
                                            className="w-8 h-8 border border-black object-cover"
                                            onError={(e) => {
                                                e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&size=80&background=0E3FA9&color=fff`;
                                            }}
                                        />
                                        <span className="font-bold text-sm">{user.name}</span>
                                    </div>
                                </td>
                                <td className="p-4 text-sm text-gray-600">{user.email}</td>
                                <td className="p-4 text-center">
                                    <select
                                        value={user.type}
                                        onChange={(e) => handleChangeRole(user.id, e.target.value)}
                                        className="text-xs font-bold uppercase border-2 border-black px-2 py-1 bg-white"
                                    >
                                        <option value="user">User</option>
                                        <option value="worker">Worker</option>
                                        <option value="admin">Admin</option>
                                    </select>
                                </td>
                                <td className="p-4 text-center">
                                    <span className={`text-xs font-bold uppercase px-2 py-1 border ${user.is_blocked ? 'bg-red-100 text-red-800 border-red-400' : 'bg-green-100 text-green-800 border-green-400'}`}>
                                        {user.is_blocked ? 'Bloqueado' : 'Activo'}
                                    </span>
                                </td>
                                <td className="p-4 text-right">
                                    <button
                                        onClick={() => handleToggleBlock(user.id)}
                                        className={`text-xs font-black uppercase hover:underline ${user.is_blocked ? 'text-green-600' : 'text-red-600'}`}
                                    >
                                        {user.is_blocked ? 'Desbloquear' : 'Bloquear'}
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <Pagination meta={meta} onPageChange={(p) => setPage(p)} />
        </div>
    );
}

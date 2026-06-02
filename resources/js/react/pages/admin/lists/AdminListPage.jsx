import { useState, useEffect } from 'react';
import apiClient from '../../../api/client';
import Pagination from '../../../components/ui/Pagination';

/**
 * Moderación de listas — Tabla con opción de eliminación.
 */
export default function AdminListPage() {
    const [lists, setLists] = useState([]);
    const [meta, setMeta] = useState(null);
    const [search, setSearch] = useState('');
    const [page, setPage] = useState(1);
    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState('');

    const loadLists = () => {
        setLoading(true);
        const params = { page };
        if (search) params.search = search;
        apiClient.get('/admin/lists', { params })
            .then((res) => {
                setLists(res.data.data);
                setMeta(res.data.meta);
                setLoading(false);
            })
            .catch((err) => {
                console.error(err);
                setLoading(false);
            });
    };

    useEffect(() => {
        loadLists();
    }, [page, search]);

    const handleDelete = async (id) => {
        if (!confirm('¿Estás seguro de que deseas eliminar esta lista permanentemente por ser ofensiva o inapropiada?')) return;
        try {
            await apiClient.delete(`/admin/lists/${id}`);
            setMessage('¡Lista eliminada correctamente por moderación!');
            loadLists();
        } catch (error) {
            console.error(error);
        }
    };

    return (
        <div>
            <h1 className="text-3xl font-black uppercase font-display mb-8">Moderación de Listas</h1>

            {message && (
                <div className="mb-4 p-4 bg-green-100 border border-green-400 text-green-800 font-bold text-sm shadow-[2px_2px_0px_#000]">
                    {message}
                </div>
            )}

            <div className="bg-white border-2 border-black p-4 mb-8">
                <input
                    type="text"
                    placeholder="Buscar listas por nombre, descripción o creador..."
                    className="neo-input w-full bg-white"
                    value={search}
                    onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                />
            </div>

            <div className="bg-white border-2 border-black overflow-hidden mb-8">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-black text-white text-xs font-bold uppercase tracking-wider">
                            <th className="p-4">Creador</th>
                            <th className="p-4">Lista</th>
                            <th className="p-4">Descripción</th>
                            <th className="p-4 text-center">Libros</th>
                            <th className="p-4 text-center">Likes</th>
                            <th className="p-4 text-right">Acciones</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-black/10">
                        {loading ? (
                            <tr>
                                <td colSpan="6" className="p-8 text-center">
                                    <div className="neo-spinner mx-auto"></div>
                                </td>
                            </tr>
                        ) : lists.length === 0 ? (
                            <tr>
                                <td colSpan="6" className="p-8 text-center text-gray-500 font-bold uppercase">
                                    No se encontraron listas
                                </td>
                            </tr>
                        ) : (
                            lists.map((list) => (
                                <tr key={list.id} className="hover:bg-gray-50 transition-colors">
                                    <td className="p-4">
                                        <span className="font-bold text-sm">{list.user?.name || 'Anónimo'}</span>
                                        <div className="text-xs text-gray-500">{list.user?.email}</div>
                                    </td>
                                    <td className="p-4">
                                        <div className="font-bold text-sm">{list.name}</div>
                                        <div className="text-xs text-gray-400 font-mono">ID: {list.id}</div>
                                    </td>
                                    <td className="p-4">
                                        <p className="text-xs text-gray-600 line-clamp-2">{list.description || 'Sin descripción'}</p>
                                    </td>
                                    <td className="p-4 text-center font-bold text-sm">
                                        {list.books_count ?? 0}
                                    </td>
                                    <td className="p-4 text-center font-bold text-sm">
                                        {list.likes_count ?? 0}
                                    </td>
                                    <td className="p-4 text-right">
                                        <button
                                            onClick={() => handleDelete(list.id)}
                                            className="text-xs font-black uppercase text-red-600 hover:underline"
                                        >
                                            Eliminar
                                        </button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            <Pagination meta={meta} onPageChange={(p) => setPage(p)} />
        </div>
    );
}

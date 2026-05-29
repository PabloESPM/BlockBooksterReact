import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import apiClient from '../../api/client';
import Pagination from '../../components/ui/Pagination';

/**
 * Gestión de autores en admin — Tabla con búsqueda, creación y eliminación.
 */
export default function AdminAuthorsPage() {
    const [authors, setAuthors] = useState([]);
    const [meta, setMeta] = useState(null);
    const [search, setSearch] = useState('');
    const [page, setPage] = useState(1);
    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState('');

    const loadAuthors = () => {
        setLoading(true);
        const params = { page };
        if (search) params.search = search;
        apiClient.get('/admin/authors', { params }).then((res) => {
            setAuthors(res.data.data);
            setMeta(res.data.meta);
            setLoading(false);
        });
    };

    useEffect(() => { loadAuthors(); }, [page, search]);

    const handleDelete = async (id) => {
        if (!confirm('¿Eliminar este autor permanentemente?')) return;
        await apiClient.delete(`/admin/authors/${id}`);
        setMessage('¡Autor eliminado!');
        loadAuthors();
    };

    return (
        <div>
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-black uppercase font-display">Autores</h1>
                <Link to="/admin/authors/create" className="neo-btn-primary px-6 py-2 text-sm">
                    + Nuevo Autor
                </Link>
            </div>

            {message && (
                <div className="mb-4 p-4 bg-green-100 border border-green-400 text-green-800 font-bold text-sm shadow-[2px_2px_0px_#000]">
                    {message}
                </div>
            )}

            <div className="bg-white border-2 border-black p-4 mb-8">
                <input
                    type="text"
                    placeholder="Buscar por nombre..."
                    className="neo-input w-full bg-white"
                    value={search}
                    onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                />
            </div>

            <div className="bg-white border-2 border-black overflow-hidden mb-8">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-black text-white text-xs font-bold uppercase tracking-wider">
                            <th className="p-4">Nombre</th>
                            <th className="p-4 text-center">Libros</th>
                            <th className="p-4 text-right">Acciones</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-black/10">
                        {loading ? (
                            <tr><td colSpan="3" className="p-8 text-center"><div className="neo-spinner mx-auto"></div></td></tr>
                        ) : authors.length === 0 ? (
                            <tr><td colSpan="3" className="p-8 text-center text-gray-500 font-bold uppercase">No se encontraron autores</td></tr>
                        ) : authors.map((author) => (
                            <tr key={author.id} className="hover:bg-gray-50 transition-colors">
                                <td className="p-4 font-bold">{author.full_name || author.name}</td>
                                <td className="p-4 text-center font-bold text-sm">{author.books_count ?? 0}</td>
                                <td className="p-4 text-right">
                                    <div className="flex justify-end gap-3">
                                        <Link to={`/admin/authors/${author.id}/edit`} className="text-xs font-black uppercase text-brand-blue hover:underline">
                                            Editar
                                        </Link>
                                        <button onClick={() => handleDelete(author.id)} className="text-xs font-black uppercase text-red-600 hover:underline border-l border-gray-300 pl-3">
                                            Eliminar
                                        </button>
                                    </div>
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

import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import apiClient from '../../../api/client';
import Pagination from '../../../components/ui/Pagination';

/**
 * Gestión de libros en admin — Tabla con búsqueda, filtro y CRUD.
 * Replica admin.books.index Livewire SFC.
 */
export default function AdminBooksPage() {
    const [books, setBooks] = useState([]);
    const [meta, setMeta] = useState(null);
    const [search, setSearch] = useState('');
    const [genreId, setGenreId] = useState('');
    const [genres, setGenres] = useState([]);
    const [page, setPage] = useState(1);
    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState('');

    // Cargar géneros
    useEffect(() => {
        apiClient.get('/genres').then((res) => setGenres(res.data.data));
    }, []);

    // Cargar libros
    useEffect(() => {
        setLoading(true);
        const params = { page };
        if (search) params.search = search;
        if (genreId) params.genre_id = genreId;
        apiClient.get('/admin/books', { params }).then((res) => {
            setBooks(res.data.data);
            setMeta(res.data.meta);
            setLoading(false);
        });
    }, [page, search, genreId]);

    const handleDelete = async (isbn) => {
        if (!confirm('¿Estás seguro que deseas eliminar permanentemente este libro y todas sus reseñas asociadas?')) return;
        await apiClient.delete(`/admin/books/${isbn}`);
        setMessage('¡Libro eliminado correctamente!');
        setBooks(books.filter(b => b.isbn !== isbn));
    };

    return (
        <div>
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-black uppercase font-display">Libros</h1>
                <Link to="/admin/books/create" className="neo-btn-primary px-6 py-2 text-sm">
                    + Añadir Nuevo Libro
                </Link>
            </div>

            {message && (
                <div className="mb-4 p-4 bg-green-100 border border-green-400 text-green-800 font-bold text-sm shadow-[2px_2px_0px_#000]">
                    {message}
                </div>
            )}

            {/* Filtros */}
            <div className="bg-white border-2 border-black p-4 mb-8 flex gap-4">
                <input
                    type="text"
                    placeholder="Buscar por título, autor, ISBN..."
                    className="neo-input flex-1 bg-white"
                    value={search}
                    onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                />
                <select
                    className="neo-input w-48 bg-white"
                    value={genreId}
                    onChange={(e) => { setGenreId(e.target.value); setPage(1); }}
                >
                    <option value="">Todos los Géneros</option>
                    {genres.map((g) => <option key={g.id} value={g.id}>{g.name}</option>)}
                </select>
            </div>

            {/* Tabla */}
            <div className="bg-white border-2 border-black overflow-hidden mb-8">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-black text-white text-xs font-bold uppercase tracking-wider">
                            <th className="p-4">Portada</th>
                            <th className="p-4">Título / ISBN</th>
                            <th className="p-4">Autor(es)</th>
                            <th className="p-4">Género</th>
                            <th className="p-4 text-center">Año</th>
                            <th className="p-4 text-right">Acciones</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-black/10">
                        {loading ? (
                            <tr><td colSpan="6" className="p-8 text-center"><div className="neo-spinner mx-auto"></div></td></tr>
                        ) : books.length === 0 ? (
                            <tr><td colSpan="6" className="p-8 text-center text-gray-500 font-bold uppercase">No se encontraron libros</td></tr>
                        ) : books.map((book) => (
                            <tr key={book.isbn} className="hover:bg-gray-50 transition-colors">
                                <td className="p-4">
                                    <div className="w-10 h-14 bg-gray-200 border border-black overflow-hidden">
                                        {book.cover_image || book.cover_path ? (
                                            <img
                                                src={book.cover_image || `${window.location.origin}/storage/${book.cover_path}`}
                                                alt=""
                                                className="w-full h-full object-cover"
                                                onError={(e) => {
                                                    e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(book.title)}&size=80&background=0E3FA9&color=fff&bold=true`;
                                                }}
                                            />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-xs text-gray-400 font-bold uppercase">Sin</div>
                                        )}
                                    </div>
                                </td>
                                <td className="p-4">
                                    <div className="font-bold leading-tight">{book.title}</div>
                                    <div className="text-xs text-gray-500 font-mono">{book.isbn}</div>
                                </td>
                                <td className="p-4 font-medium text-sm">
                                    {book.authors?.map(a => a.full_name || a.name).join(', ') || 'Anónimo'}
                                </td>
                                <td className="p-4">
                                    {book.genre ? (
                                        <span className="text-xs font-bold uppercase bg-brand-yellow/20 px-2 py-1 border border-black/20">
                                            {book.genre.name}
                                        </span>
                                    ) : (
                                        <span className="text-xs font-bold uppercase text-gray-400">N/A</span>
                                    )}
                                </td>
                                <td className="p-4 text-center font-bold text-sm text-gray-600">
                                    {book.publication_year ?? 'N/A'}
                                </td>
                                <td className="p-4 text-right">
                                    <div className="flex justify-end gap-3">
                                        <Link to={`/admin/books/${book.isbn}/edit`} className="text-xs font-black uppercase text-brand-blue hover:underline">
                                            Editar
                                        </Link>
                                        <button onClick={() => handleDelete(book.isbn)} className="text-xs font-black uppercase text-red-600 hover:underline border-l border-gray-300 pl-3">
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

import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import apiClient from '../../api/client';
import BookCard from '../../components/cards/BookCard';
import Pagination from '../../components/ui/Pagination';

/**
 * Catálogo de libros con filtros y paginación.
 * Replica pages.books.index con sidebar de filtros.
 */
export default function BooksIndexPage() {
    const [searchParams, setSearchParams] = useSearchParams();
    const [books, setBooks] = useState([]);
    const [meta, setMeta] = useState(null);
    const [filters, setFilters] = useState({ genres: [], languages: [], countries: [] });
    const [loading, setLoading] = useState(true);

    // Cargar datos de filtros
    useEffect(() => {
        Promise.all([
            apiClient.get('/genres'),
            apiClient.get('/languages'),
            apiClient.get('/countries'),
        ]).then(([g, l, c]) => {
            setFilters({
                genres: g.data.data,
                languages: l.data.data,
                countries: c.data.data,
            });
        });
    }, []);

    // Cargar libros según filtros de URL
    useEffect(() => {
        setLoading(true);
        apiClient.get('/books', { params: Object.fromEntries(searchParams) })
            .then((res) => {
                setBooks(res.data.data);
                setMeta(res.data.meta);
            })
            .finally(() => setLoading(false));
    }, [searchParams]);

    // Actualizar filtro en la URL
    const updateFilter = (key, value) => {
        const params = new URLSearchParams(searchParams);
        if (value) {
            params.set(key, value);
        } else {
            params.delete(key);
        }
        params.delete('page'); // Resetear página al cambiar filtro
        setSearchParams(params);
    };

    const handlePageChange = (page) => {
        const params = new URLSearchParams(searchParams);
        params.set('page', page);
        setSearchParams(params);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const clearFilters = () => {
        setSearchParams({});
    };

    return (
        <div className="max-w-7xl mx-auto px-4 py-8">
            <h1 className="text-3xl font-black uppercase tracking-tight mb-8">
                Catálogo de Libros
            </h1>

            <div className="flex flex-col md:flex-row gap-6">
                {/* Sidebar de filtros */}
                <aside className="w-full md:w-64 shrink-0">
                    <div className="neo-card p-4 space-y-4 sticky top-20">
                        <h3 className="text-xs font-black uppercase tracking-widest border-b-2 border-black pb-2">
                            Filtros
                        </h3>

                        {/* Búsqueda por título */}
                        <div>
                            <label className="text-xs font-bold uppercase mb-1 block">Título</label>
                            <input
                                type="text"
                                className="neo-input text-sm"
                                placeholder="Buscar título..."
                                value={searchParams.get('title') || ''}
                                onChange={(e) => updateFilter('title', e.target.value)}
                            />
                        </div>

                        {/* Género */}
                        <div>
                            <label className="text-xs font-bold uppercase mb-1 block">Género</label>
                            <select
                                className="neo-input text-sm bg-white"
                                value={searchParams.get('genre') || ''}
                                onChange={(e) => updateFilter('genre', e.target.value)}
                            >
                                <option value="">Todos</option>
                                {filters.genres.map((g) => (
                                    <option key={g.id} value={g.id}>{g.name}</option>
                                ))}
                            </select>
                        </div>

                        {/* Idioma */}
                        <div>
                            <label className="text-xs font-bold uppercase mb-1 block">Idioma</label>
                            <select
                                className="neo-input text-sm bg-white"
                                value={searchParams.get('language') || ''}
                                onChange={(e) => updateFilter('language', e.target.value)}
                            >
                                <option value="">Todos</option>
                                {filters.languages.map((l) => (
                                    <option key={l.id} value={l.code}>{l.name}</option>
                                ))}
                            </select>
                        </div>

                        {/* Ordenación */}
                        <div>
                            <label className="text-xs font-bold uppercase mb-1 block">Ordenar por</label>
                            <select
                                className="neo-input text-sm bg-white"
                                value={searchParams.get('sort') || ''}
                                onChange={(e) => updateFilter('sort', e.target.value)}
                            >
                                <option value="">Más recientes</option>
                                <option value="oldest">Más antiguos</option>
                                <option value="title_asc">Título A-Z</option>
                                <option value="title_desc">Título Z-A</option>
                            </select>
                        </div>

                        {/* Limpiar */}
                        <button onClick={clearFilters} className="w-full neo-btn-secondary text-xs">
                            Limpiar filtros
                        </button>
                    </div>
                </aside>

                {/* Grid de libros */}
                <div className="flex-grow">
                    {loading ? (
                        <div className="flex justify-center py-20">
                            <div className="neo-spinner"></div>
                        </div>
                    ) : books.length === 0 ? (
                        <div className="neo-card p-12 text-center">
                            <p className="text-lg font-bold mb-2">No se encontraron libros</p>
                            <p className="text-sm text-gray-500">Intenta con otros filtros de búsqueda.</p>
                        </div>
                    ) : (
                        <>
                            <p className="text-xs font-bold text-gray-500 uppercase mb-4">
                                {meta?.total} libro{meta?.total !== 1 ? 's' : ''} encontrado{meta?.total !== 1 ? 's' : ''}
                            </p>
                            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                                {books.map((book) => (
                                    <BookCard key={book.isbn} book={book} />
                                ))}
                            </div>
                            <Pagination meta={meta} onPageChange={handlePageChange} />
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}

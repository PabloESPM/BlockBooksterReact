import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import bookService from '../../services/bookService';
import lookupCache from '../../utils/lookupCache';
import BookCard from '../../components/cards/BookCard';
import Pagination from '../../components/ui/Pagination';
import AdvancedSearch from '../../components/books/AdvancedSearch';
import BookFilters from '../../components/books/BookFilters';

/**
 * Catálogo de libros con filtros avanzados, filtros laterales y paginación.
 * Replica el diseño y comportamiento de la página explorar libros Livewire.
 */
export default function BooksIndexPage() {
    const [searchParams, setSearchParams] = useSearchParams();
    const [books, setBooks] = useState([]);
    const [meta, setMeta] = useState(null);
    const [filters, setFilters] = useState({ genres: [], languages: [], countries: [] });
    const [loading, setLoading] = useState(true);
    const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState(false);

    // Cargar datos de filtros iniciales (géneros, idiomas, países) usando la caché en sessionStorage
    useEffect(() => {
        Promise.all([
            lookupCache.getGenres(),
            lookupCache.getLanguages(),
            lookupCache.getCountries(),
        ]).then(([genres, languages, countries]) => {
            setFilters({
                genres: genres || [],
                languages: languages || [],
                countries: countries || [],
            });
        }).catch((err) => {
            console.error('Error loading filters meta data:', err);
        });
    }, []);

    // Cargar listado de libros según parámetros de búsqueda de la URL con AbortController para prevenir race conditions
    useEffect(() => {
        setLoading(true);
        const controller = new AbortController();

        bookService.getBooks(Object.fromEntries(searchParams), { signal: controller.signal })
            .then((resData) => {
                setBooks(resData.data || []);
                setMeta(resData.meta || null);
                setLoading(false);
            })
            .catch((err) => {
                if (err.name === 'CanceledError' || err.name === 'AbortError' || err.message === 'canceled') {
                    // Ignorar error de cancelación intencionada
                    return;
                }
                console.error('Error fetching filtered books:', err);
                setLoading(false);
            });

        return () => {
            controller.abort();
        };
    }, [searchParams]);

    // Actualizar un filtro específico en la URL
    const updateFilter = (key, value) => {
        const params = new URLSearchParams(searchParams);
        if (value) {
            params.set(key, value);
        } else {
            params.delete(key);
        }
        
        // Si se actualiza la búsqueda unificada, limpiar los parámetros antiguos
        if (key === 'search') {
            params.delete('title');
            params.delete('author');
            params.delete('isbn');
        }
        
        params.delete('page'); // Resetear página al modificar cualquier filtro
        setSearchParams(params);
    };

    // Cambiar de página
    const handlePageChange = (page) => {
        const params = new URLSearchParams(searchParams);
        params.set('page', page);
        setSearchParams(params);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    // Restablecer todos los filtros a sus valores por defecto
    const clearFilters = () => {
        setSearchParams({});
    };

    return (
        <div className="max-w-7xl mx-auto px-4 py-8">
            {/* Barra Superior: Búsqueda Avanzada */}
            <AdvancedSearch
                searchParams={searchParams}
                updateFilter={updateFilter}
                loading={loading}
            />

            <div className="flex flex-col lg:flex-row gap-12">
                {/* Filtros Laterales (Desktop sticky sidebar y Mobile drawer modal) */}
                <BookFilters
                    searchParams={searchParams}
                    updateFilter={updateFilter}
                    clearFilters={clearFilters}
                    genres={filters.genres}
                    countries={filters.countries}
                    languages={filters.languages}
                    isOpen={isMobileFiltersOpen}
                    onClose={() => setIsMobileFiltersOpen(false)}
                    loading={loading}
                />

                {/* Cuadrícula Principal de Resultados */}
                <div className="flex-1">
                    <div className="flex justify-between items-end mb-8">
                        <h1 className="text-4xl font-display font-black uppercase flex items-center">
                            <span className="bg-brand-yellow px-2 border-2 border-black mr-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] text-2xl">
                                {meta?.total || 0}
                            </span>
                            Libros
                        </h1>
                        {/* Botón de Filtros Móvil */}
                        <button
                            onClick={() => setIsMobileFiltersOpen(true)}
                            className="lg:hidden font-bold uppercase border-2 border-black px-4 py-2 hover:bg-gray-100 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none bg-white transition-all"
                        >
                            Filtros
                        </button>
                    </div>

                    {/* Indicador de carga global */}
                    {loading && (
                        <div className="flex items-center justify-center gap-3 py-6">
                            <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin"></div>
                            <span className="font-bold uppercase text-sm text-gray-500">Cargando resultados...</span>
                        </div>
                    )}

                    {/* Contenido / Estado Vacío */}
                    {!loading && books.length === 0 ? (
                        <div className="text-center py-12">
                            <p className="text-xl font-bold uppercase text-gray-500">No se han encontrado libros.</p>
                        </div>
                    ) : (
                        <div className={`${loading ? 'hidden' : 'grid'} grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 gap-6`}>
                            {books.map((book) => (
                                <div key={book.isbn} className="h-full">
                                    <BookCard book={book} />
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Paginación */}
                    {!loading && meta && (
                        <div>
                            <Pagination meta={meta} onPageChange={handlePageChange} />
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

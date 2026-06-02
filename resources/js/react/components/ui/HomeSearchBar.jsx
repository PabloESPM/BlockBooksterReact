import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import apiClient from '../../api/client';

/**
 * Componente de barra de búsqueda para la HomePage.
 * Aísla el estado de la búsqueda para evitar re-renderizados de toda la HomePage al teclear.
 */
export default function HomeSearchBar() {
    const navigate = useNavigate();

    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState(null);
    const [showSearch, setShowSearch] = useState(false);
    const searchRef = useRef(null);
    const debounceRef = useRef(null);

    // Cerrar sugerencias al hacer clic fuera del buscador
    useEffect(() => {
        const handler = (e) => {
            if (searchRef.current && !searchRef.current.contains(e.target)) {
                setShowSearch(false);
            }
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    // Búsqueda con debounce en tiempo real
    const handleSearchInput = (value) => {
        setSearchQuery(value);
        if (debounceRef.current) clearTimeout(debounceRef.current);

        if (value.trim().length < 2) {
            setSearchResults(null);
            return;
        }

        debounceRef.current = setTimeout(async () => {
            try {
                const res = await apiClient.get('/search', { params: { q: value } });
                setSearchResults(res.data);
                setShowSearch(true);
            } catch {
                setSearchResults(null);
            }
        }, 300);
    };

    const handleSearchSubmit = (e) => {
        e.preventDefault();
        if (searchQuery.trim()) {
            navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
            setShowSearch(false);
        }
    };

    return (
        <div ref={searchRef} className="mb-10 max-w-xl mx-auto relative z-30 px-4">
            <form onSubmit={handleSearchSubmit} className="flex gap-2">
                <input
                    type="text"
                    placeholder="Buscar libros, autores..."
                    value={searchQuery}
                    onChange={(e) => handleSearchInput(e.target.value)}
                    className="flex-grow px-4 py-3 text-sm md:text-base text-black border-2 border-black bg-white focus:outline-none focus:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] font-bold placeholder:text-gray-400"
                />
                <button
                    type="submit"
                    className="bg-brand-yellow text-black border-2 border-black font-black uppercase px-6 py-3 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:-translate-y-[2px] hover:shadow-[6px_6px_0px_#000] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none transition-all cursor-pointer text-sm md:text-base"
                >
                    Buscar
                </button>
            </form>

            {/* Menú de sugerencias en tiempo real */}
            {showSearch && searchResults && (
                <div className="absolute left-4 right-4 top-full mt-3 bg-white border-2 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] z-50 max-h-96 overflow-y-auto text-left">
                    {searchResults.total_results === 0 ? (
                        <p className="p-4 text-sm text-gray-500 font-bold uppercase text-center">
                            Sin resultados
                        </p>
                    ) : (
                        <div className="divide-y-2 divide-black">
                            {/* Libros sugeridos */}
                            {searchResults.books?.length > 0 && (
                                <div className="p-4">
                                    <p className="text-xs font-black uppercase text-brand-blue mb-2">Libros</p>
                                    <div className="space-y-2">
                                        {searchResults.books.slice(0, 4).map((book) => (
                                            <Link
                                                key={book.isbn}
                                                to={`/books/${book.isbn}`}
                                                onClick={() => setShowSearch(false)}
                                                className="flex items-center gap-3 p-1.5 hover:bg-gray-50 border border-transparent hover:border-black/10 transition-all"
                                            >
                                                <img
                                                    src={book.cover_image || 'https://via.placeholder.com/30x45'}
                                                    alt={book.title}
                                                    className="w-8 h-12 object-cover border border-black"
                                                    onError={(e) => {
                                                        const fallback = 'https://via.placeholder.com/30x45';
                                                        if (e.target.src !== fallback) {
                                                            e.target.src = fallback;
                                                        }
                                                    }}
                                                />
                                                <div className="min-w-0">
                                                    <span className="block text-sm font-bold text-black hover:text-brand-blue truncate">
                                                        {book.title}
                                                    </span>
                                                    <span className="block text-xs text-gray-500 truncate">
                                                        {book.authors?.map(a => a.name).join(', ') || 'Autor desconocido'}
                                                    </span>
                                                </div>
                                            </Link>
                                        ))}
                                    </div>
                                </div>
                            )}
                            {/* Autores sugeridos */}
                            {searchResults.authors?.length > 0 && (
                                <div className="p-4">
                                    <p className="text-xs font-black uppercase text-brand-blue mb-2">Autores</p>
                                    <div className="space-y-2">
                                        {searchResults.authors.slice(0, 4).map((author) => (
                                            <Link
                                                key={author.id}
                                                to={`/authors/${author.id}`}
                                                onClick={() => setShowSearch(false)}
                                                className="flex items-center gap-3 p-1.5 hover:bg-gray-50 border border-transparent hover:border-black/10 transition-all"
                                            >
                                                <div className="w-8 h-8 rounded-full bg-gray-200 border border-black overflow-hidden shrink-0 flex items-center justify-center">
                                                    <img
                                                        src={author.photo || `https://ui-avatars.com/api/?name=${encodeURIComponent(author.name)}&size=80`}
                                                        alt={author.name}
                                                        className="w-full h-full object-cover"
                                                        onError={(e) => {
                                                            const fallback = `https://ui-avatars.com/api/?name=${encodeURIComponent(author.name)}&size=80`;
                                                            if (e.target.src !== fallback) {
                                                                e.target.src = fallback;
                                                            }
                                                        }}
                                                    />
                                                </div>
                                                <span className="text-sm font-bold text-black hover:text-brand-blue truncate">
                                                    {author.full_name || author.name}
                                                </span>
                                            </Link>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                    {/* Enlace a resultados de búsqueda globales */}
                    <div className="p-3 border-t-2 border-black bg-gray-50">
                        <Link
                            to={`/search?q=${encodeURIComponent(searchQuery)}`}
                            onClick={() => setShowSearch(false)}
                            className="block text-center text-xs font-bold uppercase text-brand-blue hover:underline"
                        >
                            Ver todos los resultados ({searchResults.total_results || 0}) →
                        </Link>
                    </div>
                </div>
            )}
        </div>
    );
}

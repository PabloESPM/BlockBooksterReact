import { useState, useEffect } from 'react';

/**
 * Componente de Búsqueda Avanzada.
 * Ofrece campos de texto para Título, Autor e ISBN, con debouncing integrado
 * para sincronizarse con los parámetros de la URL sin sobrecargar la API.
 */
export default function AdvancedSearch({ searchParams, updateFilter, loading }) {
    const [localTitle, setLocalTitle] = useState(searchParams.get('title') || '');
    const [localAuthor, setLocalAuthor] = useState(searchParams.get('author') || '');
    const [localIsbn, setLocalIsbn] = useState(searchParams.get('isbn') || '');

    // Sincronizar estados locales cuando cambian los parámetros de la URL
    useEffect(() => {
        setLocalTitle(searchParams.get('title') || '');
        setLocalAuthor(searchParams.get('author') || '');
        setLocalIsbn(searchParams.get('isbn') || '');
    }, [searchParams]);

    // Debounce para el Título (400ms)
    useEffect(() => {
        const timer = setTimeout(() => {
            if (localTitle !== (searchParams.get('title') || '')) {
                updateFilter('title', localTitle);
            }
        }, 400);
        return () => clearTimeout(timer);
    }, [localTitle]);

    // Debounce para el Autor (400ms)
    useEffect(() => {
        const timer = setTimeout(() => {
            if (localAuthor !== (searchParams.get('author') || '')) {
                updateFilter('author', localAuthor);
            }
        }, 400);
        return () => clearTimeout(timer);
    }, [localAuthor]);

    // Debounce para el ISBN (400ms)
    useEffect(() => {
        const timer = setTimeout(() => {
            if (localIsbn !== (searchParams.get('isbn') || '')) {
                updateFilter('isbn', localIsbn);
            }
        }, 400);
        return () => clearTimeout(timer);
    }, [localIsbn]);

    return (
        <div className="neo-card p-6 mb-12 bg-gray-100">
            <h2 className="text-xl font-black uppercase mb-4 flex items-center gap-2">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                          d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
                </svg>
                Búsqueda Avanzada
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <input
                    type="text"
                    placeholder="Título"
                    value={localTitle}
                    onChange={(e) => setLocalTitle(e.target.value)}
                    className="neo-input bg-white"
                />
                <input
                    type="text"
                    placeholder="Autor"
                    value={localAuthor}
                    onChange={(e) => setLocalAuthor(e.target.value)}
                    className="neo-input bg-white"
                />
                <input
                    type="text"
                    placeholder="ISBN"
                    value={localIsbn}
                    onChange={(e) => setLocalIsbn(e.target.value)}
                    className="neo-input bg-white"
                />
                {/* Indicador de carga durante la búsqueda */}
                <div className="flex items-center justify-center">
                    {loading ? (
                        <div className="flex items-center gap-2 text-sm font-bold uppercase text-gray-500">
                            <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin"></div>
                            Buscando...
                        </div>
                    ) : (
                        <span className="text-sm font-bold uppercase text-gray-400">
                            Escribe para buscar
                        </span>
                    )}
                </div>
            </div>
        </div>
    );
}

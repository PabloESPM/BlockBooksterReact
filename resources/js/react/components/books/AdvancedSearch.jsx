import { useState, useEffect } from 'react';

/**
 * Componente de Búsqueda de Libros.
 * Ofrece un único campo de búsqueda unificado para Título, Autor e ISBN,
 * con debouncing integrado para sincronizarse con los parámetros de la URL.
 */
export default function AdvancedSearch({ searchParams, updateFilter, loading }) {
    const [localSearch, setLocalSearch] = useState(searchParams.get('search') || '');

    // Sincronizar estado local cuando cambia el parámetro 'search' en la URL
    useEffect(() => {
        setLocalSearch(searchParams.get('search') || '');
    }, [searchParams]);

    // Debounce para la Búsqueda (400ms)
    useEffect(() => {
        const timer = setTimeout(() => {
            if (localSearch !== (searchParams.get('search') || '')) {
                updateFilter('search', localSearch);
            }
        }, 400);
        return () => clearTimeout(timer);
    }, [localSearch]);

    return (
        <div className="neo-card p-6 mb-12 bg-gray-100">
            <h2 className="text-xl font-black uppercase mb-4 flex items-center gap-2">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                          d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
                </svg>
                Búsqueda de Libros
            </h2>

            {/* Contenedor neo-brutalista de entrada única con interacción en focus */}
            <div className="flex items-stretch border-2 border-black bg-white transition-all shadow-[4px_4px_0px_#000] focus-within:shadow-[6px_6px_0px_#000] focus-within:-translate-y-0.5">
                {/* Icono decorativo de búsqueda */}
                <div className="flex items-center px-4 border-r-2 border-black text-gray-800 shrink-0 bg-gray-50">
                    <svg className="w-5 h-5 text-gray-800" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5}
                              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
                    </svg>
                </div>

                {/* Campo unificado */}
                <input
                    type="text"
                    placeholder="Buscar por título, autor o ISBN…"
                    value={localSearch}
                    onChange={(e) => setLocalSearch(e.target.value)}
                    className="flex-1 px-4 py-3 bg-transparent outline-none text-base font-bold placeholder-gray-400 w-full text-black"
                />

                {/* Indicador de carga integrado — aparece solo durante la búsqueda */}
                {loading && (
                    <div className="flex items-center gap-2 px-4 border-l-2 border-black shrink-0 bg-gray-50">
                        <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin"></div>
                        <span className="hidden sm:inline text-[10px] font-black uppercase tracking-widest text-gray-500">
                            Buscando…
                        </span>
                    </div>
                )}
            </div>
        </div>
    );
}

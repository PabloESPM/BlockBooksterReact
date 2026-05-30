import { useState, useEffect } from 'react';

/**
 * Componente de Filtros de Libros.
 * Renders a sticky sidebar on desktop, and a sliding drawer modal on mobile.
 */
export default function BookFilters({
    searchParams,
    updateFilter,
    clearFilters,
    genres = [],
    countries = [],
    languages = [],
    isOpen = false,
    onClose = () => {},
    loading = false,
}) {
    // Rango de páginas
    const [localPagesFrom, setLocalPagesFrom] = useState(searchParams.get('pages_from') || '');
    const [localPagesTo, setLocalPagesTo] = useState(searchParams.get('pages_to') || '');

    // Año de publicación
    const [localYearFrom, setLocalYearFrom] = useState(searchParams.get('year_from') || '');
    const [localYearTo, setLocalYearTo] = useState(searchParams.get('year_to') || '');

    // Sincronizar estados locales al cambiar parámetros externamente
    useEffect(() => {
        setLocalPagesFrom(searchParams.get('pages_from') || '');
        setLocalPagesTo(searchParams.get('pages_to') || '');
        setLocalYearFrom(searchParams.get('year_from') || '');
        setLocalYearTo(searchParams.get('year_to') || '');
    }, [searchParams]);

    // Debounce para páginas desde (500ms)
    useEffect(() => {
        const timer = setTimeout(() => {
            if (localPagesFrom !== (searchParams.get('pages_from') || '')) {
                updateFilter('pages_from', localPagesFrom);
            }
        }, 500);
        return () => clearTimeout(timer);
    }, [localPagesFrom]);

    // Debounce para páginas hasta (500ms)
    useEffect(() => {
        const timer = setTimeout(() => {
            if (localPagesTo !== (searchParams.get('pages_to') || '')) {
                updateFilter('pages_to', localPagesTo);
            }
        }, 500);
        return () => clearTimeout(timer);
    }, [localPagesTo]);

    // Debounce para año desde (500ms)
    useEffect(() => {
        const timer = setTimeout(() => {
            if (localYearFrom !== (searchParams.get('year_from') || '')) {
                updateFilter('year_from', localYearFrom);
            }
        }, 500);
        return () => clearTimeout(timer);
    }, [localYearFrom]);

    // Debounce para año hasta (500ms)
    useEffect(() => {
        const timer = setTimeout(() => {
            if (localYearTo !== (searchParams.get('year_to') || '')) {
                updateFilter('year_to', localYearTo);
            }
        }, 500);
        return () => clearTimeout(timer);
    }, [localYearTo]);

    const renderFiltersContent = () => (
        <>
            {/* Ordenar por */}
            <div className="mb-6">
                <h3 className="font-black text-sm mb-2 uppercase border-b-2 border-black pb-1">Ordenar por</h3>
                <select
                    value={searchParams.get('sort') || ''}
                    onChange={(e) => updateFilter('sort', e.target.value)}
                    className="neo-input w-full text-sm bg-white"
                >
                    <option value="">Seleccionar orden</option>
                    <option value="newest">Más recientes primero</option>
                    <option value="oldest">Más antiguos primero</option>
                    <option value="title_asc">Título A-Z</option>
                    <option value="title_desc">Título Z-A</option>
                </select>
            </div>

            {/* Género */}
            <div className="mb-6">
                <h3 className="font-black text-sm mb-2 uppercase border-b-2 border-black pb-1">Género</h3>
                <select
                    value={searchParams.get('genre') || ''}
                    onChange={(e) => updateFilter('genre', e.target.value)}
                    className="neo-input w-full text-sm bg-white"
                >
                    <option value="">Todos los géneros</option>
                    {genres.map((g) => (
                        <option key={g.id} value={g.id}>{g.name}</option>
                    ))}
                </select>
            </div>

            {/* País del autor */}
            <div className="mb-6">
                <h3 className="font-black text-sm mb-2 uppercase border-b-2 border-black pb-1">País del autor</h3>
                <select
                    value={searchParams.get('country') || ''}
                    onChange={(e) => updateFilter('country', e.target.value)}
                    className="neo-input w-full text-sm bg-white"
                >
                    <option value="">Todos los países</option>
                    {countries.map((c) => (
                        <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                </select>
            </div>

            {/* Idioma */}
            <div className="mb-6">
                <h3 className="font-black text-sm mb-2 uppercase border-b-2 border-black pb-1">Idioma</h3>
                <select
                    value={searchParams.get('language') || ''}
                    onChange={(e) => updateFilter('language', e.target.value)}
                    className="neo-input w-full text-sm bg-white"
                >
                    <option value="">Todos los idiomas</option>
                    {languages.map((l) => (
                        <option key={l.id} value={l.code}>{l.name}</option>
                    ))}
                </select>
            </div>

            {/* Rango de páginas */}
            <div className="mb-6">
                <h3 className="font-black text-sm mb-2 uppercase border-b-2 border-black pb-1">Rango de páginas</h3>
                <div className="flex gap-2">
                    <input
                        type="number"
                        placeholder="Mín"
                        value={localPagesFrom}
                        onChange={(e) => setLocalPagesFrom(e.target.value)}
                        className="neo-input w-full text-sm px-2 bg-white"
                    />
                    <input
                        type="number"
                        placeholder="Máx"
                        value={localPagesTo}
                        onChange={(e) => setLocalPagesTo(e.target.value)}
                        className="neo-input w-full text-sm px-2 bg-white"
                    />
                </div>
            </div>

            {/* Año de publicación */}
            <div className="mb-6">
                <h3 className="font-black text-sm mb-2 uppercase border-b-2 border-black pb-1">Año de publicación</h3>
                <div className="flex gap-2">
                    <input
                        type="number"
                        placeholder="Desde"
                        value={localYearFrom}
                        onChange={(e) => setLocalYearFrom(e.target.value)}
                        className="neo-input w-full text-sm px-2 bg-white"
                    />
                    <input
                        type="number"
                        placeholder="Hasta"
                        value={localYearTo}
                        onChange={(e) => setLocalYearTo(e.target.value)}
                        className="neo-input w-full text-sm px-2 bg-white"
                    />
                </div>
            </div>

            {/* Valoración */}
            <div className="mb-6">
                <h3 className="font-black text-sm mb-4 uppercase inline-block bg-brand-yellow px-2 py-0.5 border border-black">
                    Valoración
                </h3>
                <div className="space-y-2 font-bold text-sm">
                    {[5, 4, 3, 2, 1].map((ratingValue) => (
                        <label key={ratingValue} className="flex items-center space-x-3 cursor-pointer group">
                            <input
                                type="radio"
                                name="rating"
                                value={ratingValue}
                                checked={searchParams.get('rating') === String(ratingValue)}
                                onChange={(e) => updateFilter('rating', e.target.value)}
                                className="w-4 h-4 border-2 border-black rounded-full focus:ring-0 checked:bg-brand-yellow checked:text-black appearance-none checked:border-brand-yellow transition-all"
                                style={{
                                    boxShadow: searchParams.get('rating') === String(ratingValue) ? 'inset 0 0 0 4px #000' : 'none',
                                    backgroundColor: searchParams.get('rating') === String(ratingValue) ? '#FFDE4D' : '#FFF'
                                }}
                            />
                            <span className="group-hover:translate-x-1 transition-transform flex items-center gap-1">
                                {ratingValue}+ <span className="text-brand-yellow text-lg leading-none">★</span>
                            </span>
                        </label>
                    ))}
                </div>
            </div>

            {/* Indicador de carga */}
            {loading && (
                <div className="flex items-center justify-center gap-2 text-sm font-bold text-gray-500 py-2">
                    <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin"></div>
                    Aplicando filtros...
                </div>
            )}

            {/* Botón restablecer filtros */}
            <button onClick={clearFilters} className="neo-btn-secondary w-full block text-center text-sm mt-4">
                Restablecer filtros
            </button>
        </>
    );

    return (
        <>
            {/* Sidebar de Escritorio (Visible en lg) */}
            <aside className="w-full lg:w-72 flex-shrink-0 hidden lg:block">
                <div className="neo-card p-6 sticky top-24 space-y-8 bg-white">
                    {renderFiltersContent()}
                </div>
            </aside>

            {/* Modal Drawer de Móvil (Visible bajo lg) */}
            {isOpen && (
                <div 
                    className="fixed inset-0 z-50 lg:hidden flex justify-end bg-black/50 backdrop-blur-sm"
                    onClick={onClose}
                >
                    <div
                        className="w-full max-w-xs bg-white border-l-4 border-black h-full overflow-y-auto p-6 shadow-[-4px_0px_0px_#000] relative"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="flex justify-between items-center mb-6 border-b-2 border-black pb-2">
                            <h2 className="font-black text-lg uppercase">Filtros</h2>
                            <button 
                                onClick={onClose} 
                                className="font-bold border-2 border-black px-2 py-0.5 bg-white hover:bg-gray-100"
                            >
                                ✕
                            </button>
                        </div>
                        <div>
                            {renderFiltersContent()}
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}

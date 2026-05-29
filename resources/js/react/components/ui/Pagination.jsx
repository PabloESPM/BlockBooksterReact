
/**
 * Componente de paginación estilo Neo-Brutalism.
 * Recibe metadatos de paginación de la API y un callback onPageChange.
 */
export default function Pagination({ meta, onPageChange }) {
    if (!meta || meta.last_page <= 1) return null;

    const { current_page, last_page } = meta;

    // Generar array de páginas visibles (máximo 5 centradas)
    const getPages = () => {
        const pages = [];
        let start = Math.max(1, current_page - 2);
        let end = Math.min(last_page, start + 4);
        start = Math.max(1, end - 4);

        for (let i = start; i <= end; i++) {
            pages.push(i);
        }
        return pages;
    };

    return (
        <div className="flex items-center justify-center gap-2 mt-8">
            {/* Anterior */}
            <button
                onClick={() => onPageChange(current_page - 1)}
                disabled={current_page === 1}
                className="neo-btn-secondary !px-3 !py-2 text-sm disabled:opacity-40 disabled:cursor-not-allowed"
            >
                ←
            </button>

            {/* Números de página */}
            {getPages().map((page) => (
                <button
                    key={page}
                    onClick={() => onPageChange(page)}
                    className={`border-2 border-black font-bold px-3 py-2 text-sm transition-all ${
                        page === current_page
                            ? 'bg-brand-yellow shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]'
                            : 'bg-white hover:bg-gray-100'
                    }`}
                >
                    {page}
                </button>
            ))}

            {/* Siguiente */}
            <button
                onClick={() => onPageChange(current_page + 1)}
                disabled={current_page === last_page}
                className="neo-btn-secondary !px-3 !py-2 text-sm disabled:opacity-40 disabled:cursor-not-allowed"
            >
                →
            </button>
        </div>
    );
}

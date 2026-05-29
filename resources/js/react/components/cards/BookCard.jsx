import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

/**
 * Tarjeta de libro estilo Neo-Brutalism.
 * Muestra portada, título, autores, valoración media y botones de acción rápida.
 */
export default function BookCard({ book }) {
    const { isAuthenticated } = useAuth();
    const fallbackUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(book.title)}&size=400&background=0E3FA9&color=fff&bold=true&font-size=0.3`;
    
    // URL de la portada (con fallback y resolución absoluta)
    const coverUrl = book.cover_image
        ? book.cover_image
        : (book.cover_path
            ? `${window.location.origin}/storage/${book.cover_path.replace(/^\/?(storage\/)?/, '')}`
            : fallbackUrl);

    // Nombres de autores
    const authorNames = book.authors?.map(a => a.full_name || a.name).join(', ') || 'Autor desconocido';

    const handleAddToList = (e) => {
        e.preventDefault();
        e.stopPropagation();
        window.dispatchEvent(new CustomEvent('open-add-to-list-modal', { detail: { bookId: book.isbn } }));
    };

    const handleAddReview = (e) => {
        e.preventDefault();
        e.stopPropagation();
        window.dispatchEvent(new CustomEvent('open-add-review-modal', { detail: { bookId: book.isbn } }));
    };

    return (
        <div className="group relative flex flex-col h-full bg-white border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:-translate-y-1 transition-all">
            {/* Enlace a la página del libro */}
            <Link
                to={`/books/${book.isbn}`}
                className="absolute inset-0 z-10 focus:outline-none"
                aria-label={`Ver ${book.title}`}
            />

            {/* Imagen de portada (ratio de aspecto 2:3) */}
            <div className="aspect-[2/3] w-full border-b-2 border-black relative overflow-hidden bg-gray-100">
                <img
                    src={coverUrl}
                    alt={book.title}
                    className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-300"
                    loading="lazy"
                    onError={(e) => {
                        e.target.src = fallbackUrl;
                    }}
                />

                {/* Badge de valoración */}
                {book.average_rating > 0 && (
                    <div className="absolute top-2 right-2 bg-brand-yellow border-2 border-black px-2 py-1 font-bold text-xs shadow-sm">
                        {Number(book.average_rating).toFixed(1)} ★
                    </div>
                )}
            </div>

            {/* Panel de información */}
            <div className="p-3 flex flex-col flex-grow">
                <h3 className="font-display font-bold text-lg leading-tight mb-1 truncate">{book.title}</h3>
                <p className="text-sm text-gray-600 truncate mb-3">{authorNames}</p>

                {/* Botones de Acción: Lista y Reseña */}
                <div className="mt-auto pt-2 border-t-2 border-black/10 flex justify-between items-center relative z-20">
                    {isAuthenticated ? (
                        <button
                            onClick={handleAddToList}
                            className="text-xs font-bold uppercase hover:bg-brand-yellow hover:text-black px-2 py-1 -ml-2 transition-colors cursor-pointer"
                        >
                            + Lista
                        </button>
                    ) : (
                        <div />
                    )}
                    {isAuthenticated && (
                        <button
                            onClick={handleAddReview}
                            className="text-xs font-bold uppercase hover:bg-brand-blue hover:text-white px-2 py-1 -mr-2 transition-colors cursor-pointer"
                        >
                            + Reseña
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}

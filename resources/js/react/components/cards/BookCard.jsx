import { Link } from 'react-router-dom';
import RatingStars from '../ui/RatingStars';

/**
 * Tarjeta de libro estilo Neo-Brutalism.
 * Muestra portada, título, autores y valoración media.
 */
export default function BookCard({ book }) {
    const fallbackUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(book.title)}&size=400&background=0E3FA9&color=fff&bold=true&font-size=0.3`;
    
    // URL de la portada (con fallback y resolución absoluta)
    const coverUrl = book.cover_image
        ? book.cover_image
        : (book.cover_path
            ? `${window.location.origin}/storage/${book.cover_path.replace(/^\/?(storage\/)?/, '')}`
            : fallbackUrl);

    // Nombres de autores
    const authorNames = book.authors?.map(a => a.full_name || a.name).join(', ') || 'Autor desconocido';

    return (
        <Link
            to={`/books/${book.isbn}`}
            className="block neo-card neo-shadow-hover overflow-hidden group"
        >
            {/* Portada */}
            <div className="aspect-[2/3] overflow-hidden border-b-2 border-black">
                <img
                    src={coverUrl}
                    alt={book.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    loading="lazy"
                    onError={(e) => {
                        e.target.src = fallbackUrl;
                    }}
                />
            </div>

            {/* Información */}
            <div className="p-3">
                <h3 className="font-bold text-sm leading-tight mb-1 line-clamp-2">
                    {book.title}
                </h3>
                <p className="text-xs text-gray-500 font-medium mb-2 line-clamp-1">
                    {authorNames}
                </p>

                {/* Rating */}
                {book.average_rating > 0 && (
                    <RatingStars rating={book.average_rating} size="sm" />
                )}

                {/* Año de publicación */}
                {book.publication_year && (
                    <span className="text-xs text-gray-400 font-bold mt-1 block">
                        {book.publication_year}
                    </span>
                )}
            </div>
        </Link>
    );
}

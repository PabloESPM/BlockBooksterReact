import { Link } from 'react-router-dom';
import LikeButton from '../ui/LikeButton';

/**
 * Tarjeta de reseña estilo Neo-Brutalism.
 */
export default function ReviewCard({ review, showBook = true, showActions = false, onEdit, onDelete }) {
    const avatarUrl = review.user?.avatar_url
        || `https://ui-avatars.com/api/?name=${encodeURIComponent(review.user?.name || 'U')}&size=80&background=FFA903&color=000`;

    const bookCoverUrl = review.book
        ? (review.book.cover_image || (review.book.cover_path ? `${window.location.origin}/storage/${review.book.cover_path}` : 'https://via.placeholder.com/50x75'))
        : 'https://via.placeholder.com/50x75';

    // Formateador de fecha
    const formatDate = (dateString) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        return date.toLocaleDateString('es-ES', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
        });
    };

    // Comprobar si ha sido editado
    const hasBeenEdited = () => {
        if (!review.created_at || !review.updated_at) return false;
        const created = new Date(review.created_at).getTime();
        const updated = new Date(review.updated_at).getTime();
        return Math.abs(updated - created) > 1000;
    };

    const canShowActions = showActions || (review.is_owner && (onEdit || onDelete));

    return (
        <div className="neo-card flex flex-col h-full bg-[#FFA903]/10 p-6 border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:-translate-y-1 transition-all">
            
            {/* Encabezado de la Tarjeta (Libro o Usuario) */}
            <div className="flex items-start justify-between mb-4 border-b-2 border-black pb-4">
                <div className="flex items-center min-w-0 flex-1">
                    {showBook && review.book ? (
                        <>
                            {/* Mostrar la portada del libro si showBook es true */}
                            <Link to={`/books/${review.book_isbn || review.book?.isbn}`}>
                                <img
                                    src={bookCoverUrl}
                                    alt={review.book?.title || 'Libro'}
                                    className="w-10 h-14 object-cover border-2 border-black shadow-[2px_2px_0px_#000] mr-3 shrink-0"
                                    onError={(e) => {
                                        e.target.src = 'https://via.placeholder.com/50x75';
                                    }}
                                />
                            </Link>
                            <div className="min-w-0 flex-grow">
                                <Link
                                    to={`/books/${review.book_isbn || review.book?.isbn}`}
                                    className="font-bold text-sm uppercase hover:text-brand-blue line-clamp-1 block"
                                    title={review.book?.title}
                                >
                                    {review.book?.title}
                                </Link>

                                {/* Estrellas de Puntuación */}
                                <div className="flex text-brand-yellow text-xs gap-0.5 mt-1">
                                    {[1, 2, 3, 4, 5].map((i) => (
                                        <span key={i} className={i <= review.rating ? "text-black" : "text-gray-300"}>
                                            ★
                                        </span>
                                    ))}
                                </div>
                            </div>
                        </>
                    ) : (
                        <>
                            {/* Mostrar el avatar del usuario por defecto */}
                            <Link to={`/users/${review.user?.id}`}>
                                <img
                                    src={avatarUrl}
                                    alt={review.user?.name || 'Usuario'}
                                    className="w-10 h-10 object-cover border-2 border-black shadow-[2px_2px_0px_#000] mr-3 shrink-0"
                                    onError={(e) => {
                                        e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(review.user?.name || 'U')}&size=80&background=FFA903&color=000`;
                                    }}
                                />
                            </Link>
                            <div className="min-w-0 flex-grow">
                                <Link
                                    to={`/users/${review.user?.id}`}
                                    className="font-bold text-sm uppercase hover:text-brand-blue block"
                                >
                                    {review.user?.name}
                                </Link>

                                {/* Estrellas de Puntuación */}
                                <div className="flex text-brand-yellow text-xs gap-0.5 mt-1">
                                    {[1, 2, 3, 4, 5].map((i) => (
                                        <span key={i} className={i <= review.rating ? "text-black" : "text-gray-300"}>
                                            ★
                                        </span>
                                    ))}
                                </div>
                            </div>
                        </>
                    )}
                </div>

                {/* Botón de Me Gusta Genérico */}
                <div className="flex flex-col items-center ml-2 relative z-10 shrink-0">
                    <LikeButton
                        type="review"
                        id={review.id}
                        initialLiked={review.is_liked}
                        initialCount={review.likes_count ?? 0}
                    />
                </div>
            </div>

            {review.title && (
                <h3 className="font-display font-bold text-xl mb-2 leading-tight">"{review.title}"</h3>
            )}

            <p className="text-sm font-medium line-clamp-4 mb-4 flex-grow italic text-gray-700">
                {review.body}
            </p>

            <div className="mt-auto border-t-2 border-black/10 pt-4 flex justify-between items-center">
                {canShowActions ? (
                    <div className="flex gap-4">
                        {onEdit && (
                            <button
                                onClick={() => onEdit(review)}
                                className="text-xs font-black uppercase hover:text-brand-blue underline cursor-pointer"
                            >
                                Editar
                            </button>
                        )}
                        {onDelete && (
                            <button
                                onClick={() => onDelete(review)}
                                className="text-xs font-black uppercase hover:text-red-600 underline cursor-pointer"
                            >
                                Eliminar
                            </button>
                        )}
                    </div>
                ) : (
                    <span className="text-xs font-bold text-gray-500 uppercase">
                        {formatDate(review.created_at)}
                        {hasBeenEdited() && ' (Editado)'}
                    </span>
                )}

                {(!showBook && review.book) ? (
                    <Link
                        to={`/books/${review.book_isbn || review.book?.isbn}`}
                        className="text-xs font-black uppercase underline hover:text-brand-blue ml-auto flex items-center gap-1"
                    >
                        Ver Libro &rarr;
                    </Link>
                ) : (canShowActions && review.book) ? (
                    <Link
                        to={`/books/${review.book_isbn || review.book?.isbn}`}
                        className="text-xs font-black uppercase underline hover:text-brand-blue ml-auto"
                    >
                        Ver Libro
                    </Link>
                ) : null}
            </div>
        </div>
    );
}

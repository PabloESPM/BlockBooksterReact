import { Link } from 'react-router-dom';
import RatingStars from '../ui/RatingStars';
import LikeButton from '../ui/LikeButton';

/**
 * Tarjeta de reseña estilo Neo-Brutalism.
 */
export default function ReviewCard({ review, showBook = true, onEdit, onDelete }) {
    const avatarUrl = review.user?.avatar_url
        || `https://ui-avatars.com/api/?name=${encodeURIComponent(review.user?.name || 'U')}&size=80&background=FFA903&color=000`;

    return (
        <div className="neo-card p-4">
            {/* Cabecera: usuario + fecha */}
            <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                    <Link to={`/users/${review.user?.id}`}>
                        <img
                            src={avatarUrl}
                            alt=""
                            className="w-10 h-10 border-2 border-black object-cover"
                            onError={(e) => {
                                e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(review.user?.name || 'U')}&size=80&background=FFA903&color=000`;
                            }}
                        />
                    </Link>
                    <div>
                        <Link to={`/users/${review.user?.id}`} className="font-bold text-sm hover:text-brand-blue">
                            {review.user?.name}
                        </Link>
                        <div className="flex items-center gap-2">
                            <RatingStars rating={review.rating} size="sm" />
                        </div>
                    </div>
                </div>
                <span className="text-xs text-gray-400 font-medium">
                    {new Date(review.created_at).toLocaleDateString('es-ES')}
                </span>
            </div>

            {/* Libro (si se muestra) */}
            {showBook && review.book && (
                <Link
                    to={`/books/${review.book_isbn || review.book?.isbn}`}
                    className="text-xs font-bold text-brand-blue uppercase mb-2 block hover:underline"
                >
                    {review.book?.title}
                </Link>
            )}

            {/* Título de la reseña */}
            {review.title && (
                <h4 className="font-bold text-sm mb-1">{review.title}</h4>
            )}

            {/* Cuerpo */}
            <p className="text-sm text-gray-700 leading-relaxed mb-3">{review.body}</p>

            {/* Acciones */}
            <div className="flex items-center justify-between pt-2 border-t-2 border-gray-100">
                <LikeButton
                    type="review"
                    id={review.id}
                    initialLiked={review.is_liked}
                    initialCount={review.likes_count ?? 0}
                />

                {/* Botones de edición (solo owner) */}
                {review.is_owner && (
                    <div className="flex gap-2">
                        {onEdit && (
                            <button
                                onClick={() => onEdit(review)}
                                className="text-xs font-bold uppercase text-brand-blue hover:underline"
                            >
                                Editar
                            </button>
                        )}
                        {onDelete && (
                            <button
                                onClick={() => onDelete(review)}
                                className="text-xs font-bold uppercase text-red-600 hover:underline"
                            >
                                Eliminar
                            </button>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}

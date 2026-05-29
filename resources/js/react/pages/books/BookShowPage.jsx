import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import apiClient from '../../api/client';
import RatingStars from '../../components/ui/RatingStars';
import ReviewCard from '../../components/cards/ReviewCard';
import Pagination from '../../components/ui/Pagination';
import { useAuth } from '../../context/AuthContext';

/**
 * Detalle de libro — Replica pages.books.show.
 * Portada, info, reseñas paginadas, acciones de usuario autenticado.
 */
export default function BookShowPage() {
    const { isbn } = useParams();
    const { isAuthenticated } = useAuth();
    const [book, setBook] = useState(null);
    const [reviews, setReviews] = useState({ data: [], meta: null });
    const [loading, setLoading] = useState(true);
    const [reviewPage, setReviewPage] = useState(1);

    const [reviewForm, setReviewForm] = useState({ id: null, title: '', rating: 5, body: '' });
    const [isEditing, setIsEditing] = useState(false);
    const [submittingReview, setSubmittingReview] = useState(false);
    const [reviewError, setReviewError] = useState(null);

    const loadBook = () => {
        apiClient.get(`/books/${isbn}`, { params: { page: reviewPage } })
            .then((res) => {
                setBook(res.data.data);
                setReviews({ data: res.data.reviews.data, meta: res.data.reviews.meta });
                setLoading(false);
            });
    };

    const handleSubmitReview = async (e) => {
        e.preventDefault();
        setSubmittingReview(true);
        setReviewError(null);
        try {
            if (isEditing) {
                await apiClient.put(`/reviews/${reviewForm.id}`, {
                    title: reviewForm.title,
                    rating: reviewForm.rating,
                    body: reviewForm.body
                });
            } else {
                await apiClient.post('/reviews', {
                    book_isbn: isbn,
                    title: reviewForm.title,
                    rating: reviewForm.rating,
                    body: reviewForm.body
                });
            }
            setReviewForm({ id: null, title: '', rating: 5, body: '' });
            setIsEditing(false);
            loadBook();
        } catch (err) {
            console.error("Error submitting review:", err);
            setReviewError(err.response?.data?.message || 'Error al guardar la reseña. Por favor, inténtalo de nuevo.');
        } finally {
            setSubmittingReview(false);
        }
    };

    const handleEditReview = (review) => {
        setReviewForm({
            id: review.id,
            title: review.title || '',
            rating: review.rating || 5,
            body: review.body || ''
        });
        setIsEditing(true);
        document.getElementById('review-form-anchor')?.scrollIntoView({ behavior: 'smooth' });
    };

    const handleDeleteReview = async (review) => {
        if (!confirm('¿Estás seguro de que quieres eliminar esta reseña?')) return;
        try {
            await apiClient.delete(`/reviews/${review.id}`);
            loadBook();
        } catch (err) {
            console.error("Error deleting review:", err);
            alert('Error al eliminar la reseña.');
        }
    };

    useEffect(() => { loadBook(); }, [isbn, reviewPage]);

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="neo-spinner"></div>
            </div>
        );
    }

    if (!book) {
        return (
            <div className="max-w-7xl mx-auto px-4 py-12 text-center">
                <h1 className="text-2xl font-black uppercase">Libro no encontrado</h1>
            </div>
        );
    }

    const coverUrl = book.cover_image || book.cover_path
        ? (book.cover_image?.startsWith('http') ? book.cover_image : `/storage/${book.cover_path || book.cover_image}`)
        : `https://ui-avatars.com/api/?name=${encodeURIComponent(book.title)}&size=600&background=0E3FA9&color=fff&bold=true&font-size=0.25`;

    const authorNames = book.authors?.map(a => a.full_name || a.name).join(', ');

    return (
        <div className="max-w-7xl mx-auto px-4 py-8">
            {/* Cabecera del libro */}
            <div className="flex flex-col md:flex-row gap-8 mb-12">
                {/* Portada */}
                <div className="w-full md:w-72 shrink-0">
                    <div className="neo-card overflow-hidden">
                        <img
                            src={coverUrl}
                            alt={book.title}
                            className="w-full aspect-[2/3] object-cover"
                            onError={(e) => {
                                e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(book.title)}&size=600&background=0E3FA9&color=fff&bold=true&font-size=0.25`;
                            }}
                        />
                    </div>
                </div>

                {/* Información */}
                <div className="flex-grow">
                    <h1 className="text-3xl md:text-4xl font-black uppercase tracking-tight mb-2">
                        {book.title}
                    </h1>

                    {/* Autores */}
                    <div className="flex flex-wrap gap-2 mb-4">
                        {book.authors?.map((author) => (
                            <Link
                                key={author.id}
                                to={`/authors/${author.id}`}
                                className="text-sm font-bold text-brand-blue hover:underline"
                            >
                                {author.full_name || author.name}
                            </Link>
                        ))}
                    </div>

                    {/* Rating */}
                    {book.average_rating > 0 && (
                        <div className="flex items-center gap-2 mb-4">
                            <RatingStars rating={book.average_rating} size="lg" />
                            <span className="text-sm text-gray-500 font-medium">
                                ({book.reviews_count} reseña{book.reviews_count !== 1 ? 's' : ''})
                            </span>
                        </div>
                    )}

                    {/* Metadatos */}
                    <div className="grid grid-cols-2 gap-3 mb-6">
                        {book.publication_year && (
                            <div className="neo-card p-3">
                                <span className="text-xs font-bold uppercase text-gray-500 block">Año</span>
                                <span className="font-bold">{book.publication_year}</span>
                            </div>
                        )}
                        {book.number_of_pages && (
                            <div className="neo-card p-3">
                                <span className="text-xs font-bold uppercase text-gray-500 block">Páginas</span>
                                <span className="font-bold">{book.number_of_pages}</span>
                            </div>
                        )}
                        {book.genre && (
                            <div className="neo-card p-3">
                                <span className="text-xs font-bold uppercase text-gray-500 block">Género</span>
                                <span className="font-bold">{book.genre.name}</span>
                            </div>
                        )}
                        {book.language && (
                            <div className="neo-card p-3">
                                <span className="text-xs font-bold uppercase text-gray-500 block">Idioma</span>
                                <span className="font-bold">{book.language.name}</span>
                            </div>
                        )}
                    </div>

                    {/* Sinopsis */}
                    {book.synopsis && (
                        <div className="mb-6">
                            <h3 className="text-xs font-black uppercase tracking-widest mb-2">Sinopsis</h3>
                            <p className="text-sm text-gray-700 leading-relaxed">{book.synopsis}</p>
                        </div>
                    )}

                    {/* Estado de lectura del usuario */}
                    {book.user_book && (
                        <div className="neo-card bg-brand-yellow p-3 inline-block">
                            <span className="text-xs font-black uppercase">
                                Estado: {book.user_book.status === 'read' ? 'Leído' : book.user_book.status === 'reading' ? 'Leyendo' : 'Pendiente'}
                            </span>
                        </div>
                    )}

                    {/* Enlaces de compra */}
                    {book.purchases?.length > 0 && (
                        <div className="mt-6">
                            <h3 className="text-xs font-black uppercase tracking-widest mb-2">Comprar</h3>
                            <div className="flex flex-wrap gap-2">
                                {book.purchases.map((p) => (
                                    <a
                                        key={p.id}
                                        href={p.url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="neo-btn-secondary text-xs"
                                    >
                                        {p.store_name} {p.price && `— ${p.price}${p.currency || '€'}`}
                                    </a>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Sección de reseñas */}
            <section>
                <h2 className="text-xl font-black uppercase tracking-tight mb-6 border-b-4 border-black pb-2">
                    Reseñas ({reviews.meta?.total || 0})
                </h2>

                {/* Formulario de Reseña */}
                <div id="review-form-anchor" className="mb-8">
                    {isAuthenticated ? (
                        <div className="neo-card p-6 bg-white">
                            <h3 className="text-lg font-black uppercase mb-4">
                                {isEditing ? '📝 Editar tu reseña' : '✍️ Escribe tu reseña'}
                            </h3>
                            {reviewError && (
                                <div className="p-3 mb-4 bg-red-100 border-2 border-red-500 font-bold text-red-700 text-xs uppercase">
                                    ⚠️ {reviewError}
                                </div>
                            )}
                            <form onSubmit={handleSubmitReview} className="space-y-4">
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-bold uppercase mb-2">
                                            Valoración
                                        </label>
                                        <select
                                            value={reviewForm.rating}
                                            onChange={(e) => setReviewForm({ ...reviewForm, rating: parseInt(e.target.value) })}
                                            className="neo-input bg-white font-bold"
                                            required
                                        >
                                            <option value="5">⭐⭐⭐⭐⭐ (5 - Excelente)</option>
                                            <option value="4">⭐⭐⭐⭐ (4 - Muy bueno)</option>
                                            <option value="3">⭐⭐⭐ (3 - Bueno)</option>
                                            <option value="2">⭐⭐ (2 - Regular)</option>
                                            <option value="1">⭐ (1 - Malo)</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold uppercase mb-2">
                                            Título (Opcional)
                                        </label>
                                        <input
                                            type="text"
                                            value={reviewForm.title}
                                            onChange={(e) => setReviewForm({ ...reviewForm, title: e.target.value })}
                                            className="neo-input"
                                            placeholder="Ej. ¡Me encantó este libro!"
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold uppercase mb-2">
                                        Opinión
                                    </label>
                                    <textarea
                                        value={reviewForm.body}
                                        onChange={(e) => setReviewForm({ ...reviewForm, body: e.target.value })}
                                        className="neo-input min-h-[120px] resize-y"
                                        placeholder="Escribe tu opinión detallada sobre el libro aquí..."
                                        maxLength="1000"
                                        required
                                    />
                                </div>
                                <div className="flex gap-2">
                                    <button
                                        type="submit"
                                        disabled={submittingReview}
                                        className="neo-btn-primary text-sm"
                                    >
                                        {submittingReview ? 'Guardando...' : (isEditing ? 'Actualizar Reseña' : 'Publicar Reseña')}
                                    </button>
                                    {isEditing && (
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setIsEditing(false);
                                                setReviewForm({ id: null, title: '', rating: 5, body: '' });
                                            }}
                                            className="neo-btn-secondary text-sm"
                                        >
                                            Cancelar
                                        </button>
                                    )}
                                </div>
                            </form>
                        </div>
                    ) : (
                        <div className="neo-card p-6 bg-brand-blue/10 border-brand-blue text-center">
                            <p className="font-bold text-sm mb-2">Inicia sesión para escribir una reseña</p>
                            <Link to="/login" className="inline-block neo-btn-primary text-xs uppercase">
                                Iniciar Sesión
                            </Link>
                        </div>
                    )}
                </div>

                {reviews.data.length === 0 ? (
                    <div className="neo-card p-8 text-center">
                        <p className="font-bold mb-2">Aún no hay reseñas</p>
                        <p className="text-sm text-gray-500">¡Sé el primero en compartir tu opinión!</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {reviews.data.map((review) => (
                            <ReviewCard
                                key={review.id}
                                review={review}
                                showBook={false}
                                onEdit={handleEditReview}
                                onDelete={handleDeleteReview}
                            />
                        ))}
                        <Pagination
                            meta={reviews.meta}
                            onPageChange={(page) => setReviewPage(page)}
                        />
                    </div>
                )}
            </section>
        </div>
    );
}

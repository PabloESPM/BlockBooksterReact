import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import apiClient from '../../api/client';
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
    const [relatedAuthors, setRelatedAuthors] = useState([]);
    const [relatedBooks, setRelatedBooks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [reviewPage, setReviewPage] = useState(1);

    const [reviewForm, setReviewForm] = useState({ id: null, title: '', rating: 5, body: '' });
    const [isEditing, setIsEditing] = useState(false);
    const [submittingReview, setSubmittingReview] = useState(false);
    const [reviewError, setReviewError] = useState(null);

    const [updatingStatus, setUpdatingStatus] = useState(false);
    const [userBook, setUserBook] = useState(null);
    const [dropdownOpen, setDropdownOpen] = useState(false);

    const loadBook = () => {
        apiClient.get(`/books/${isbn}`, { params: { page: reviewPage } })
            .then((res) => {
                setBook(res.data.data);
                setReviews({ data: res.data.reviews.data, meta: res.data.reviews.meta });
                setRelatedAuthors(res.data.related_authors || []);
                setRelatedBooks(res.data.related_books || []);
                setUserBook(res.data.data.user_book || null);
                setLoading(false);
            });
    };

    const handleUpdateStatus = async (status) => {
        if (!isAuthenticated) {
            window.location.href = '/login';
            return;
        }
        setUpdatingStatus(true);
        try {
            const res = await apiClient.post(`/books/${isbn}/status`, { status });
            setUserBook(res.data.user_book);
            setBook((prev) => ({
                ...prev,
                user_book: res.data.user_book,
            }));
        } catch (err) {
            console.error("Error updating status:", err);
            alert("Error al actualizar el estado de lectura.");
        } finally {
            setUpdatingStatus(false);
        }
    };

    const handleShare = () => {
        const shareData = {
            title: book.title,
            url: window.location.href
        };
        if (navigator.share && navigator.canShare && navigator.canShare(shareData)) {
            navigator.share(shareData).catch((err) => console.error(err));
        } else {
            navigator.clipboard.writeText(window.location.href);
            alert("¡Enlace copiado al portapapeles!");
        }
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
        : null;

    const avgRating = book.average_rating || 0;
    const totalRes = reviews.meta?.total || 0;

    return (
        <div className="max-w-7xl mx-auto px-4 py-8">
            {/* Definición del gradiente para media estrella */}
            <svg className="w-0 h-0 absolute">
                <defs>
                    <linearGradient id="half-star-gradient">
                        <stop offset="50%" stopColor="#FFA903" />
                        <stop offset="50%" stopColor="#D1D5DB" />
                    </linearGradient>
                </defs>
            </svg>

            {/* SECCIÓN HERO: Portada + Información principal */}
            <section className="grid grid-cols-1 md:grid-cols-12 gap-8 mb-16">
                
                {/* Portada (columna izquierda) */}
                <div className="md:col-span-4 lg:col-span-3">
                    <div className="neo-card p-0 relative group">
                        <div className="aspect-[2/3] bg-gray-200 border-b-2 border-black relative overflow-hidden">
                            {coverUrl ? (
                                <img
                                    src={coverUrl}
                                    alt={book.title}
                                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                                />
                            ) : (
                                <div className="absolute inset-0 flex items-center justify-center bg-brand-yellow">
                                    <span className="text-4xl font-black uppercase text-black opacity-20 -rotate-45">
                                        Portada
                                    </span>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Acciones en móvil */}
                    <div className="mt-4 md:hidden space-y-2">
                        {isAuthenticated && (
                            <button
                                onClick={() => handleUpdateStatus('pending')}
                                disabled={updatingStatus}
                                className="w-full neo-btn-primary mb-2 cursor-pointer"
                            >
                                {updatingStatus ? 'Guardando...' : '+ Quiero leer'}
                            </button>
                        )}
                        <button
                            onClick={handleShare}
                            className="block w-full text-center neo-btn-secondary text-sm cursor-pointer"
                        >
                            Compartir
                        </button>
                    </div>
                </div>

                {/* Información del libro (columna derecha) */}
                <div className="md:col-span-8 lg:col-span-9 flex flex-col justify-between">
                    <div>
                        {/* Título y autores */}
                        <div className="flex items-start justify-between mb-4">
                            <div>
                                <h1 className="text-3xl md:text-5xl font-black font-display uppercase tracking-tighter leading-none mb-2">
                                    {book.title}
                                </h1>
                                <h2 className="text-xl font-bold uppercase text-gray-600">
                                    por{' '}
                                    {book.authors?.map((autor, idx) => (
                                        <span key={autor.id}>
                                            <Link
                                                to={`/authors/${autor.id}`}
                                                className="text-brand-blue hover:underline"
                                            >
                                                {autor.full_name || `${autor.name} ${autor.surname || ''}`.trim()}
                                            </Link>
                                            {idx < book.authors.length - 1 ? ', ' : ''}
                                        </span>
                                    ))}
                                </h2>
                            </div>

                            {/* Bloque de valoración (escritorio) */}
                            <div className="hidden md:block text-right flex-shrink-0 ml-4">
                                <div className="flex items-center gap-1 justify-end">
                                    {[1, 2, 3, 4, 5].map((i) => {
                                        if (i <= avgRating) {
                                            return (
                                                <svg key={i} className="w-8 h-8 text-brand-yellow fill-current drop-shadow-[2px_2px_0px_rgba(0,0,0,1)]" viewBox="0 0 24 24">
                                                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                                                </svg>
                                            );
                                        } else if (i - 0.5 === avgRating) {
                                            return (
                                                <svg key={i} className="w-8 h-8 drop-shadow-[2px_2px_0px_rgba(0,0,0,1)]" viewBox="0 0 24 24">
                                                    <path fill="url(#half-star-gradient)" d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                                                </svg>
                                            );
                                        } else {
                                            return (
                                                <svg key={i} className="w-8 h-8 text-gray-300 fill-current drop-shadow-[2px_2px_0px_rgba(0,0,0,1)]" viewBox="0 0 24 24">
                                                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                                                </svg>
                                            );
                                        }
                                    })}
                                </div>
                                <div className="text-2xl font-black mt-1">
                                    {Number(avgRating).toFixed(1)}
                                    <span className="text-sm font-bold text-gray-500 uppercase">/ 5.0</span>
                                </div>
                                <div className="text-xs font-bold uppercase text-gray-500">
                                    Basado en {totalRes} {totalRes === 1 ? 'valoración' : 'valoraciones'}
                                </div>
                            </div>
                        </div>

                        {/* Metadatos del libro */}
                        <div className="flex flex-wrap gap-4 mb-8 text-sm font-bold uppercase border-y-2 border-black py-3">
                            {book.genre && (
                                <span className="bg-black text-white px-2 py-0.5">{book.genre.name}</span>
                            )}
                            {book.publication_year && (
                                <span className="bg-gray-200 border border-black px-2 py-0.5">{book.publication_year}</span>
                            )}
                            {book.number_of_pages && (
                                <span className="bg-gray-200 border border-black px-2 py-0.5">{book.number_of_pages} páginas</span>
                            )}
                            {book.language && (
                                <span className="bg-gray-200 border border-black px-2 py-0.5">{book.language.name}</span>
                            )}
                            <span className="text-gray-500 py-0.5">ISBN: {book.isbn}</span>
                        </div>

                        {/* Sinopsis */}
                        {book.synopsis && (
                            <div className="mb-8 font-medium leading-relaxed text-gray-800">
                                <p>{book.synopsis}</p>
                            </div>
                        )}
                    </div>

                    {/* Acciones principales (escritorio) */}
                    <div className="hidden md:flex flex-wrap items-center gap-4">
                        {isAuthenticated ? (
                            <div className="flex items-center gap-2 border-r-2 border-black pr-4 mr-2">
                                {/* Botón principal */}
                                <button
                                    onClick={() => handleUpdateStatus('pending')}
                                    disabled={updatingStatus}
                                    className="neo-btn-primary flex items-center gap-2 cursor-pointer"
                                >
                                    {updatingStatus ? (
                                        <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin"></div>
                                    ) : (
                                        <span>
                                            {userBook?.status === 'reading' && '📖 Leyendo'}
                                            {userBook?.status === 'read' && '📚 Leído'}
                                            {userBook?.status !== 'reading' && userBook?.status !== 'read' && '📕 Leer'}
                                        </span>
                                    )}
                                </button>

                                {/* Flecha desplegable */}
                                <div className="relative">
                                    <button
                                        onClick={() => setDropdownOpen(!dropdownOpen)}
                                        className="neo-btn-secondary px-3 cursor-pointer"
                                        aria-label="Cambiar estado de lectura"
                                    >
                                        ▼
                                    </button>

                                    {dropdownOpen && (
                                        <div
                                            onMouseLeave={() => setDropdownOpen(false)}
                                            className="absolute top-full left-0 mt-2 w-52 bg-white border-2 border-black shadow-[4px_4px_0px_#000] z-20 flex flex-col"
                                        >
                                            <button
                                                onClick={() => {
                                                    handleUpdateStatus('pending');
                                                    setDropdownOpen(false);
                                                }}
                                                className={`text-left px-4 py-2 font-bold uppercase hover:bg-brand-yellow border-b border-black flex items-center gap-2 cursor-pointer ${
                                                    userBook?.status === 'pending' ? 'bg-brand-yellow' : ''
                                                }`}
                                            >
                                                {userBook?.status === 'pending' && '✓'} Leer
                                            </button>

                                            <button
                                                onClick={() => {
                                                    handleUpdateStatus('reading');
                                                    setDropdownOpen(false);
                                                }}
                                                className={`text-left px-4 py-2 font-bold uppercase hover:bg-brand-yellow border-b border-black flex items-center gap-2 cursor-pointer ${
                                                    userBook?.status === 'reading' ? 'bg-brand-yellow' : ''
                                                }`}
                                            >
                                                {userBook?.status === 'reading' && '✓'} Leyendo
                                            </button>

                                            <button
                                                onClick={() => {
                                                    handleUpdateStatus('read');
                                                    setDropdownOpen(false);
                                                }}
                                                className={`text-left px-4 py-2 font-bold uppercase hover:bg-brand-yellow flex items-center gap-2 cursor-pointer ${
                                                    userBook?.status === 'read' ? 'bg-brand-yellow' : ''
                                                }`}
                                            >
                                                {userBook?.status === 'read' && '✓'} Leído
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ) : (
                            <div className="flex items-center gap-4 border-r-2 border-black pr-4 mr-2">
                                <Link
                                    to="/login"
                                    className="text-sm font-bold uppercase underline hover:text-brand-blue"
                                >
                                    Inicia sesión para registrar tu lectura
                                </Link>
                            </div>
                        )}

                        {/* Compartir */}
                        <button
                            onClick={handleShare}
                            className="neo-btn-secondary text-sm flex items-center gap-2 cursor-pointer"
                        >
                            Compartir
                        </button>

                        {/* Enlaces de compra */}
                        {book.purchases?.map((p) => (
                            <a
                                key={p.id}
                                href={p.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="neo-btn-secondary text-sm flex items-center gap-2"
                            >
                                Comprar en {p.store_name}
                            </a>
                        ))}
                    </div>
                </div>
            </section>

            {/* SEGUNDA FILA: Reseñas + Sidebar relacionados */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                
                {/* Sección Reseñas (2/3 del ancho) */}
                <div className="lg:col-span-2">
                    <div className="flex items-center justify-between mb-6 border-b-2 border-black pb-2">
                        <h2 className="text-2xl font-black uppercase flex items-center gap-2">
                            <span className="w-4 h-4 bg-brand-yellow border-2 border-black block"></span>
                            Reseñas de la comunidad
                        </h2>
                        {isAuthenticated && (
                            <button
                                onClick={() => {
                                    setReviewForm({ id: null, title: '', rating: 5, body: '' });
                                    setIsEditing(false);
                                    document.getElementById('review-form-anchor')?.scrollIntoView({ behavior: 'smooth' });
                                }}
                                className="text-sm font-bold uppercase bg-brand-blue text-white px-3 py-1 hover:bg-gray-800 transition-colors cursor-pointer"
                            >
                                Escribir reseña
                            </button>
                        )}
                    </div>

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
                                            className="neo-btn-primary text-sm cursor-pointer"
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
                                                className="neo-btn-secondary text-sm cursor-pointer"
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
                        <div className="neo-card p-8 text-center bg-gray-50 border-2 border-dashed border-gray-300">
                            <p className="font-bold text-xl uppercase text-gray-400 mb-2">Aún no hay reseñas</p>
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
                </div>

                {/* Sidebar: Relacionados */}
                <div className="lg:col-span-1">
                    {/* Autores relacionados */}
                    <div className="mb-6 border-b-2 border-black pb-2">
                        <h2 className="text-xl font-black uppercase">Autores relacionados</h2>
                    </div>

                    {relatedAuthors.length === 0 ? (
                        <p className="text-sm font-bold text-gray-400 uppercase mb-8">Sin autores relacionados.</p>
                    ) : (
                        <div className="space-y-4 mb-8">
                            {relatedAuthors.map((autorRel) => {
                                const photoUrl = autorRel.photo_path
                                    ? `${window.location.origin}/storage/${autorRel.photo_path}`
                                    : null;
                                return (
                                    <Link
                                        key={autorRel.id}
                                        to={`/authors/${autorRel.id}`}
                                        className="neo-card p-4 flex items-center gap-4 hover:bg-gray-50 transition-colors group block"
                                    >
                                        {photoUrl ? (
                                            <img
                                                src={photoUrl}
                                                alt={autorRel.name}
                                                className="w-12 h-12 rounded-full border-2 border-black object-cover flex-shrink-0"
                                                onError={(e) => {
                                                    e.target.style.display = 'none';
                                                    if (e.target.nextSibling) e.target.nextSibling.style.display = 'flex';
                                                }}
                                            />
                                        ) : null}
                                        <div
                                            className="w-12 h-12 bg-gray-200 rounded-full border-2 border-black flex items-center justify-center flex-shrink-0"
                                            style={{ display: photoUrl ? 'none' : 'flex' }}
                                        >
                                            <span className="text-xl font-black text-gray-500">
                                                {autorRel.name ? autorRel.name.substring(0, 1).toUpperCase() : 'A'}
                                            </span>
                                        </div>
                                        <div className="overflow-hidden">
                                            <h4 className="font-bold uppercase text-sm truncate group-hover:text-brand-blue transition-colors">
                                                {autorRel.name} {autorRel.surname}
                                            </h4>
                                            {book.genre && (
                                                <p className="text-xs text-gray-500 uppercase truncate">{book.genre.name}</p>
                                            )}
                                        </div>
                                    </Link>
                                );
                            })}
                        </div>
                    )}

                    {/* Libros relacionados */}
                    <div className="mb-6 border-b-2 border-black pb-2">
                        <h2 className="text-xl font-black uppercase">A los lectores también les gustó</h2>
                    </div>

                    {relatedBooks.length === 0 ? (
                        <p className="text-sm font-bold text-gray-400 uppercase">Sin libros relacionados.</p>
                    ) : (
                        <div className="grid grid-cols-2 gap-4">
                            {relatedBooks.map((libroRel) => {
                                const coverUrl = libroRel.cover_image || (libroRel.cover_path ? `${window.location.origin}/storage/${libroRel.cover_path}` : null);
                                return (
                                    <Link
                                        key={libroRel.isbn}
                                        to={`/books/${libroRel.isbn}`}
                                        className="neo-card p-0 border-2 border-black relative overflow-hidden group block"
                                    >
                                        {coverUrl ? (
                                            <img
                                                src={coverUrl}
                                                alt={libroRel.title}
                                                className="w-full h-32 object-cover grayscale group-hover:grayscale-0 transition-all duration-300"
                                                onError={(e) => {
                                                    e.target.style.display = 'none';
                                                    if (e.target.nextSibling) e.target.nextSibling.style.display = 'flex';
                                                }}
                                            />
                                        ) : null}
                                        <div
                                            className="w-full h-32 bg-gray-200 flex items-center justify-center"
                                            style={{ display: coverUrl ? 'none' : 'flex' }}
                                        >
                                            <span className="text-xs font-bold uppercase opacity-30 rotate-45">Portada</span>
                                        </div>
                                        <div className="p-2 bg-white border-t-2 border-black">
                                            <p className="text-xs font-bold uppercase truncate">{libroRel.title}</p>
                                        </div>
                                    </Link>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

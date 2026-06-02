import { useState, useEffect } from 'react';
import apiClient from '../../api/client';
import { useAuth } from '../../context/AuthContext';

/**
 * Modal para escribir o actualizar una reseña para un libro.
 * Se abre mediante el evento de window 'open-add-review-modal'.
 */
export default function AddReviewModal() {
    const { isAuthenticated } = useAuth();
    const [show, setShow] = useState(false);
    const [bookIsbn, setBookIsbn] = useState('');
    const [reviewId, setReviewId] = useState(null);
    const [title, setTitle] = useState('');
    const [rating, setRating] = useState(0);
    const [body, setBody] = useState('');
    
    const [hoverRating, setHoverRating] = useState(null);
    const [submitting, setSubmitting] = useState(false);
    const [errors, setErrors] = useState({});

    // Escuchar el evento de apertura del modal
    useEffect(() => {
        const handleOpen = (e) => {
            if (!isAuthenticated) {
                window.location.href = '/login';
                return;
            }
            const isbn = e.detail?.bookId || '';
            const existingReview = e.detail?.review || null;

            setBookIsbn(isbn);
            setErrors({});

            if (existingReview) {
                setReviewId(existingReview.id);
                setTitle(existingReview.title || '');
                setRating(existingReview.rating || 0);
                setBody(existingReview.body || '');
            } else {
                setReviewId(null);
                setTitle('');
                setRating(0);
                setBody('');
            }
            setShow(true);
        };

        window.addEventListener('open-add-review-modal', handleOpen);
        return () => window.removeEventListener('open-add-review-modal', handleOpen);
    }, [isAuthenticated]);

    // Cerrar con Escape
    useEffect(() => {
        if (!show) return;

        const handleKeyDown = (e) => {
            if (e.key === 'Escape') {
                closeModal();
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [show]);

    const closeModal = () => {
        setShow(false);
        setBookIsbn('');
        setReviewId(null);
        setTitle('');
        setRating(0);
        setBody('');
        setErrors({});
    };

    const handleBackdropClick = (e) => {
        if (e.target === e.currentTarget) {
            closeModal();
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        setErrors({});

        if (rating < 1 || rating > 5) {
            setErrors({ rating: ['La valoración es obligatoria (de 1 a 5 estrellas).'] });
            setSubmitting(false);
            return;
        }

        if (!body.trim()) {
            setErrors({ body: ['El contenido de la reseña es obligatorio.'] });
            setSubmitting(false);
            return;
        }

        try {
            if (reviewId) {
                await apiClient.put(`/reviews/${reviewId}`, {
                    title: title || null,
                    rating: rating,
                    body: body,
                });
            } else {
                await apiClient.post('/reviews', {
                    book_isbn: bookIsbn,
                    title: title || null,
                    rating: rating,
                    body: body,
                });
            }

            closeModal();
            window.location.reload();
        } catch (err) {
            if (err.response?.status === 422) {
                setErrors(err.response.data.errors || {});
            } else {
                console.error(err);
                alert('Ocurrió un error al guardar la reseña. Inténtalo de nuevo.');
            }
        } finally {
            setSubmitting(false);
        }
    };

    if (!show) return null;

    return (
        <div
            onClick={handleBackdropClick}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 text-left"
        >
            <div className="bg-white border-2 border-black shadow-[8px_8px_0px_#000] w-full max-w-lg p-6 relative">
                {/* Botón cerrar */}
                <button
                    onClick={closeModal}
                    className="absolute top-4 right-4 text-2xl font-black hover:text-red-600 z-50 cursor-pointer"
                >
                    &times;
                </button>

                <h2 className="text-xl font-black uppercase mb-6 font-display">
                    {reviewId ? 'Editar Reseña' : 'Escribe una Reseña'}
                </h2>

                <form onSubmit={handleSubmit}>
                    {/* Título de la reseña */}
                    <div className="mb-4">
                        <label htmlFor="review_title" className="block font-bold uppercase text-sm mb-2">
                            Título de la Reseña
                        </label>
                        <input
                            type="text"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            id="review_title"
                            className="w-full border-2 border-black p-3 focus:outline-none focus:shadow-[4px_4px_0px_#000] focus:ring-0 transition-shadow"
                            placeholder="Resumen breve de tu reseña..."
                        />
                        {errors.title && (
                            <span className="text-red-600 text-xs font-bold mt-1 block">
                                {errors.title[0]}
                            </span>
                        )}
                    </div>

                    {/* Selector de estrellas */}
                    <div className="mb-6">
                        <label className="block font-bold uppercase text-sm mb-2">Valoración</label>
                        <div className="flex items-center gap-1">
                            {[1, 2, 3, 4, 5].map((i) => (
                                <button
                                    key={i}
                                    type="button"
                                    onClick={() => setRating(i)}
                                    onMouseEnter={() => setHoverRating(i)}
                                    onMouseLeave={() => setHoverRating(null)}
                                    className={`text-2xl focus:outline-none transition-transform hover:scale-110 cursor-pointer ${
                                        (hoverRating || rating) >= i
                                            ? 'text-brand-yellow'
                                            : 'text-gray-300'
                                    }`}
                                >
                                    ★
                                </button>
                            ))}
                            <span className="ml-2 font-bold text-lg">
                                {(rating > 0 ? rating : 0)} / 5
                            </span>
                        </div>
                        {errors.rating && (
                            <span className="text-red-600 text-xs font-bold mt-1 block">
                                {errors.rating[0]}
                            </span>
                        )}
                    </div>

                    {/* Cuerpo de la reseña */}
                    <div className="mb-6">
                        <label htmlFor="review_body" className="block font-bold uppercase text-sm mb-2">
                            Tu Reseña
                        </label>
                        <textarea
                            value={body}
                            onChange={(e) => setBody(e.target.value)}
                            id="review_body"
                            rows={5}
                            className="w-full border-2 border-black p-3 focus:outline-none focus:shadow-[4px_4px_0px_#000] focus:ring-0 transition-shadow resize-none"
                            placeholder="Escribe tu reseña aquí..."
                        />
                        {errors.body && (
                            <span className="text-red-600 text-xs font-bold mt-1 block">
                                {errors.body[0]}
                            </span>
                        )}
                    </div>

                    {/* Botones de acción */}
                    <div className="flex gap-4 justify-end">
                        <button
                            type="button"
                            onClick={closeModal}
                            className="px-4 py-2 bg-white border-2 border-black font-bold uppercase hover:bg-gray-100 transition-colors cursor-pointer"
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            disabled={submitting}
                            className="px-6 py-2 bg-brand-yellow border-2 border-black font-bold uppercase shadow-[4px_4px_0px_#000] hover:translate-y-px hover:translate-x-px hover:shadow-[2px_2px_0px_#000] transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
                        >
                            {submitting && (
                                <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin"></div>
                            )}
                            {reviewId ? 'Actualizar Reseña' : 'Publicar Reseña'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

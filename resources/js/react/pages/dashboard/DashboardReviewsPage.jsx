import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import reviewService from '../../services/reviewService';
import ReviewCard from '../../components/cards/ReviewCard';

/**
 * Mis Reseñas — Gestiona tus valoraciones de libros.
 * Replica la maquetación y estructura de rejilla de la vista original.
 */
export default function DashboardReviewsPage() {
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);

    const loadReviews = useCallback(() => {
        reviewService.getDashboardReviews().then((resData) => {
            setReviews(resData.data);
            setLoading(false);
        });
    }, []);

    useEffect(() => { 
        loadReviews(); 
    }, [loadReviews]);

    useEffect(() => {
        const handleEventUpdate = () => {
            loadReviews();
        };
        window.addEventListener('review-saved', handleEventUpdate);
        return () => {
            window.removeEventListener('review-saved', handleEventUpdate);
        };
    }, [loadReviews]);

    const handleDelete = async (review) => {
        if (!confirm('¿Seguro que quieres eliminar esta reseña?')) return;
        try {
            await reviewService.deleteReview(review.id);
            loadReviews();
            
            // Dispatch event for other pages displaying reviews count
            window.dispatchEvent(new CustomEvent('review-saved', { 
                detail: { isbn: review.book_isbn || review.book?.isbn, reviewId: review.id, action: 'deleted' } 
            }));
        } catch (err) {
            console.error('Error deleting review:', err);
        }
    };

    const handleEdit = (review) => {
        const bookIsbn = review.book_isbn || review.book?.isbn || '';
        window.dispatchEvent(new CustomEvent('open-add-review-modal', {
            detail: {
                bookId: bookIsbn,
                review: review
            }
        }));
    };

    if (loading) {
        return (
            <div className="flex justify-center py-12">
                <div className="neo-spinner"></div>
            </div>
        );
    }

    return (
        <div className="flex-grow space-y-8">
            {/* Cabecera principal */}
            <header className="mb-8 border-b-4 border-black pb-4">
                <h1 className="text-3xl font-black uppercase font-display">Mis Reseñas</h1>
                <p className="text-gray-600 font-bold mt-1">Gestiona tus valoraciones de libros</p>
            </header>

            {reviews.length === 0 ? (
                <div className="col-span-full text-center py-12 border-2 border-dashed border-gray-300 bg-gray-50">
                    <p className="text-xl font-bold uppercase text-gray-400 mb-4">Aún no hay reseñas</p>
                    <Link to="/books" className="neo-btn-primary inline-block text-sm">
                        Explorar Libros
                    </Link>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {reviews.map((review) => (
                        <ReviewCard
                            key={review.id}
                            review={review}
                            showBook={true}
                            showActions={true}
                            onEdit={handleEdit}
                            onDelete={handleDelete}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}

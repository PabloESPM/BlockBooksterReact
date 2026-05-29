import { useState, useEffect } from 'react';
import apiClient from '../../api/client';
import ReviewCard from '../../components/cards/ReviewCard';

/**
 * Mis Reseñas — Replica pages.dashboard.reviews.
 */
export default function DashboardReviewsPage() {
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);

    const loadReviews = () => {
        apiClient.get('/dashboard/reviews').then((res) => {
            setReviews(res.data.data);
            setLoading(false);
        });
    };

    useEffect(() => { loadReviews(); }, []);

    const handleDelete = async (review) => {
        if (!confirm('¿Seguro que quieres eliminar esta reseña?')) return;
        await apiClient.delete(`/reviews/${review.id}`);
        loadReviews();
    };

    if (loading) return <div className="flex justify-center py-12"><div className="neo-spinner"></div></div>;

    return (
        <div>
            <h1 className="text-2xl font-black uppercase tracking-tight mb-6">Mis Reseñas</h1>

            {reviews.length === 0 ? (
                <div className="neo-card p-8 text-center">
                    <p className="font-bold mb-2">No has escrito reseñas</p>
                    <p className="text-sm text-gray-500">Explora libros y comparte tu opinión.</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {reviews.map((review) => (
                        <ReviewCard
                            key={review.id}
                            review={review}
                            showBook={true}
                            showActions={true}
                            onDelete={handleDelete}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}

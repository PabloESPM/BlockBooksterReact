import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import apiClient from '../../api/client';
import Pagination from '../../components/ui/Pagination';
import RatingStars from '../../components/ui/RatingStars';

/**
 * Moderación de reseñas — Tabla con eliminación por moderación.
 * Replica admin.reviews.moderation Livewire SFC.
 */
export default function AdminReviewsPage() {
    const [reviews, setReviews] = useState([]);
    const [meta, setMeta] = useState(null);
    const [page, setPage] = useState(1);
    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState('');

    const loadReviews = () => {
        setLoading(true);
        apiClient.get('/admin/reviews', { params: { page } }).then((res) => {
            setReviews(res.data.data);
            setMeta(res.data.meta);
            setLoading(false);
        });
    };

    useEffect(() => { loadReviews(); }, [page]);

    const handleDelete = async (id) => {
        if (!confirm('¿Eliminar esta reseña por moderación?')) return;
        await apiClient.delete(`/admin/reviews/${id}`);
        setMessage('¡Reseña eliminada por moderación!');
        setReviews(reviews.filter(r => r.id !== id));
    };

    return (
        <div>
            <h1 className="text-3xl font-black uppercase font-display mb-8">Moderación de Reseñas</h1>

            {message && (
                <div className="mb-4 p-4 bg-green-100 border border-green-400 text-green-800 font-bold text-sm shadow-[2px_2px_0px_#000]">
                    {message}
                </div>
            )}

            <div className="bg-white border-2 border-black overflow-hidden mb-8">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-black text-white text-xs font-bold uppercase tracking-wider">
                            <th className="p-4">Usuario</th>
                            <th className="p-4">Libro</th>
                            <th className="p-4">Reseña</th>
                            <th className="p-4 text-center">Rating</th>
                            <th className="p-4 text-center">Likes</th>
                            <th className="p-4 text-right">Acción</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-black/10">
                        {loading ? (
                            <tr><td colSpan="6" className="p-8 text-center"><div className="neo-spinner mx-auto"></div></td></tr>
                        ) : reviews.length === 0 ? (
                            <tr><td colSpan="6" className="p-8 text-center text-gray-500 font-bold uppercase">No hay reseñas</td></tr>
                        ) : reviews.map((review) => (
                            <tr key={review.id} className="hover:bg-gray-50 transition-colors">
                                <td className="p-4">
                                    <span className="font-bold text-sm">{review.user?.name || 'Anónimo'}</span>
                                </td>
                                <td className="p-4">
                                    <span className="text-sm font-medium text-brand-blue">
                                        {review.book?.title || review.book_isbn}
                                    </span>
                                </td>
                                <td className="p-4">
                                    {review.title && <div className="font-bold text-xs mb-1">{review.title}</div>}
                                    <p className="text-xs text-gray-600 line-clamp-2">{review.body}</p>
                                </td>
                                <td className="p-4 text-center">
                                    <RatingStars rating={review.rating} size="sm" />
                                </td>
                                <td className="p-4 text-center font-bold text-sm">{review.likes_count ?? 0}</td>
                                <td className="p-4 text-right">
                                    <button
                                        onClick={() => handleDelete(review.id)}
                                        className="text-xs font-black uppercase text-red-600 hover:underline"
                                    >
                                        Eliminar
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <Pagination meta={meta} onPageChange={(p) => setPage(p)} />
        </div>
    );
}

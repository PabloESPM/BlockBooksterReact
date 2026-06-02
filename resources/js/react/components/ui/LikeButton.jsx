import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import apiClient from '../../api/client';

/**
 * Botón de like para reseñas y listas.
 * @param {string} type - 'review' o 'list'
 * @param {number} id - ID del recurso
 * @param {boolean} initialLiked - Estado inicial
 * @param {number} initialCount - Conteo inicial de likes
 */
export default function LikeButton({
    type = 'review',
    id,
    initialLiked = false,
    initialCount = 0,
    disabled = false,
}) {
    const { isAuthenticated } = useAuth();
    const [liked, setLiked] = useState(initialLiked);
    const [count, setCount] = useState(initialCount);
    const [loading, setLoading] = useState(false);

    const endpointMap = {
        review: `/reviews/${id}/like`,
        list: `/lists/${id}/like`,
    };

    const handleToggle = async (e) => {
        if (e) {
            e.preventDefault();
            e.stopPropagation();
        }

        if (disabled) return;

        if (!isAuthenticated) {
            window.location.href = '/login';
            return;
        }

        setLoading(true);
        try {
            const res = await apiClient.post(endpointMap[type]);
            setLiked(res.data.status === 'liked');
            setCount(res.data.likes_count);
        } catch (error) {
            console.error('Error al dar like:', error);
        } finally {
            setLoading(false);
        }
    };

    if (disabled) {
        return (
            <div className="flex items-center gap-1 text-xs font-bold uppercase border-2 border-black px-3 py-1.5 bg-white text-black select-none">
                <span>{liked ? '♥' : '♡'}</span>
                <span>{count}</span>
            </div>
        );
    }

    return (
        <button
            onClick={handleToggle}
            disabled={loading}
            className={`flex items-center gap-1 text-xs font-bold uppercase border-2 border-black px-3 py-1.5 transition-all ${liked
                    ? 'bg-red-500 text-white cursor-pointer'
                    : 'bg-white text-black hover:-translate-y-0.5 cursor-pointer'
                }`}
        >
            <span>{liked ? '♥' : '♡'}</span>
            <span>{count}</span>
        </button>
    );
}

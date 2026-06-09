import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import userService from '../../services/userService';
import listService from '../../services/listService';

/**
 * Botón de seguir/dejar de seguir con estado y feedback inmediato.
 * @param {string} type - 'user', 'author' o 'list'
 * @param {number|string} id - ID del recurso a seguir
 * @param {boolean} initialFollowing - Estado inicial de follow
 * @param {number} initialCount - Conteo inicial de seguidores
 * @param {function} onToggle - Callback opcional tras toggle
 */
export default function FollowButton({
    type = 'user',
    id,
    initialFollowing = false,
    initialCount = 0,
    onToggle = null,
}) {
    const { isAuthenticated } = useAuth();
    const [following, setFollowing] = useState(initialFollowing);
    const [count, setCount] = useState(initialCount);
    const [loading, setLoading] = useState(false);

    const handleToggle = async () => {
        if (!isAuthenticated) {
            window.location.href = '/login';
            return;
        }

        setLoading(true);
        try {
            let data;
            if (type === 'user') {
                data = await userService.toggleFollowUser(id);
            } else if (type === 'author') {
                data = await userService.toggleFollowAuthor(id);
            } else if (type === 'list') {
                data = await listService.toggleFollowList(id);
            }
            
            setFollowing(data.following);
            setCount(data.followers_count ?? data.likes_count ?? count);
            onToggle?.(data);
            window.dispatchEvent(new CustomEvent('follow-updated', {
                detail: { type, id, following: data.following, count: data.followers_count ?? data.likes_count ?? count, data }
            }));
        } catch (error) {
            console.error('Error al seguir/dejar de seguir:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <button
            onClick={handleToggle}
            disabled={loading}
            className={`text-xs font-bold uppercase tracking-wide px-4 py-2 border-2 border-black transition-all ${
                following
                    ? 'bg-brand-blue text-white shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]'
                    : 'bg-brand-yellow text-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:-translate-y-1 hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]'
            }`}
        >
            {loading ? '...' : following ? 'Dejar de seguir' : 'Seguir'}
        </button>
    );
}

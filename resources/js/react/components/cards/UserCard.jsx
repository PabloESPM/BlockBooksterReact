import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import FollowButton from '../ui/FollowButton';

/**
 * Tarjeta de usuario estilo Neo-Brutalism.
 */
export default function UserCard({
    user,
    rank = null,
    statLabel = null,
    statValue = null,
    avatarBg = 'bg-gray-200',
}) {
    const { user: currentUser, isAuthenticated } = useAuth();
    const fallbackUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&size=200&background=FFA903&color=000&bold=true`;
    const avatarUrl = user.avatar_url || fallbackUrl;

    return (
        <div className="neo-card p-4 flex items-center gap-4 hover:translate-x-1 transition-transform">
            {rank && (
                <div className="text-2xl font-black text-gray-300 w-8">#{rank}</div>
            )}
            <Link to={`/users/${user.id}`} className="flex items-center gap-4 flex-grow min-w-0">
                <div className={`w-12 h-12 ${avatarBg} rounded-full border-2 border-black flex-shrink-0 overflow-hidden`}>
                    <img
                        src={avatarUrl}
                        alt={user.name}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                            e.target.src = fallbackUrl;
                        }}
                    />
                </div>
                <div className="flex-grow min-w-0">
                    <h3 className="font-bold uppercase text-sm truncate hover:text-brand-blue">{user.name}</h3>
                    {statLabel !== null ? (
                        <p className="text-xs font-bold text-gray-500">
                            {statValue} {statLabel}
                        </p>
                    ) : (
                        user.followers_count !== undefined && (
                            <p className="text-xs font-bold text-gray-500">
                                {user.followers_count} seguidor{user.followers_count !== 1 ? 'es' : ''}
                            </p>
                        )
                    )}
                </div>
            </Link>

            {isAuthenticated && currentUser && currentUser.id !== user.id && (
                <div className="flex-shrink-0">
                    <FollowButton
                        type="user"
                        id={user.id}
                        initialFollowing={!!user.is_following}
                        initialCount={user.followers_count || 0}
                    />
                </div>
            )}
        </div>
    );
}

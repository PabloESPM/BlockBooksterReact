import { Link } from 'react-router-dom';

/**
 * Tarjeta de usuario estilo Neo-Brutalism.
 */
export default function UserCard({ user }) {
    const fallbackUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&size=200&background=FFA903&color=000&bold=true`;
    const avatarUrl = user.avatar_url || fallbackUrl;

    return (
        <Link
            to={`/users/${user.id}`}
            className="flex items-center gap-4 neo-card p-4 neo-shadow-hover"
        >
            <img
                src={avatarUrl}
                alt={user.name}
                className="w-12 h-12 border-2 border-black object-cover shrink-0"
                onError={(e) => {
                    e.target.src = fallbackUrl;
                }}
            />
            <div className="min-w-0">
                <h3 className="font-bold text-sm truncate">{user.name}</h3>
                {user.followers_count !== undefined && (
                    <p className="text-xs text-gray-500 font-medium">
                        {user.followers_count} seguidor{user.followers_count !== 1 ? 'es' : ''}
                    </p>
                )}
            </div>
        </Link>
    );
}

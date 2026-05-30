import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import FollowButton from '../ui/FollowButton';

/**
 * Tarjeta de autor estilo Neo-Brutalism.
 */
export default function AuthorCard({ author, showFollow = true }) {
    const { isAuthenticated } = useAuth();
    const fallbackUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(author.full_name || author.name)}&size=200&background=0E3FA9&color=fff&bold=true`;
    const photoUrl = author.photo || fallbackUrl;

    return (
        <div className="neo-card p-4 text-center group hover:bg-blue-50/50 transition-all cursor-pointer hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:-translate-y-1">
            <Link to={`/authors/${author.id}`} className="block">
                <div className="w-24 h-24 mx-auto bg-gray-300 rounded-full border-2 border-black mb-3 overflow-hidden">
                    <img
                        src={photoUrl}
                        alt={author.full_name || author.name}
                        className="w-full h-full object-cover"
                        loading="lazy"
                        onError={(e) => {
                            e.target.src = fallbackUrl;
                        }}
                    />
                </div>
                <h3 className="text-sm font-bold uppercase mb-1 group-hover:underline truncate">
                    {author.full_name || author.name}
                </h3>
                {author.books_count !== undefined && (
                    <div className="text-xs font-bold text-gray-500">
                        {author.books_count} Libro{author.books_count !== 1 ? 's' : ''}
                    </div>
                )}
            </Link>
            {isAuthenticated && showFollow && (
                <div className="mt-3 flex justify-center">
                    <FollowButton
                        type="author"
                        id={author.id}
                        initialFollowing={!!author.is_followed}
                        initialCount={author.followers_count || 0}
                    />
                </div>
            )}
        </div>
    );
}

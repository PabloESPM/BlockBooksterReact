import { Link } from 'react-router-dom';
import LikeButton from '../ui/LikeButton';

/**
 * Tarjeta de lista de favoritos estilo Neo-Brutalism.
 * Muestra vista previa de portadas, título, creador y likes.
 */
export default function ListCard({ list }) {
    const covers = list.books?.slice(0, 4) || [];
    const avatarUrl = list.user?.avatar_url
        || `https://ui-avatars.com/api/?name=${encodeURIComponent(list.user?.name || 'U')}&size=80&background=0E3FA9&color=fff`;

    return (
        <div className="neo-card neo-shadow-hover overflow-hidden">
            {/* Vista previa de portadas (grid 2x2) */}
            <Link to={`/lists/${list.id}`} className="block">
                <div className="grid grid-cols-2 border-b-2 border-black aspect-[4/3]">
                    {[0, 1, 2, 3].map((i) => (
                        <div key={i} className={`overflow-hidden ${i < 2 ? 'border-b border-black' : ''} ${i % 2 === 0 ? 'border-r border-black' : ''}`}>
                            {covers[i] ? (
                                <img
                                    src={covers[i].cover_image || `${window.location.origin}/storage/${covers[i].cover_path}`}
                                    alt=""
                                    className="w-full h-full object-cover"
                                    loading="lazy"
                                    onError={(e) => {
                                        e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(covers[i].title)}&size=200&background=0E3FA9&color=fff&bold=true`;
                                    }}
                                />
                            ) : (
                                <div className="w-full h-full bg-gray-100"></div>
                            )}
                        </div>
                    ))}
                </div>
            </Link>

            {/* Información */}
            <div className="p-3">
                <Link to={`/lists/${list.id}`}>
                    <h3 className="font-bold text-sm mb-1 line-clamp-1 hover:text-brand-blue">
                        {list.name}
                    </h3>
                </Link>
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <img
                            src={avatarUrl}
                            alt=""
                            className="w-5 h-5 border border-black object-cover"
                            onError={(e) => {
                                e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(list.user?.name || 'U')}&size=80&background=0E3FA9&color=fff`;
                            }}
                        />
                        <span className="text-xs text-gray-500 font-medium">
                            {list.user?.name}
                        </span>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="text-xs text-gray-400 font-bold">
                            {list.books_count ?? 0} libros
                        </span>
                        <LikeButton
                            type="list"
                            id={list.id}
                            initialLiked={list.is_liked}
                            initialCount={list.likes_count ?? 0}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}

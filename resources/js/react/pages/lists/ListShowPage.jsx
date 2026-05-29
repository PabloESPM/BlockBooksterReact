import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import apiClient from '../../api/client';
import BookCard from '../../components/cards/BookCard';
import LikeButton from '../../components/ui/LikeButton';
import { Link } from 'react-router-dom';

/**
 * Detalle de lista — Replica pages.list.show.
 */
export default function ListShowPage() {
    const { id } = useParams();
    const [list, setList] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        apiClient.get(`/lists/${id}`).then((res) => {
            setList(res.data.data);
            setLoading(false);
        });
    }, [id]);

    if (loading) return <div className="flex justify-center py-20"><div className="neo-spinner"></div></div>;
    if (!list) return <div className="text-center py-12 font-bold">Lista no encontrada</div>;

    const avatarUrl = list.user?.avatar_url
        || `https://ui-avatars.com/api/?name=${encodeURIComponent(list.user?.name || 'U')}&size=80&background=0E3FA9&color=fff`;

    return (
        <div className="max-w-7xl mx-auto px-4 py-8">
            {/* Cabecera */}
            <div className="neo-card p-6 mb-8">
                <div className="flex items-center justify-between flex-wrap gap-4">
                    <div>
                        <h1 className="text-2xl font-black uppercase tracking-tight mb-2">{list.name}</h1>
                        <div className="flex items-center gap-3">
                            <Link to={`/users/${list.user?.id}`} className="flex items-center gap-2 hover:text-brand-blue">
                                <img
                                    src={avatarUrl}
                                    alt=""
                                    className="w-6 h-6 border border-black object-cover"
                                    onError={(e) => {
                                        e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(list.user?.name || 'U')}&size=80&background=0E3FA9&color=fff`;
                                    }}
                                />
                                <span className="text-sm font-bold">{list.user?.name}</span>
                            </Link>
                            <span className="text-xs text-gray-400 font-bold">
                                {list.books_count} libro{list.books_count !== 1 ? 's' : ''}
                            </span>
                        </div>
                    </div>
                    <LikeButton
                        type="list"
                        id={list.id}
                        initialLiked={list.is_liked}
                        initialCount={list.likes_count ?? 0}
                    />
                </div>
                {list.description && (
                    <p className="text-sm text-gray-600 mt-4">{list.description}</p>
                )}
            </div>

            {/* Libros de la lista */}
            {list.books?.length > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                    {list.books.map((book) => (
                        <BookCard key={book.isbn} book={book} />
                    ))}
                </div>
            ) : (
                <div className="neo-card p-8 text-center">
                    <p className="font-bold">Esta lista está vacía</p>
                </div>
            )}
        </div>
    );
}

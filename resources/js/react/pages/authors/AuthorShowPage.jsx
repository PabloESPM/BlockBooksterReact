import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import apiClient from '../../api/client';
import BookCard from '../../components/cards/BookCard';
import FollowButton from '../../components/ui/FollowButton';
import Pagination from '../../components/ui/Pagination';

/**
 * Perfil de autor — Replica pages.authors.show.
 */
export default function AuthorShowPage() {
    const { id } = useParams();
    const [author, setAuthor] = useState(null);
    const [books, setBooks] = useState({ data: [], meta: null });
    const [page, setPage] = useState(1);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        apiClient.get(`/authors/${id}`, { params: { page } }).then((res) => {
            setAuthor(res.data.data);
            setBooks({ data: res.data.books.data, meta: res.data.books.meta });
            setLoading(false);
        });
    }, [id, page]);

    if (loading) return <div className="flex justify-center py-20"><div className="neo-spinner"></div></div>;
    if (!author) return <div className="text-center py-12 font-bold">Autor no encontrado</div>;

    const photoUrl = author.photo
        ? author.photo
        : `https://ui-avatars.com/api/?name=${encodeURIComponent(author.full_name)}&size=300&background=0E3FA9&color=fff&bold=true`;

    return (
        <div className="max-w-7xl mx-auto px-4 py-8">
            {/* Cabecera */}
            <div className="flex flex-col md:flex-row gap-8 mb-12">
                <div className="w-48 shrink-0">
                    <div className="neo-card overflow-hidden">
                        <img
                            src={photoUrl}
                            alt={author.full_name}
                            className="w-full aspect-square object-cover"
                            onError={(e) => {
                                e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(author.full_name)}&size=300&background=0E3FA9&color=fff&bold=true`;
                            }}
                        />
                    </div>
                </div>
                <div className="flex-grow">
                    <h1 className="text-3xl font-black uppercase tracking-tight mb-2">{author.full_name}</h1>
                    {author.country && (
                        <p className="text-sm text-gray-500 font-medium mb-3">{author.country.name}</p>
                    )}
                    <div className="flex items-center gap-4 mb-4">
                        <span className="text-xs font-bold uppercase bg-gray-100 border-2 border-black px-3 py-1">
                            {author.books_count} libro{author.books_count !== 1 ? 's' : ''}
                        </span>
                        <span className="text-xs font-bold uppercase bg-gray-100 border-2 border-black px-3 py-1">
                            {author.followers_count} seguidor{author.followers_count !== 1 ? 'es' : ''}
                        </span>
                        <FollowButton
                            type="author"
                            id={author.id}
                            initialFollowing={author.is_followed}
                            initialCount={author.followers_count}
                        />
                    </div>
                    {author.biography && (
                        <p className="text-sm text-gray-700 leading-relaxed">{author.biography}</p>
                    )}
                </div>
            </div>

            {/* Libros del autor */}
            <h2 className="text-xl font-black uppercase tracking-tight mb-4 border-b-4 border-black pb-2">
                Libros ({books.meta?.total || 0})
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4">
                {books.data.map((book) => (
                    <BookCard key={book.isbn} book={book} />
                ))}
            </div>
            <Pagination meta={books.meta} onPageChange={(p) => setPage(p)} />
        </div>
    );
}

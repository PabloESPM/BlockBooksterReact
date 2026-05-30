import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import apiClient from '../../api/client';
import BookCard from '../../components/cards/BookCard';
import FollowButton from '../../components/ui/FollowButton';
import { useAuth } from '../../context/AuthContext';

/**
 * Perfil de autor — Replica pages.authors.show.
 */
export default function AuthorShowPage() {
    const { id } = useParams();
    const { isAuthenticated } = useAuth();
    const [author, setAuthor] = useState(null);
    const [books, setBooks] = useState({ data: [], meta: null });
    const [page, setPage] = useState(1);
    const [loading, setLoading] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);

    useEffect(() => {
        setLoading(true);
        apiClient.get(`/authors/${id}`, { params: { page: 1 } }).then((res) => {
            setAuthor(res.data.data);
            setBooks({ data: res.data.books.data, meta: res.data.books.meta });
            setPage(1);
            setLoading(false);
        });
    }, [id]);

    const handleLoadMore = () => {
        if (loadingMore) return;
        const nextPage = page + 1;
        setLoadingMore(true);
        apiClient.get(`/authors/${id}`, { params: { page: nextPage } }).then((res) => {
            setBooks((prev) => ({
                data: [...prev.data, ...res.data.books.data],
                meta: res.data.books.meta
            }));
            setPage(nextPage);
            setLoadingMore(false);
        });
    };

    const handleShare = () => {
        const shareData = {
            title: `Perfil de ${author?.full_name}`,
            url: window.location.href
        };
        if (navigator.share && navigator.canShare && navigator.canShare(shareData)) {
            navigator.share(shareData).catch((err) => console.error(err));
        } else {
            navigator.clipboard.writeText(window.location.href);
            alert("¡Enlace copiado al portapapeles!");
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center py-20">
                <div className="neo-spinner"></div>
            </div>
        );
    }

    if (!author) {
        return <div className="text-center py-12 font-bold">Autor no encontrado</div>;
    }

    const fallbackUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(author.full_name)}&size=300&background=0E3FA9&color=fff&bold=true`;
    const photoUrl = author.photo || fallbackUrl;

    const formatBirthDate = (dateString) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        return date.toLocaleDateString('es-ES', {
            day: '2-digit',
            month: 'short',
            year: 'numeric'
        });
    };

    const hasMoreBooks = books.meta && books.meta.current_page < books.meta.last_page;

    return (
        <div className="max-w-7xl mx-auto px-4 py-8">
            {/* Encabezado del Autor */}
            <div className="neo-card p-6 md:p-10 mb-12 relative overflow-hidden">
                {/* Elemento decorativo de fondo */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-brand-yellow rounded-full translate-x-1/2 -translate-y-1/2 border-2 border-black opacity-20 pointer-events-none"></div>

                <div className="flex flex-col md:flex-row items-center md:items-start gap-8 relative z-10">
                    {/* Foto del Autor */}
                    <div className="flex-shrink-0">
                        <div className="w-48 h-48 bg-gray-300 rounded-full border-4 border-black shadow-[8px_8px_0px_#000] overflow-hidden">
                            <img
                                src={photoUrl}
                                alt={author.full_name}
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                    e.target.src = fallbackUrl;
                                }}
                            />
                        </div>
                    </div>

                    {/* Información del Autor */}
                    <div className="flex-grow text-center md:text-left min-w-0">
                        <div className="mb-4">
                            <h1 className="text-4xl md:text-6xl font-black font-display uppercase tracking-tighter mb-2 break-words leading-none">
                                {author.full_name}
                            </h1>
                            <div className="flex flex-wrap justify-center md:justify-start gap-4 text-sm font-bold uppercase tracking-wide text-gray-700">
                                {author.country && (
                                    <span className="flex items-center gap-1">
                                        <span className="w-2 h-2 bg-black rounded-full"></span>
                                        {author.country.name}
                                    </span>
                                )}
                                {author.birth_date && (
                                    <span className="flex items-center gap-1">
                                        <span className="w-2 h-2 bg-black rounded-full"></span>
                                        {formatBirthDate(author.birth_date)}
                                    </span>
                                )}
                            </div>
                        </div>

                        {/* Estadísticas */}
                        <div className="grid grid-cols-3 gap-4 border-y-2 border-black py-4 mb-6 max-w-md mx-auto md:mx-0">
                            <div className="text-center md:text-left border-r-2 border-black last:border-0 pr-4">
                                <div className="text-2xl font-black select-none">{author.books_count || 0}</div>
                                <div className="text-xs font-bold uppercase text-gray-500">Libros</div>
                            </div>
                            <div className="text-center md:text-left border-r-2 border-black last:border-0 px-4">
                                <div className="text-2xl font-black select-none">{author.followers_count || 0}</div>
                                <div className="text-xs font-bold uppercase text-gray-500">Seguidores</div>
                            </div>
                            <div className="text-center md:text-left pl-4">
                                <div className="text-2xl font-black flex items-center justify-center md:justify-start gap-1 select-none">
                                    4.5 <span className="text-brand-yellow text-lg">★</span>
                                </div>
                                <div className="text-xs font-bold uppercase text-gray-500">Valoración Media</div>
                            </div>
                        </div>

                        <div className="flex gap-4 justify-center md:justify-start flex-wrap">
                            {isAuthenticated && (
                                <FollowButton
                                    type="author"
                                    id={author.id}
                                    initialFollowing={author.is_followed}
                                    initialCount={author.followers_count}
                                />
                            )}
                            <button
                                onClick={handleShare}
                                className="neo-btn-secondary py-2 px-4 text-sm uppercase font-black cursor-pointer"
                            >
                                Compartir Perfil
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                {/* Sección: Biografía */}
                <div className="lg:col-span-1">
                    <div className="mb-4 border-b-2 border-black pb-2">
                        <h2 className="text-2xl font-black uppercase flex items-center gap-2">
                            <span className="w-4 h-4 bg-brand-blue border-2 border-black block"></span>
                            Biografía
                        </h2>
                    </div>
                    <div className="neo-card p-6 text-sm leading-relaxed font-medium">
                        <p className="mb-4">
                            {author.biography || 'No hay biografía disponible para este autor.'}
                        </p>
                        <a
                            href={`https://es.wikipedia.org/wiki/Special:Search?search=${encodeURIComponent(author.full_name)}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="block mt-4 font-bold uppercase underline hover:text-brand-blue"
                        >
                            Leer biografía completa en Wikipedia -&gt;
                        </a>
                    </div>
                </div>

                {/* Sección: Libros */}
                <div className="lg:col-span-2">
                    <div className="flex items-center justify-between mb-4 border-b-2 border-black pb-2">
                        <h2 className="text-2xl font-black uppercase flex items-center gap-2">
                            <span className="w-4 h-4 bg-brand-yellow border-2 border-black block"></span>
                            Bibliografía
                        </h2>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-3 gap-6" id="load-more-grid">
                        {books.data.map((book) => (
                            <div key={book.isbn}>
                                <BookCard book={book} />
                            </div>
                        ))}
                    </div>

                    {hasMoreBooks && (
                        <div className="mt-8">
                            <button
                                onClick={handleLoadMore}
                                disabled={loadingMore}
                                className="w-full neo-btn-secondary flex items-center justify-center gap-2 py-3 uppercase font-black cursor-pointer disabled:opacity-50"
                            >
                                {loadingMore && (
                                    <span className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin"></span>
                                )}
                                <span>Cargar más libros</span>
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

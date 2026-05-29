import { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import apiClient from '../../api/client';
import BookCard from '../../components/cards/BookCard';
import AuthorCard from '../../components/cards/AuthorCard';
import UserCard from '../../components/cards/UserCard';
import ListCard from '../../components/cards/ListCard';

/**
 * Resultados de búsqueda global — Replica pages.search.results.
 */
export default function SearchResultsPage() {
    const [searchParams] = useSearchParams();
    const query = searchParams.get('q') || '';
    const [results, setResults] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!query.trim()) return;
        setLoading(true);
        apiClient.get('/search', { params: { q: query } }).then((res) => {
            setResults(res.data);
            setLoading(false);
        });
    }, [query]);

    if (!query.trim()) {
        return (
            <div className="max-w-7xl mx-auto px-4 py-12 text-center">
                <p className="font-bold">Introduce un término de búsqueda.</p>
            </div>
        );
    }

    if (loading) return <div className="flex justify-center py-20"><div className="neo-spinner"></div></div>;

    return (
        <div className="max-w-7xl mx-auto px-4 py-8">
            <h1 className="text-2xl font-black uppercase tracking-tight mb-2">
                Resultados para "<span className="text-brand-blue">{query}</span>"
            </h1>
            <p className="text-xs font-bold text-gray-500 uppercase mb-8">
                {results?.total_results || 0} resultado{results?.total_results !== 1 ? 's' : ''}
            </p>

            {results?.total_results === 0 ? (
                <div className="neo-card p-12 text-center">
                    <p className="text-lg font-bold mb-2">Sin resultados</p>
                    <p className="text-sm text-gray-500">Prueba con otro término de búsqueda.</p>
                </div>
            ) : (
                <div className="space-y-12">
                    {/* Libros */}
                    {results?.books?.length > 0 && (
                        <section>
                            <h2 className="text-sm font-black uppercase tracking-widest mb-4 border-b-2 border-black pb-2">
                                📚 Libros ({results.books.length})
                            </h2>
                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
                                {results.books.map((book) => <BookCard key={book.isbn} book={book} />)}
                            </div>
                        </section>
                    )}

                    {/* Autores */}
                    {results?.authors?.length > 0 && (
                        <section>
                            <h2 className="text-sm font-black uppercase tracking-widest mb-4 border-b-2 border-black pb-2">
                                ✍️ Autores ({results.authors.length})
                            </h2>
                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4">
                                {results.authors.map((a) => <AuthorCard key={a.id} author={a} />)}
                            </div>
                        </section>
                    )}

                    {/* Usuarios */}
                    {results?.users?.length > 0 && (
                        <section>
                            <h2 className="text-sm font-black uppercase tracking-widest mb-4 border-b-2 border-black pb-2">
                                👥 Usuarios ({results.users.length})
                            </h2>
                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                                {results.users.map((u) => <UserCard key={u.id} user={u} />)}
                            </div>
                        </section>
                    )}

                    {/* Listas */}
                    {results?.lists?.length > 0 && (
                        <section>
                            <h2 className="text-sm font-black uppercase tracking-widest mb-4 border-b-2 border-black pb-2">
                                📋 Listas ({results.lists.length})
                            </h2>
                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                                {results.lists.map((l) => <ListCard key={l.id} list={l} />)}
                            </div>
                        </section>
                    )}

                    {/* Géneros */}
                    {results?.genres?.length > 0 && (
                        <section>
                            <h2 className="text-sm font-black uppercase tracking-widest mb-4 border-b-2 border-black pb-2">
                                🏷️ Géneros ({results.genres.length})
                            </h2>
                            <div className="flex flex-wrap gap-3">
                                {results.genres.map((g) => (
                                    <Link key={g.id} to={`/books?genre=${g.id}`} className="neo-card px-4 py-2 neo-shadow-hover text-sm font-bold">
                                        {g.name}
                                    </Link>
                                ))}
                            </div>
                        </section>
                    )}
                </div>
            )}
        </div>
    );
}

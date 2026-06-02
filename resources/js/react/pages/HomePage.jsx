import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import apiClient from '../api/client';
import BookCard from '../components/cards/BookCard';
import ListCard from '../components/cards/ListCard';
import AuthorCard from '../components/cards/AuthorCard';
import ReviewCard from '../components/cards/ReviewCard';
import GenreCard from '../components/cards/GenreCard';
import HomeSearchBar from '../components/ui/HomeSearchBar';
import { useAuth } from '../context/AuthContext';

/**
 * Página Principal (Home) — Replica el diseño pre-migración.
 * Secciones: Hero con barra de búsqueda grande y sugerencias, Únete al club,
 * Novedades (carousel), Mejor Valorados, Top Géneros, Autores emergentes, Listas y Reseñas.
 */
export default function HomePage() {
    const { isAuthenticated } = useAuth();

    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const loadData = () => {
        setLoading(true);
        setError(null);
        apiClient.get('/home')
            .then((res) => {
                setData(res.data);
                setLoading(false);
            })
            .catch((err) => {
                console.error('Error loading home data:', err);
                setError('No se pudieron cargar los datos de la página principal. Por favor, inténtalo de nuevo.');
                setLoading(false);
            });
    };

    useEffect(() => {
        loadData();
    }, []);

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="neo-spinner"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="max-w-md mx-auto my-16 px-4">
                <div className="neo-card p-6">
                    <h2 className="text-xl font-black uppercase mb-3">⚠️ Algo salió mal</h2>
                    <p className="text-sm font-medium text-gray-700 mb-6">{error}</p>
                    <button onClick={loadData} className="neo-btn-primary text-sm w-full">
                        Reintentar
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div>
            {/* Encabezado Principal / Hero */}
            <section className="bg-brand-blue text-white mb-20 border-b-4 border-black pb-16 pt-8">
                <div className="text-center">
                    <h1 className="text-5xl md:text-7xl font-display font-black tracking-tighter mb-6 uppercase leading-none">
                        Descubre tu próxima<br />
                        <span className="text-brand-yellow">gran lectura</span>
                    </h1>
                    <p className="text-xl font-bold mb-10 max-w-2xl mx-auto text-white/80">
                        Explora miles de libros, escribe reseñas, crea listas y conecta con lectores de todo el mundo.
                    </p>
                </div>

                {/* Barra de Búsqueda con sugerencias en tiempo real */}
                <HomeSearchBar />
            </section>

            {/* Secciones de Contenido */}
            <div className="max-w-7xl mx-auto px-4 pb-16 space-y-16">
                {/* Únete al club (solo invitados/no autenticados) */}
                {!isAuthenticated && (
                    <section className="mb-20 bg-black text-white p-8 md:p-12 shadow-[8px_8px_0px_#000] relative overflow-hidden">
                        <div className="absolute -right-20 -top-20 w-64 h-64 bg-brand-yellow rounded-full opacity-20 blur-3xl"></div>
                        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
                            <div>
                                <h2 className="text-3xl md:text-4xl font-black uppercase mb-2">Únete al club</h2>
                                <p className="font-bold text-gray-400">Crea tu perfil, lleva un registro de tus lecturas y únete al debate.</p>
                            </div>
                            <Link
                                to="/register"
                                className="bg-brand-yellow text-black border-2 border-white font-black uppercase px-8 py-4 shadow-[4px_4px_0px_#fff] hover:translate-y-[-2px] hover:shadow-[6px_6px_0px_#fff] transition-all shrink-0 text-center"
                            >
                                Crear cuenta
                            </Link>
                        </div>
                    </section>
                )}

                <div id="discovery"></div>

                {/* Últimas novedades (Carousel con snap scrolling) */}
                {data?.latest?.length > 0 && (
                    <section className="mb-16">
                        <div className="flex items-end justify-between mb-8 border-b-2 border-black pb-2">
                            <h2 className="text-3xl font-display font-black uppercase tracking-tight">
                                Últimas <span className="text-brand-blue">Novedades</span>
                            </h2>
                            <Link
                                to="/books"
                                className="font-bold underline decoration-2 decoration-brand-yellow hover:bg-brand-yellow hover:text-black transition-colors px-2"
                            >
                                VER TODOS
                            </Link>
                        </div>

                        <div className="flex overflow-x-auto pb-10 space-x-6 snap-x hide-scrollbar">
                            {data.latest.map((book) => (
                                <div key={book.isbn} className="w-48 flex-none snap-start">
                                    <BookCard book={book} />
                                </div>
                            ))}
                        </div>
                    </section>
                )}

                {/* Mejor Valorados */}
                {data?.top_rated?.length > 0 && (
                    <section className="mb-16">
                        <div className="flex items-end justify-between mb-8 border-b-2 border-black pb-2">
                            <h2 className="text-3xl font-display font-black uppercase tracking-tight">
                                Mejor <span className="text-brand-yellow [text-shadow:2px_2px_0px_rgba(0,0,0,1)]">Valorados</span>
                            </h2>
                            <Link
                                to="/books"
                                className="font-bold underline decoration-2 decoration-brand-yellow hover:bg-brand-yellow hover:text-black transition-colors px-2"
                            >
                                VER TODOS
                            </Link>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6">
                            {data.top_rated.map((book) => (
                                <BookCard key={book.isbn} book={book} />
                            ))}
                        </div>
                    </section>
                )}

                {/* Top Géneros */}
                {data?.top_genres?.length > 0 && (
                    <section className="mb-16">
                        <div className="flex items-end justify-between mb-8 border-b-2 border-black pb-2">
                            <h2 className="text-3xl font-display font-black uppercase tracking-tight">
                                Top <span className="underline decoration-4 decoration-brand-blue">Géneros</span>
                            </h2>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {data.top_genres.map((genre) => (
                                <GenreCard key={genre.id} genre={genre} />
                            ))}
                        </div>
                    </section>
                )}

                {/* Autores emergentes */}
                {data?.rising_stars?.length > 0 && (
                    <section className="mb-20">
                        <div className="flex items-end justify-between mb-8 border-b-2 border-black pb-2">
                            <h2 className="text-3xl font-display font-black uppercase tracking-tight">
                                Autores <span className="bg-black text-white px-2">emergentes</span>
                            </h2>
                            <Link
                                to="/authors"
                                className="font-bold underline decoration-2 decoration-brand-yellow hover:bg-brand-yellow hover:text-black transition-colors px-2"
                            >
                                VER TODOS
                            </Link>
                        </div>
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-6">
                            {data.rising_stars.map((author) => (
                                <AuthorCard key={author.id} author={author} />
                            ))}
                        </div>
                    </section>
                )}

                {/* Listas Destacadas */}
                {data?.featured_lists?.length > 0 && (
                    <section className="mb-20">
                        <div className="flex items-end justify-between mb-8 border-b-2 border-black pb-2">
                            <h2 className="text-3xl font-display font-black uppercase tracking-tight">
                                Listas <span className="text-brand-blue">Destacadas</span>
                            </h2>
                            <Link
                                to="/lists"
                                className="font-bold underline decoration-2 decoration-brand-yellow hover:bg-brand-yellow hover:text-black transition-colors px-2"
                            >
                                VER TODOS
                            </Link>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                            {data.featured_lists.map((list) => (
                                <ListCard key={list.id} list={list} />
                            ))}
                        </div>
                    </section>
                )}

                {/* Brutales Opiniones */}
                <section className="mb-16">
                    <h2 className="text-3xl font-display font-black uppercase tracking-tight mb-8 border-b-2 border-black pb-2">
                        Opiniones Brutales
                    </h2>
                    {data?.brutal_opinions?.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                            {data.brutal_opinions.map((review) => (
                                <ReviewCard key={review.id} review={review} />
                            ))}
                        </div>
                    ) : (
                        <div className="col-span-3 text-center py-12 border-2 border-dashed border-gray-300 bg-gray-50">
                            <p className="text-xl font-bold uppercase text-gray-400">Sin opiniones brutales todavía este mes.</p>
                        </div>
                    )}
                </section>
            </div>
        </div>
    );
}

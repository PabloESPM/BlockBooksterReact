import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import apiClient from '../api/client';
import BookCard from '../components/cards/BookCard';
import ListCard from '../components/cards/ListCard';
import UserCard from '../components/cards/UserCard';

/**
 * Página Home — Replica pages.home.index.
 * Secciones: hero, novedades, mejor valorados, más reseñados, géneros, listas, usuarios.
 */
export default function HomePage() {
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
                console.error("Error loading home data:", err);
                setError("No se pudieron cargar los datos de la página principal. Por favor, inténtalo de nuevo.");
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
            {/* Hero */}
            <section className="bg-brand-blue text-white py-16 border-b-4 border-black">
                <div className="max-w-7xl mx-auto px-4 text-center">
                    <h1 className="text-4xl md:text-6xl font-display font-black uppercase tracking-tighter mb-4">
                        Descubre tu próxima<br />
                        <span className="text-brand-yellow">gran lectura</span>
                    </h1>
                    <p className="text-sm md:text-base font-medium mb-8 text-white/80 max-w-xl mx-auto">
                        Explora miles de libros, escribe reseñas, crea listas y conecta con lectores de todo el mundo.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-3 justify-center">
                        <Link to="/books" className="neo-btn-primary text-sm">
                            Explorar catálogo
                        </Link>
                        <Link to="/register" className="neo-btn-secondary text-sm">
                            Crear cuenta gratis
                        </Link>
                    </div>
                </div>
            </section>

            {/* Secciones */}
            <div className="max-w-7xl mx-auto px-4 py-12 space-y-16">
                {/* Últimas novedades */}
                <Section title="Últimas Novedades" linkTo="/books?sort=newest" linkLabel="Ver todas">
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                        {data?.latest?.map((book) => (
                            <BookCard key={book.isbn} book={book} />
                        ))}
                    </div>
                </Section>

                {/* Mejor valorados */}
                <Section title="Mejor Valorados" linkTo="/books?sort=top_rated" linkLabel="Ver todos">
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                        {data?.top_rated?.map((book) => (
                            <BookCard key={book.isbn} book={book} />
                        ))}
                    </div>
                </Section>

                {/* Géneros populares */}
                {data?.genres?.length > 0 && (
                    <Section title="Explora por Género">
                        <div className="flex flex-wrap gap-3">
                            {data.genres.map((genre) => (
                                <Link
                                    key={genre.id}
                                    to={`/books?genre=${genre.id}`}
                                    className="neo-card px-4 py-2 neo-shadow-hover"
                                >
                                    <span className="text-sm font-bold">{genre.name}</span>
                                    <span className="text-xs text-gray-500 ml-2">
                                        {genre.books_count} libros
                                    </span>
                                </Link>
                            ))}
                        </div>
                    </Section>
                )}

                {/* Listas destacadas */}
                {data?.featured_lists?.length > 0 && (
                    <Section title="Listas Destacadas" linkTo="/lists" linkLabel="Ver todas">
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                            {data.featured_lists.map((list) => (
                                <ListCard key={list.id} list={list} />
                            ))}
                        </div>
                    </Section>
                )}

                {/* Usuarios destacados */}
                {data?.featured_users?.length > 0 && (
                    <Section title="Lectores Destacados" linkTo="/community" linkLabel="Ver comunidad">
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                            {data.featured_users.map((user) => (
                                <UserCard key={user.id} user={user} />
                            ))}
                        </div>
                    </Section>
                )}
            </div>
        </div>
    );
}

/**
 * Componente de sección reutilizable con título y enlace opcional.
 */
function Section({ title, linkTo, linkLabel, children }) {
    return (
        <section>
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl md:text-2xl font-black uppercase tracking-tight">{title}</h2>
                {linkTo && (
                    <Link to={linkTo} className="text-xs font-bold uppercase text-brand-blue hover:underline">
                        {linkLabel} →
                    </Link>
                )}
            </div>
            {children}
        </section>
    );
}

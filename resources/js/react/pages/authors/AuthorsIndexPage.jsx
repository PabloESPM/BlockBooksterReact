import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import apiClient from '../../api/client';
import AuthorCard from '../../components/cards/AuthorCard';

/**
 * Catálogo de autores — Replica pages.authors.index.
 */
export default function AuthorsIndexPage() {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        apiClient.get('/authors').then((res) => {
            setData(res.data);
            setLoading(false);
        });
    }, []);

    // Formateador simple de tiempo relativo para "Nuevos Autores"
    const getRelativeTime = (dateString) => {
        if (!dateString) return 'hace poco';
        const date = new Date(dateString);
        const now = new Date();
        const diffMs = now - date;
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMins / 60);
        const diffDays = Math.floor(diffHours / 24);
        const diffMonths = Math.floor(diffDays / 30);

        if (diffMins < 60) return 'hace poco';
        if (diffHours < 24) return `hace ${diffHours} h`;
        if (diffDays < 30) return `hace ${diffDays} día${diffDays !== 1 ? 's' : ''}`;
        if (diffMonths < 12) return `hace ${diffMonths} me${diffMonths !== 1 ? 'ses' : 's'}`;
        const diffYears = Math.floor(diffMonths / 12);
        return `hace ${diffYears} año${diffYears !== 1 ? 's' : ''}`;
    };

    if (loading) {
        return (
            <div className="flex justify-center py-20">
                <div className="neo-spinner"></div>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto px-4 py-8">
            {/* Cabecera */}
            <div className="mb-12 border-b-4 border-black pb-4">
                <h1 className="text-4xl md:text-6xl font-black font-display uppercase tracking-tighter">
                    Conoce a los <span className="text-brand-yellow [text-shadow:3px_3px_0px_#000]">Autores</span>
                </h1>
                <p className="text-lg font-bold mt-2 text-gray-600 uppercase tracking-widest">
                    Las mentes detrás de las historias
                </p>
            </div>

            {/* Sección: Autores Populares */}
            <section className="mb-16">
                <div className="flex items-center justify-between mb-6 border-b-2 border-black pb-2">
                    <h2 className="text-2xl font-black uppercase flex items-center gap-2">
                        <span className="w-4 h-4 bg-brand-blue border-2 border-black block"></span>
                        Populares Ahora
                    </h2>
                    <span className="text-sm font-bold uppercase hover:underline hover:text-brand-blue cursor-pointer">
                        Ver todos -&gt;
                    </span>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6">
                    {data?.popular?.map((author) => (
                        <AuthorCard key={author.id} author={author} />
                    ))}
                </div>
            </section>

            {/* Sección: Los Clásicos */}
            <section className="mb-16">
                <div className="flex items-center justify-between mb-6 border-b-2 border-black pb-2">
                    <h2 className="text-2xl font-black uppercase flex items-center gap-2">
                        <span className="w-4 h-4 bg-black border-2 border-black block"></span>
                        Los Clásicos
                    </h2>
                    <span className="text-sm font-bold uppercase hover:underline hover:text-brand-blue cursor-pointer">
                        Ver todos -&gt;
                    </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {data?.classics?.map((author) => {
                        const fallbackUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(author.full_name || author.name)}&size=200&background=0E3FA9&color=fff&bold=true`;
                        const photoUrl = author.photo || fallbackUrl;
                        return (
                            <div key={author.id} className="neo-card p-6 flex items-center gap-6">
                                <div className="w-20 h-20 bg-gray-200 border-2 border-black flex-shrink-0 overflow-hidden">
                                    <img
                                        src={photoUrl}
                                        alt={author.full_name || author.name}
                                        className="w-full h-full object-cover"
                                        onError={(e) => {
                                            e.target.src = fallbackUrl;
                                        }}
                                    />
                                </div>
                                <div className="min-w-0 flex-grow">
                                    <Link to={`/authors/${author.id}`}>
                                        <h3 className="text-xl font-black uppercase hover:underline truncate">
                                            {author.full_name || author.name}
                                        </h3>
                                    </Link>
                                    <p className="text-sm font-bold text-gray-600 mb-2">Autor Clásico</p>
                                    <div className="flex items-center gap-1">
                                        <span className="text-xs font-black bg-brand-yellow px-2 border border-black select-none">
                                            4.8
                                        </span>
                                        <span className="text-xs font-bold uppercase text-gray-500 whitespace-nowrap">
                                            Calificación Media
                                        </span>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </section>

            {/* Sección: Más Valorados */}
            <section className="mb-16">
                <div className="flex items-center justify-between mb-6 border-b-2 border-black pb-2">
                    <h2 className="text-2xl font-black uppercase flex items-center gap-2">
                        <span className="w-4 h-4 bg-brand-yellow border-2 border-black block"></span>
                        Más Valorados
                    </h2>
                    <span className="text-sm font-bold uppercase hover:underline hover:text-brand-blue cursor-pointer">
                        Ver todos -&gt;
                    </span>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                    {data?.most_rated?.map((author) => (
                        <div key={author.id} className="neo-card p-3 text-center flex flex-col justify-between">
                            <Link to={`/authors/${author.id}`}>
                                <h3 className="font-bold uppercase text-sm truncate hover:underline text-brand-blue">
                                    {author.full_name || author.name}
                                </h3>
                            </Link>
                            <div className="text-3xl font-black text-brand-blue my-2 font-display select-none">
                                {(author.books_count || 5) * 120}
                            </div>
                            <div className="text-xs font-bold uppercase text-gray-500">
                                Valoraciones Estimadas
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            {/* Sección: Nuevos Autores (Estrellas Emergentes) */}
            <section className="mb-8">
                <div className="flex items-center justify-between mb-6 border-b-2 border-black pb-2">
                    <h2 className="text-2xl font-black uppercase flex items-center gap-2">
                        <span className="w-4 h-4 bg-green-500 border-2 border-black block"></span>
                        Estrellas Emergentes
                    </h2>
                    <span className="text-sm font-bold uppercase hover:underline hover:text-brand-blue cursor-pointer">
                        Ver todos -&gt;
                    </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {data?.new?.map((author) => (
                        <div key={author.id} className="neo-card p-4 hover:-translate-y-1 transition-transform flex flex-col justify-between">
                            <div className="flex items-center gap-3 mb-3">
                                <div className="w-10 h-10 bg-black rounded-full text-white flex items-center justify-center font-bold text-[10px] uppercase select-none">
                                    Nuevo
                                </div>
                                <div className="min-w-0 flex-grow">
                                    <Link to={`/authors/${author.id}`}>
                                        <h3 className="font-bold uppercase text-sm hover:underline truncate">
                                            {author.full_name || author.name}
                                        </h3>
                                    </Link>
                                    <p className="text-xs text-gray-500 whitespace-nowrap">
                                        Se unió {getRelativeTime(author.created_at)}
                                    </p>
                                </div>
                            </div>
                            <p className="text-sm text-gray-700 italic border-l-2 border-gray-300 pl-3">
                                &quot;Descubre sus últimas obras...&quot;
                            </p>
                        </div>
                    ))}
                </div>
            </section>
        </div>
    );
}

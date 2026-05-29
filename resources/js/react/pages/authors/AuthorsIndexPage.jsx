import { useState, useEffect } from 'react';
import apiClient from '../../api/client';
import AuthorCard from '../../components/cards/AuthorCard';

/**
 * Catálogo de autores — Replica pages.authors.index.
 * Secciones: populares, clásicos, más valorados, emergentes.
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

    if (loading) {
        return <div className="flex justify-center py-20"><div className="neo-spinner"></div></div>;
    }

    return (
        <div className="max-w-7xl mx-auto px-4 py-8">
            <h1 className="text-3xl font-black uppercase tracking-tight mb-8">Autores</h1>

            {/* Populares */}
            <Section title="Autores Populares">
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4">
                    {data?.popular?.map((author) => (
                        <AuthorCard key={author.id} author={author} />
                    ))}
                </div>
            </Section>

            {/* Clásicos */}
            <Section title="Clásicos">
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                    {data?.classics?.map((author) => (
                        <AuthorCard key={author.id} author={author} />
                    ))}
                </div>
            </Section>

            {/* Más valorados */}
            <Section title="Más Valorados">
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
                    {data?.most_rated?.map((author) => (
                        <AuthorCard key={author.id} author={author} />
                    ))}
                </div>
            </Section>

            {/* Estrellas emergentes */}
            <Section title="Estrellas Emergentes">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    {data?.new?.map((author) => (
                        <AuthorCard key={author.id} author={author} />
                    ))}
                </div>
            </Section>
        </div>
    );
}

function Section({ title, children }) {
    return (
        <section className="mb-12">
            <h2 className="text-xl font-black uppercase tracking-tight mb-4 border-b-2 border-black pb-2">
                {title}
            </h2>
            {children}
        </section>
    );
}

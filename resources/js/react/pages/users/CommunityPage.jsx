import { useState, useEffect } from 'react';
import apiClient from '../../api/client';
import UserCard from '../../components/cards/UserCard';

/**
 * Comunidad — Rankings de usuarios. Replica pages.users.index.
 */
export default function CommunityPage() {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        apiClient.get('/community').then((res) => {
            setData(res.data);
            setLoading(false);
        });
    }, []);

    if (loading) {
        return (
            <div className="flex justify-center py-20">
                <div className="neo-spinner"></div>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto px-4 py-8">
            <div className="mb-12 border-b-4 border-black pb-4">
                <h1 className="text-4xl md:text-6xl font-black font-display uppercase tracking-tighter">
                    Centro de <span className="text-brand-yellow [text-shadow:3px_3px_0px_#000]">Comunidad</span>
                </h1>
                <p className="text-lg font-bold mt-2 text-gray-600 uppercase tracking-widest">Conecta con otros lectores</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                {/* Columna 1: Más Seguidos */}
                <section>
                    <div className="bg-black text-white p-4 mb-6 shadow-[4px_4px_0px_#888]">
                        <h2 className="text-xl font-black uppercase text-center tracking-widest font-display">🏆 Más Seguidos</h2>
                    </div>

                    <div className="space-y-6">
                        {data?.most_followed?.map((user, i) => (
                            <div key={`most-followed-${user.id}`}>
                                <UserCard
                                    user={user}
                                    rank={i + 1}
                                    statLabel="Seguidores"
                                    statValue={user.followers_count}
                                    avatarBg="bg-brand-blue"
                                />
                            </div>
                        ))}
                    </div>
                </section>

                {/* Columna 2: Top Curadores */}
                <section>
                    <div className="bg-brand-blue text-white border-2 border-black p-4 mb-6 shadow-[4px_4px_0px_#000]">
                        <h2 className="text-xl font-black uppercase text-center tracking-widest font-display">📚 Top Curadores</h2>
                    </div>

                    <div className="space-y-6">
                        {data?.top_curators?.map((user, i) => (
                            <div key={`top-curators-${user.id}`}>
                                <UserCard
                                    user={user}
                                    rank={i + 1}
                                    statLabel="Listas Creadas"
                                    statValue={user.lists_count}
                                    avatarBg="bg-brand-yellow"
                                />
                            </div>
                        ))}
                    </div>
                </section>

                {/* Columna 3: Más Activos */}
                <section>
                    <div className="bg-brand-yellow text-black border-2 border-black p-4 mb-6 shadow-[4px_4px_0px_#000]">
                        <h2 className="text-xl font-black uppercase text-center tracking-widest font-display">✍️ Más Activos</h2>
                    </div>

                    <div className="space-y-6">
                        {data?.most_active?.map((user, i) => (
                            <div key={`most-active-${user.id}`}>
                                <UserCard
                                    user={user}
                                    rank={i + 1}
                                    statLabel="Reseñas"
                                    statValue={user.reviews_count}
                                    avatarBg="bg-gray-200"
                                />
                            </div>
                        ))}
                    </div>
                </section>
            </div>
        </div>
    );
}

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

    if (loading) return <div className="flex justify-center py-20"><div className="neo-spinner"></div></div>;

    return (
        <div className="max-w-7xl mx-auto px-4 py-8">
            <h1 className="text-3xl font-black uppercase tracking-tight mb-8">Comunidad</h1>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {/* Más seguidos */}
                <RankingSection title="🏆 Más Seguidos" users={data?.most_followed} />
                {/* Mejores curadores */}
                <RankingSection title="📚 Mejores Curadores" users={data?.top_curators} />
                {/* Más activos */}
                <RankingSection title="✍️ Más Activos" users={data?.most_active} />
            </div>
        </div>
    );
}

function RankingSection({ title, users }) {
    return (
        <div>
            <h2 className="text-sm font-black uppercase tracking-widest mb-4 border-b-2 border-black pb-2">
                {title}
            </h2>
            <div className="space-y-3">
                {users?.map((user, i) => (
                    <div key={user.id} className="flex items-center gap-3">
                        <span className="text-lg font-black text-gray-300 w-6">{i + 1}</span>
                        <div className="flex-grow">
                            <UserCard user={user} />
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

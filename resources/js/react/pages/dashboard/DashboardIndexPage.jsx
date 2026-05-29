import { useState, useEffect } from 'react';
import apiClient from '../../api/client';

/**
 * Dashboard principal — Estadísticas del usuario. Replica pages.dashboard.index.
 */
export default function DashboardIndexPage() {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        apiClient.get('/dashboard').then((res) => {
            setStats(res.data.stats);
            setLoading(false);
        });
    }, []);

    if (loading) return <div className="flex justify-center py-12"><div className="neo-spinner"></div></div>;

    const cards = [
        { label: 'Libros leídos', value: stats?.read_books, icon: '📖', color: 'bg-green-100' },
        { label: 'Leyendo ahora', value: stats?.reading_books, icon: '📚', color: 'bg-blue-100' },
        { label: 'Mis listas', value: stats?.lists, icon: '📋', color: 'bg-purple-100' },
        { label: 'Mis reseñas', value: stats?.reviews, icon: '✍️', color: 'bg-yellow-100' },
        { label: 'Seguidores', value: stats?.followers, icon: '👥', color: 'bg-pink-100' },
        { label: 'Siguiendo', value: stats?.following, icon: '🤝', color: 'bg-orange-100' },
    ];

    return (
        <div>
            <h1 className="text-2xl font-black uppercase tracking-tight mb-6">Resumen</h1>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {cards.map((card) => (
                    <div key={card.label} className={`neo-card p-4 ${card.color}`}>
                        <span className="text-2xl">{card.icon}</span>
                        <p className="text-3xl font-black mt-2">{card.value ?? 0}</p>
                        <p className="text-xs font-bold uppercase tracking-wide text-gray-600 mt-1">{card.label}</p>
                    </div>
                ))}
            </div>
        </div>
    );
}

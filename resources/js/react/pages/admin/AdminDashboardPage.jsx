import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import apiClient from '../../api/client';

/**
 * Dashboard de administración — Estadísticas y acciones rápidas.
 * Replica admin.dashboard Livewire SFC.
 */
export default function AdminDashboardPage() {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        apiClient.get('/admin').then((res) => {
            setStats(res.data.stats);
            setLoading(false);
        });
    }, []);

    if (loading) return <div className="flex justify-center py-12"><div className="neo-spinner"></div></div>;

    const cards = [
        { label: 'Total de Libros', value: stats?.total_books, color: 'bg-white' },
        { label: 'Total de Usuarios', value: stats?.total_users, color: 'bg-white' },
        { label: 'Reseñas Creadas', value: stats?.total_reviews, color: 'bg-brand-yellow/20' },
        { label: 'Listas de Usuarios', value: stats?.total_lists, color: 'bg-white' },
        { label: 'Total de Autores', value: stats?.total_authors, color: 'bg-white' },
    ];

    return (
        <div>
            <h1 className="text-3xl font-black uppercase font-display mb-8">Panel de Control</h1>

            {/* Estadísticas */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
                {cards.map((card) => (
                    <div key={card.label} className={`${card.color} border-2 border-black p-6 shadow-[4px_4px_0px_#000]`}>
                        <div className="text-xs font-bold uppercase text-gray-500 mb-1">{card.label}</div>
                        <div className="text-4xl font-black">{(card.value ?? 0).toLocaleString()}</div>
                        <div className="text-xs font-bold text-green-600 mt-2">En base de datos</div>
                    </div>
                ))}
            </div>

            {/* Acciones rápidas */}
            <h2 className="text-xl font-black uppercase mb-4 border-b-2 border-black pb-2">Acciones Rápidas</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Link
                    to="/admin/books?action=create"
                    className="flex flex-col items-center justify-center p-6 bg-brand-blue text-white border-2 border-black shadow-[4px_4px_0px_#000] hover:-translate-y-0.5 hover:shadow-[6px_6px_0px_#000] transition-all"
                >
                    <span className="text-2xl mb-2">📖</span>
                    <span className="font-bold uppercase text-xs">Añadir Libro</span>
                </Link>
                <Link
                    to="/admin/users"
                    className="flex flex-col items-center justify-center p-6 bg-white border-2 border-black shadow-[4px_4px_0px_#000] hover:-translate-y-0.5 hover:shadow-[6px_6px_0px_#000] transition-all"
                >
                    <span className="text-2xl mb-2">👥</span>
                    <span className="font-bold uppercase text-xs">Ver Usuarios</span>
                </Link>
                <Link
                    to="/admin/reviews"
                    className="flex flex-col items-center justify-center p-6 bg-brand-yellow border-2 border-black shadow-[4px_4px_0px_#000] hover:-translate-y-0.5 hover:shadow-[6px_6px_0px_#000] transition-all"
                >
                    <span className="text-2xl mb-2">💬</span>
                    <span className="font-bold uppercase text-xs">Moderar</span>
                </Link>
                <Link
                    to="/admin/authors"
                    className="flex flex-col items-center justify-center p-6 bg-white border-2 border-black shadow-[4px_4px_0px_#000] hover:-translate-y-0.5 hover:shadow-[6px_6px_0px_#000] transition-all"
                >
                    <span className="text-2xl mb-2">✍️</span>
                    <span className="font-bold uppercase text-xs">Autores</span>
                </Link>
            </div>
        </div>
    );
}

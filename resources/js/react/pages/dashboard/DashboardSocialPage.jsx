import { useState, useEffect } from 'react';
import apiClient from '../../api/client';
import UserCard from '../../components/cards/UserCard';
import AuthorCard from '../../components/cards/AuthorCard';

/**
 * Social — Seguidores, seguidos y autores seguidos. Replica pages.dashboard.social.
 */
export default function DashboardSocialPage() {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        apiClient.get('/dashboard/social').then((res) => {
            setData(res.data);
            setLoading(false);
        });
    }, []);

    if (loading) return <div className="flex justify-center py-12"><div className="neo-spinner"></div></div>;

    return (
        <div>
            <h1 className="text-2xl font-black uppercase tracking-tight mb-6">Social</h1>

            <div className="space-y-8">
                {/* Seguidores */}
                <section>
                    <h2 className="text-sm font-black uppercase tracking-widest mb-3 border-b-2 border-black pb-2">
                        👥 Seguidores ({data?.followers_count || 0})
                    </h2>
                    {data?.followers?.length > 0 ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            {data.followers.map((u) => <UserCard key={u.id} user={u} />)}
                        </div>
                    ) : <p className="text-sm text-gray-500">Sin seguidores aún.</p>}
                </section>

                {/* Siguiendo */}
                <section>
                    <h2 className="text-sm font-black uppercase tracking-widest mb-3 border-b-2 border-black pb-2">
                        🤝 Siguiendo ({data?.following_count || 0})
                    </h2>
                    {data?.following?.length > 0 ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            {data.following.map((u) => <UserCard key={u.id} user={u} />)}
                        </div>
                    ) : <p className="text-sm text-gray-500">No sigues a nadie aún.</p>}
                </section>

                {/* Autores seguidos */}
                <section>
                    <h2 className="text-sm font-black uppercase tracking-widest mb-3 border-b-2 border-black pb-2">
                        ✍️ Autores seguidos
                    </h2>
                    {data?.followed_authors?.length > 0 ? (
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                            {data.followed_authors.map((a) => <AuthorCard key={a.id} author={a} />)}
                        </div>
                    ) : <p className="text-sm text-gray-500">No sigues autores aún.</p>}
                </section>
            </div>
        </div>
    );
}

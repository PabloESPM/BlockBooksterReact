import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import apiClient from '../../api/client';
import BookCard from '../../components/cards/BookCard';
import ReviewCard from '../../components/cards/ReviewCard';
import ListCard from '../../components/cards/ListCard';
import FollowButton from '../../components/ui/FollowButton';
import Pagination from '../../components/ui/Pagination';

/**
 * Perfil público de usuario — Replica pages.users.show.
 * Incluye lógica de visibilidad (public/followers/friends/private).
 */
export default function UserProfilePage() {
    const { id } = useParams();
    const [profile, setProfile] = useState(null);
    const [canView, setCanView] = useState(true);
    const [isOwner, setIsOwner] = useState(false);
    const [bookStats, setBookStats] = useState({});
    const [activeTab, setActiveTab] = useState('read');
    const [tabData, setTabData] = useState({ data: [], meta: null });
    const [loading, setLoading] = useState(true);

    // Cargar perfil
    useEffect(() => {
        setLoading(true);
        apiClient.get(`/users/${id}`).then((res) => {
            setProfile(res.data.data);
            setCanView(res.data.can_view_content);
            setIsOwner(res.data.is_owner);
            setBookStats(res.data.book_stats);
            setLoading(false);
        });
    }, [id]);

    // Cargar datos de la pestaña activa
    useEffect(() => {
        if (!canView || loading) return;
        loadTabData(activeTab, 1);
    }, [activeTab, canView, loading, id]);

    const loadTabData = (tab, page) => {
        let endpoint;
        switch (tab) {
            case 'read':
            case 'reading':
            case 'pending':
                endpoint = `/users/${id}/books?status=${tab}&page=${page}`;
                break;
            case 'reviews':
                endpoint = `/users/${id}/reviews?page=${page}`;
                break;
            case 'lists':
                endpoint = `/users/${id}/lists?page=${page}`;
                break;
            default:
                return;
        }
        apiClient.get(endpoint).then((res) => {
            setTabData({ data: res.data.data, meta: res.data.meta });
        });
    };

    if (loading) return <div className="flex justify-center py-20"><div className="neo-spinner"></div></div>;
    if (!profile) return <div className="text-center py-12 font-bold">Usuario no encontrado</div>;

    const avatarUrl = profile.avatar_url
        || `https://ui-avatars.com/api/?name=${encodeURIComponent(profile.name)}&size=200&background=FFA903&color=000&bold=true`;

    const tabs = [
        { key: 'read', label: `Leídos (${bookStats.read || 0})` },
        { key: 'reading', label: `Leyendo (${bookStats.reading || 0})` },
        { key: 'pending', label: `Pendientes (${bookStats.pending || 0})` },
        { key: 'reviews', label: 'Reseñas' },
        { key: 'lists', label: 'Listas' },
    ];

    return (
        <div className="max-w-7xl mx-auto px-4 py-8">
            {/* Cabecera del perfil */}
            <div className="neo-card p-6 mb-8">
                <div className="flex flex-col sm:flex-row items-start gap-6">
                    <img
                        src={avatarUrl}
                        alt={profile.name}
                        className="w-24 h-24 border-4 border-black shrink-0 object-cover"
                        onError={(e) => {
                            e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(profile.name)}&size=200&background=FFA903&color=000&bold=true`;
                        }}
                    />
                    <div className="flex-grow">
                        <div className="flex items-center gap-4 flex-wrap">
                            <h1 className="text-2xl font-black uppercase tracking-tight">{profile.name}</h1>
                            {!isOwner && (
                                <FollowButton
                                    type="user"
                                    id={profile.id}
                                    initialFollowing={profile.is_following}
                                    initialCount={profile.followers_count}
                                />
                            )}
                        </div>
                        {profile.bio && <p className="text-sm text-gray-600 mt-2">{profile.bio}</p>}
                        <div className="flex gap-4 mt-3">
                            <span className="text-xs font-bold"><strong>{profile.followers_count}</strong> seguidores</span>
                            <span className="text-xs font-bold"><strong>{profile.following_count}</strong> siguiendo</span>
                            <span className="text-xs font-bold"><strong>{profile.reviews_count}</strong> reseñas</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Contenido (con lógica de visibilidad) */}
            {!canView ? (
                <div className="neo-card p-12 text-center">
                    <p className="text-lg font-bold mb-2">🔒 Perfil privado</p>
                    <p className="text-sm text-gray-500">
                        Este usuario ha restringido la visibilidad de su perfil.
                    </p>
                </div>
            ) : (
                <>
                    {/* Pestañas */}
                    <div className="flex flex-wrap gap-1 mb-6 border-b-2 border-black">
                        {tabs.map((tab) => (
                            <button
                                key={tab.key}
                                onClick={() => setActiveTab(tab.key)}
                                className={`text-xs font-bold uppercase tracking-wide px-4 py-2 border-2 border-black border-b-0 transition-colors ${
                                    activeTab === tab.key
                                        ? 'bg-brand-yellow'
                                        : 'bg-white hover:bg-gray-50'
                                }`}
                            >
                                {tab.label}
                            </button>
                        ))}
                    </div>

                    {/* Contenido de la pestaña */}
                    {['read', 'reading', 'pending'].includes(activeTab) && (
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4">
                            {tabData.data.map((book) => (
                                <BookCard key={book.isbn} book={book} />
                            ))}
                        </div>
                    )}
                    {activeTab === 'reviews' && (
                        <div className="space-y-4">
                            {tabData.data.map((review) => (
                                <ReviewCard key={review.id} review={review} />
                            ))}
                        </div>
                    )}
                    {activeTab === 'lists' && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                            {tabData.data.map((list) => (
                                <ListCard key={list.id} list={list} />
                            ))}
                        </div>
                    )}

                    {tabData.data.length === 0 && (
                        <div className="neo-card p-8 text-center">
                            <p className="text-sm text-gray-500 font-bold">No hay contenido en esta sección</p>
                        </div>
                    )}

                    <Pagination meta={tabData.meta} onPageChange={(p) => loadTabData(activeTab, p)} />
                </>
            )}
        </div>
    );
}

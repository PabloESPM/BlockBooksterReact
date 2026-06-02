import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import apiClient from '../../api/client';
import BookCard from '../../components/cards/BookCard';
import ReviewCard from '../../components/cards/ReviewCard';
import ListCard from '../../components/cards/ListCard';
import UserCard from '../../components/cards/UserCard';
import AuthorCard from '../../components/cards/AuthorCard';
import UserProfileCard from '../../components/cards/UserProfileCard';
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

    // Listas
    const [createdLists, setCreatedLists] = useState({ data: [], meta: null });
    const [followedLists, setFollowedLists] = useState({ data: [], meta: null });

    // Social
    const [followedAuthors, setFollowedAuthors] = useState([]);
    const [followedAuthorsPage, setFollowedAuthorsPage] = useState(1);
    const [hasMoreFollowedAuthors, setHasMoreFollowedAuthors] = useState(false);
    const [loadingFollowedAuthors, setLoadingFollowedAuthors] = useState(false);

    const [following, setFollowing] = useState([]);
    const [followingPage, setFollowingPage] = useState(1);
    const [hasMoreFollowing, setHasMoreFollowing] = useState(false);
    const [loadingFollowing, setLoadingFollowing] = useState(false);

    const [followers, setFollowers] = useState([]);
    const [followersPage, setFollowersPage] = useState(1);
    const [hasMoreFollowers, setHasMoreFollowers] = useState(false);
    const [loadingFollowers, setLoadingFollowers] = useState(false);

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

    // Cargar datos de la pestaña activa (excepto listas y social que tienen carga propia)
    useEffect(() => {
        if (!canView || loading) return;
        if (!['lists', 'social'].includes(activeTab)) {
            loadTabData(activeTab, 1);
        }
    }, [activeTab, canView, loading, id]);

    // Carga de Listas
    const loadCreatedLists = (page) => {
        apiClient.get(`/users/${id}/lists?type=created&page=${page}`).then((res) => {
            setCreatedLists({ data: res.data.data, meta: res.data.meta });
        });
    };

    const loadFollowedLists = (page) => {
        apiClient.get(`/users/${id}/lists?type=followed&page=${page}`).then((res) => {
            setFollowedLists({ data: res.data.data, meta: res.data.meta });
        });
    };

    useEffect(() => {
        if (!canView || loading) return;
        if (activeTab === 'lists') {
            loadCreatedLists(1);
            if (profile?.profile_visibility === 'public') {
                loadFollowedLists(1);
            }
        }
    }, [activeTab, canView, loading, id, profile]);

    // Carga de Social (con append para "Cargar más")
    const loadFollowedAuthors = (page) => {
        setLoadingFollowedAuthors(true);
        apiClient.get(`/users/${id}/authors?page=${page}`).then((res) => {
            if (page === 1) {
                setFollowedAuthors(res.data.data);
            } else {
                setFollowedAuthors((prev) => [...prev, ...res.data.data]);
            }
            setHasMoreFollowedAuthors(res.data.meta.current_page < res.data.meta.last_page);
            setFollowedAuthorsPage(page);
            setLoadingFollowedAuthors(false);
        });
    };

    const loadFollowing = (page) => {
        setLoadingFollowing(true);
        apiClient.get(`/users/${id}/following?page=${page}`).then((res) => {
            if (page === 1) {
                setFollowing(res.data.data);
            } else {
                setFollowing((prev) => [...prev, ...res.data.data]);
            }
            setHasMoreFollowing(res.data.meta.current_page < res.data.meta.last_page);
            setFollowingPage(page);
            setLoadingFollowing(false);
        });
    };

    const loadFollowers = (page) => {
        setLoadingFollowers(true);
        apiClient.get(`/users/${id}/followers?page=${page}`).then((res) => {
            if (page === 1) {
                setFollowers(res.data.data);
            } else {
                setFollowers((prev) => [...prev, ...res.data.data]);
            }
            setHasMoreFollowers(res.data.meta.current_page < res.data.meta.last_page);
            setFollowersPage(page);
            setLoadingFollowers(false);
        });
    };

    useEffect(() => {
        if (!canView || loading) return;
        if (activeTab === 'social') {
            loadFollowedAuthors(1);
            loadFollowing(1);
            loadFollowers(1);
        }
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
            default:
                return;
        }
        apiClient.get(endpoint).then((res) => {
            setTabData({ data: res.data.data, meta: res.data.meta });
        });
    };

    if (loading) return <div className="flex justify-center py-20"><div className="neo-spinner"></div></div>;
    if (!profile) return <div className="text-center py-12 font-bold">Usuario no encontrado</div>;

    const tabs = [
        { key: 'read', label: `Leídos (${bookStats.read || 0})` },
        { key: 'reading', label: `Leyendo (${bookStats.reading || 0})` },
        { key: 'pending', label: `Quiero Leer (${bookStats.pending || 0})` },
        { key: 'reviews', label: 'Reseñas' },
        { key: 'lists', label: 'Listas' },
        { key: 'social', label: 'Social' },
    ];

    return (
        <div className="max-w-7xl mx-auto px-4 py-8">
            {/* Cabecera del perfil */}
            <UserProfileCard
                user={profile}
                readBooksCount={bookStats.read || 0}
                readingBooksCount={bookStats.reading || 0}
                isOwner={isOwner}
            />

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
                        <>
                            {tabData.data.length > 0 ? (
                                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4">
                                    {tabData.data.map((book) => (
                                        <BookCard key={book.isbn} book={book} />
                                    ))}
                                </div>
                            ) : (
                                <div className="neo-card p-8 text-center bg-gray-50 border-2 border-dashed border-black">
                                    <p className="text-sm text-gray-500 font-bold uppercase">No hay libros en esta sección</p>
                                </div>
                            )}
                            {tabData.meta && tabData.meta.last_page > 1 && (
                                <div className="mt-6">
                                    <Pagination meta={tabData.meta} onPageChange={(p) => loadTabData(activeTab, p)} />
                                </div>
                            )}
                        </>
                    )}

                    {activeTab === 'reviews' && (
                        <>
                            {tabData.data.length > 0 ? (
                                <div className="space-y-4">
                                    {tabData.data.map((review) => (
                                        <ReviewCard key={review.id} review={review} />
                                    ))}
                                </div>
                            ) : (
                                <div className="neo-card p-8 text-center bg-gray-50 border-2 border-dashed border-black">
                                    <p className="text-sm text-gray-500 font-bold uppercase">No hay reseñas en esta sección</p>
                                </div>
                            )}
                            {tabData.meta && tabData.meta.last_page > 1 && (
                                <div className="mt-6">
                                    <Pagination meta={tabData.meta} onPageChange={(p) => loadTabData(activeTab, p)} />
                                </div>
                            )}
                        </>
                    )}

                    {activeTab === 'lists' && (
                        <div className="space-y-12">
                            {/* Listas creadas */}
                            <section>
                                <h3 className="text-xl font-black uppercase mb-4 flex items-center gap-2 border-b-2 border-black pb-2">
                                    <span className="w-3 h-3 bg-brand-yellow border-2 border-black block"></span>
                                    Listas Públicas
                                </h3>
                                {createdLists.data.length > 0 ? (
                                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                                        {createdLists.data.map((list) => (
                                            <ListCard key={list.id} list={list} />
                                        ))}
                                    </div>
                                ) : (
                                    <div className="neo-card p-8 text-center bg-gray-50 border-2 border-dashed border-black">
                                        <p className="text-sm text-gray-500 font-bold uppercase">No ha creado ninguna lista pública</p>
                                    </div>
                                )}
                                {createdLists.meta && createdLists.meta.last_page > 1 && (
                                    <div className="mt-6">
                                        <Pagination
                                            meta={createdLists.meta}
                                            onPageChange={(p) => loadCreatedLists(p)}
                                        />
                                    </div>
                                )}
                            </section>

                            {/* Listas seguidas */}
                            {profile.profile_visibility === 'public' && followedLists.data.length > 0 && (
                                <section>
                                    <h3 className="text-xl font-black uppercase mb-4 flex items-center gap-2 border-b-2 border-black pb-2">
                                        <span className="w-3 h-3 bg-brand-blue border-2 border-black block"></span>
                                        Listas Seguidas
                                    </h3>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                                        {followedLists.data.map((list) => (
                                            <ListCard key={list.id} list={list} />
                                        ))}
                                    </div>
                                    {followedLists.meta && followedLists.meta.last_page > 1 && (
                                        <div className="mt-6">
                                            <Pagination
                                                meta={followedLists.meta}
                                                onPageChange={(p) => loadFollowedLists(p)}
                                            />
                                        </div>
                                    )}
                                </section>
                            )}
                        </div>
                    )}

                    {activeTab === 'social' && (
                        <div className="space-y-12">
                            {/* Autores Seguidos */}
                            {followedAuthors.length > 0 && (
                                <section>
                                    <h3 className="text-xl font-black uppercase mb-4 flex items-center gap-2 border-b-2 border-black pb-2">
                                        <span className="w-3 h-3 bg-brand-blue border-2 border-black block"></span>
                                        Autores Seguidos
                                    </h3>
                                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6">
                                        {followedAuthors.map((author) => (
                                            <AuthorCard
                                                key={author.id}
                                                author={author}
                                                showFollow={true}
                                            />
                                        ))}
                                    </div>
                                    {hasMoreFollowedAuthors && (
                                        <div className="mt-8 flex justify-center">
                                            <button
                                                onClick={() => loadFollowedAuthors(followedAuthorsPage + 1)}
                                                disabled={loadingFollowedAuthors}
                                                className="neo-btn-secondary px-8 py-3 uppercase font-black flex items-center gap-2 cursor-pointer disabled:opacity-60 disabled:cursor-wait"
                                            >
                                                {loadingFollowedAuthors && (
                                                    <span className="inline-block w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin"></span>
                                                )}
                                                Cargar más autores
                                            </button>
                                        </div>
                                    )}
                                </section>
                            )}

                            {/* Usuarios seguidos y seguidores */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                {/* Siguiendo */}
                                <section>
                                    <h3 className="text-xl font-black uppercase mb-4 flex items-center gap-2 border-b-2 border-black pb-2">
                                        <span className="w-3 h-3 bg-brand-yellow border-2 border-black block"></span>
                                        Siguiendo ({profile.following_count ?? 0})
                                    </h3>
                                    {following.length > 0 ? (
                                        <div className="space-y-4">
                                            {following.map((user) => (
                                                <UserCard
                                                    key={user.id}
                                                    user={user}
                                                    statLabel="seguidores"
                                                    statValue={user.followers_count ?? 0}
                                                />
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="neo-card p-8 text-center bg-gray-50 border-2 border-dashed border-black">
                                            <p className="font-bold text-gray-500 uppercase text-sm">Aún no sigue a nadie</p>
                                        </div>
                                    )}
                                    {hasMoreFollowing && (
                                        <div className="mt-8 flex justify-center">
                                            <button
                                                onClick={() => loadFollowing(followingPage + 1)}
                                                disabled={loadingFollowing}
                                                className="neo-btn-secondary px-8 py-3 uppercase font-black flex items-center gap-2 cursor-pointer disabled:opacity-60 disabled:cursor-wait"
                                            >
                                                {loadingFollowing && (
                                                    <span className="inline-block w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin"></span>
                                                )}
                                                Cargar más
                                            </button>
                                        </div>
                                    )}
                                </section>

                                {/* Seguidores */}
                                <section>
                                    <h3 className="text-xl font-black uppercase mb-4 flex items-center gap-2 border-b-2 border-black pb-2">
                                        <span className="w-3 h-3 bg-black border-2 border-black block"></span>
                                        Seguidores ({profile.followers_count ?? 0})
                                    </h3>
                                    {followers.length > 0 ? (
                                        <div className="space-y-4">
                                            {followers.map((user) => (
                                                <UserCard
                                                    key={user.id}
                                                    user={user}
                                                    statLabel="libros"
                                                    statValue={user.books_count ?? 0}
                                                />
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="neo-card p-8 text-center bg-gray-50 border-2 border-dashed border-black">
                                            <p className="font-bold text-gray-500 uppercase text-sm">Aún no tiene seguidores</p>
                                        </div>
                                    )}
                                    {hasMoreFollowers && (
                                        <div className="mt-8 flex justify-center">
                                            <button
                                                onClick={() => loadFollowers(followersPage + 1)}
                                                disabled={loadingFollowers}
                                                className="neo-btn-secondary px-8 py-3 uppercase font-black flex items-center gap-2 cursor-pointer disabled:opacity-60 disabled:cursor-wait"
                                            >
                                                {loadingFollowers && (
                                                    <span className="inline-block w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin"></span>
                                                )}
                                                Cargar más
                                            </button>
                                        </div>
                                    )}
                                </section>
                            </div>
                        </div>
                    )}
                </>
            )}
        </div>
    );
}

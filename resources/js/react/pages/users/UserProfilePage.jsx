import { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import userService from '../../services/userService';
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
    const { user: currentUser } = useAuth();
    const [profile, setProfile] = useState(null);
    const [bookStats, setBookStats] = useState({});
    const [activeTab, setActiveTab] = useState('read');
    const [tabData, setTabData] = useState({ data: [], meta: null });
    const [loading, setLoading] = useState(true);

    const canView = profile?.can_view_content ?? true;
    const isOwner = profile ? (currentUser && profile.id === currentUser.id) : false;

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
    const loadProfile = useCallback(() => {
        setLoading(true);
        userService.getUserProfile(id).then((resData) => {
            setProfile(resData.data);
            setBookStats(resData.book_stats);
            setLoading(false);
        }).catch((err) => {
            console.error('Error loading user profile:', err);
            setLoading(false);
        });
    }, [id]);

    useEffect(() => {
        loadProfile();
    }, [loadProfile]);

    // Carga de Listas
    const loadCreatedLists = useCallback((page) => {
        userService.getUserLists(id, { type: 'created', page }).then((resData) => {
            setCreatedLists({ data: resData.data, meta: resData.meta });
        });
    }, [id]);

    const loadFollowedLists = useCallback((page) => {
        userService.getUserLists(id, { type: 'followed', page }).then((resData) => {
            setFollowedLists({ data: resData.data, meta: resData.meta });
        });
    }, [id]);

    // Carga de Social (con append para "Cargar más")
    const loadFollowedAuthors = useCallback((page) => {
        setLoadingFollowedAuthors(true);
        userService.getUserAuthors(id, { page }).then((resData) => {
            if (page === 1) {
                setFollowedAuthors(resData.data);
            } else {
                setFollowedAuthors((prev) => [...prev, ...resData.data]);
            }
            setHasMoreFollowedAuthors(resData.meta.current_page < resData.meta.last_page);
            setFollowedAuthorsPage(page);
            setLoadingFollowedAuthors(false);
        });
    }, [id]);

    const loadFollowing = useCallback((page) => {
        setLoadingFollowing(true);
        userService.getUserFollowing(id, { page }).then((resData) => {
            if (page === 1) {
                setFollowing(resData.data);
            } else {
                setFollowing((prev) => [...prev, ...resData.data]);
            }
            setHasMoreFollowing(resData.meta.current_page < resData.meta.last_page);
            setFollowingPage(page);
            setLoadingFollowing(false);
        });
    }, [id]);

    const loadFollowers = useCallback((page) => {
        setLoadingFollowers(true);
        userService.getUserFollowers(id, { page }).then((resData) => {
            if (page === 1) {
                setFollowers(resData.data);
            } else {
                setFollowers((prev) => [...prev, ...resData.data]);
            }
            setHasMoreFollowers(resData.meta.current_page < resData.meta.last_page);
            setFollowersPage(page);
            setLoadingFollowers(false);
        });
    }, [id]);

    const loadTabData = useCallback((tab, page) => {
        let fetchPromise;
        switch (tab) {
            case 'read':
            case 'reading':
            case 'pending':
                fetchPromise = userService.getUserBooks(id, { status: tab, page });
                break;
            case 'reviews':
                fetchPromise = userService.getUserReviews(id, { page });
                break;
            default:
                return;
        }
        fetchPromise.then((resData) => {
            setTabData({ data: resData.data, meta: resData.meta });
        });
    }, [id]);

    // Cargar datos de la pestaña activa (excepto listas y social que tienen carga propia)
    useEffect(() => {
        if (!canView || loading) return;
        if (!['lists', 'social'].includes(activeTab)) {
            loadTabData(activeTab, 1);
        }
    }, [activeTab, canView, loading, loadTabData]);

    useEffect(() => {
        if (!canView || loading) return;
        if (activeTab === 'lists') {
            loadCreatedLists(1);
            if (profile?.profile_visibility === 'public') {
                loadFollowedLists(1);
            }
        }
    }, [activeTab, canView, loading, profile?.profile_visibility, loadCreatedLists, loadFollowedLists]);

    useEffect(() => {
        if (!canView || loading) return;
        if (activeTab === 'social') {
            loadFollowedAuthors(1);
            loadFollowing(1);
            loadFollowers(1);
        }
    }, [activeTab, canView, loading, loadFollowedAuthors, loadFollowing, loadFollowers]);

    // Escuchar eventos en tiempo real (SPA reactivo)
    useEffect(() => {
        const handleEventUpdate = () => {
            loadProfile();
            if (!['lists', 'social'].includes(activeTab)) {
                loadTabData(activeTab, 1);
            } else if (activeTab === 'lists') {
                loadCreatedLists(1);
                if (profile?.profile_visibility === 'public') {
                    loadFollowedLists(1);
                }
            } else if (activeTab === 'social') {
                loadFollowedAuthors(1);
                loadFollowing(1);
                loadFollowers(1);
            }
        };

        window.addEventListener('list-updated', handleEventUpdate);
        window.addEventListener('review-saved', handleEventUpdate);
        window.addEventListener('book-status-updated', handleEventUpdate);

        return () => {
            window.removeEventListener('list-updated', handleEventUpdate);
            window.removeEventListener('review-saved', handleEventUpdate);
            window.removeEventListener('book-status-updated', handleEventUpdate);
        };
    }, [loadProfile, loadTabData, loadCreatedLists, loadFollowedLists, loadFollowedAuthors, loadFollowing, loadFollowers, activeTab, profile?.profile_visibility]);

    // Escuchar actualizaciones de seguimiento (follow-updated)
    useEffect(() => {
        const handleFollowUpdated = (e) => {
            const { type, id, following: isFollowing, count } = e.detail;

            // 1. Si se actualizó el follow de este perfil
            if (type === 'user' && profile && id === profile.id) {
                setProfile(prev => prev ? {
                    ...prev,
                    is_following: isFollowing,
                    followers_count: count
                } : null);
            }

            // 2. Si el usuario logueado es dueño de este perfil y sigue/deja de seguir a alguien
            if (isOwner && type === 'user') {
                setProfile(prev => {
                    if (!prev) return null;
                    const prevCount = prev.following_count || 0;
                    const newCount = isFollowing ? prevCount + 1 : Math.max(0, prevCount - 1);
                    return { ...prev, following_count: newCount };
                });
            }

            // 3. Actualizar listas de relaciones
            if (type === 'user') {
                setFollowing(prev => {
                    if (isOwner && !isFollowing) {
                        return prev.filter(u => u.id !== id);
                    }
                    return prev.map(u => u.id === id ? { ...u, is_following: isFollowing, followers_count: count } : u);
                });
                setFollowers(prev => {
                    return prev.map(u => u.id === id ? { ...u, is_following: isFollowing, followers_count: count } : u);
                });
            } else if (type === 'author') {
                setFollowedAuthors(prev => {
                    if (isOwner && !isFollowing) {
                        return prev.filter(a => a.id !== id);
                    }
                    return prev.map(a => a.id === id ? { ...a, is_following: isFollowing, followers_count: count } : a);
                });
            }
        };

        window.addEventListener('follow-updated', handleFollowUpdated);
        return () => {
            window.removeEventListener('follow-updated', handleFollowUpdated);
        };
    }, [profile, isOwner]);

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
                onFollowToggle={loadProfile}
            />

            {/* Contenido (con lógica de visibilidad) */}
            {!canView ? (
                <div className="neo-card p-12 text-center">
                    <p className="text-lg font-bold mb-2">🔒 Perfil privado</p>
                    <p className="text-sm text-gray-500 font-bold uppercase">
                        {(() => {
                            const messages = {
                                'followers': 'Este perfil es privado. Síguele para ver su contenido.',
                                'friends':   profile?.is_following
                                                ? 'Estás siguiendo a este usuario. El acceso completo se activa cuando sea mutuo.'
                                                : 'Este perfil solo es visible para amigos mutuos.',
                                'private':   'Este perfil es privado.',
                            };
                            return messages[profile?.profile_visibility] ?? 'Este perfil es privado.';
                        })()}
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

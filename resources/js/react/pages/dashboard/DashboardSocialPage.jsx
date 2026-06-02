import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import apiClient from '../../api/client';
import UserCard from '../../components/cards/UserCard';
import AuthorCard from '../../components/cards/AuthorCard';

/**
 * Social — Seguidores, seguidos y autores seguidos.
 * Replica la maquetación y la paginación progresiva de la vista original.
 */
export default function DashboardSocialPage() {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [authorsLimit, setAuthorsLimit] = useState(8);
    const [followingLimit, setFollowingLimit] = useState(8);
    const [followersLimit, setFollowersLimit] = useState(8);
    const [loadingMore, setLoadingMore] = useState({
        authors: false,
        following: false,
        followers: false,
    });

    const loadData = (limits = {}) => {
        const params = {
            authors_limit: limits.authorsLimit ?? authorsLimit,
            following_limit: limits.followingLimit ?? followingLimit,
            followers_limit: limits.followersLimit ?? followersLimit,
        };
        return apiClient.get('/dashboard/social', { params })
            .then((res) => {
                setData(res.data);
            })
            .catch((err) => {
                console.error('Error fetching social connections:', err);
            });
    };

    useEffect(() => {
        setLoading(true);
        loadData().finally(() => {
            setLoading(false);
        });
    }, []);

    const handleLoadMore = async (section) => {
        setLoadingMore((prev) => ({ ...prev, [section]: true }));

        let newLimits = { authorsLimit, followingLimit, followersLimit };
        if (section === 'authors') {
            newLimits.authorsLimit = authorsLimit + 8;
            setAuthorsLimit(newLimits.authorsLimit);
        } else if (section === 'following') {
            newLimits.followingLimit = followingLimit + 8;
            setFollowingLimit(newLimits.followingLimit);
        } else if (section === 'followers') {
            newLimits.followersLimit = followersLimit + 8;
            setFollowersLimit(newLimits.followersLimit);
        }

        await loadData(newLimits);
        setLoadingMore((prev) => ({ ...prev, [section]: false }));
    };

    if (loading) {
        return (
            <div className="flex justify-center py-12">
                <div className="neo-spinner"></div>
            </div>
        );
    }

    return (
        <div className="flex-grow space-y-8">
            {/* Cabecera principal */}
            <header className="mb-8 border-b-4 border-black pb-4">
                <h1 className="text-3xl font-black uppercase font-display">Social</h1>
                <p className="text-gray-600 font-bold mt-1">Tus conexiones con autores y otros lectores</p>
            </header>

            {/* SECCIÓN 1 — AUTORES QUE SIGO */}
            <section className="mb-12">
                <h2 className="text-xl font-black uppercase mb-4 flex items-center gap-2 border-b-2 border-black pb-2">
                    <span className="w-3 h-3 bg-brand-blue border-2 border-black block"></span>
                    Autores que sigo
                    <span className="text-sm font-bold text-gray-500 normal-case ml-1">
                        ({data?.total_authors ?? 0})
                    </span>
                </h2>

                {data?.followed_authors?.length > 0 ? (
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                        {data.followed_authors.map((author) => (
                            <AuthorCard key={author.id} author={author} />
                        ))}
                    </div>
                ) : (
                    <div className="col-span-full text-center py-12 border-2 border-dashed border-black bg-gray-50">
                        <p className="font-bold text-gray-500 uppercase">Aún no sigues a ningún autor.</p>
                        <Link to="/authors" className="mt-4 inline-block text-brand-blue underline font-bold">
                            Explorar autores
                        </Link>
                    </div>
                )}

                {/* Botón cargar más autores */}
                {data?.has_more_authors && (
                    <div className="mt-6 flex justify-center">
                        <button
                            onClick={() => handleLoadMore('authors')}
                            disabled={loadingMore.authors}
                            className="neo-btn-secondary px-8 py-3 uppercase font-black flex items-center gap-2 cursor-pointer disabled:opacity-60 disabled:cursor-wait"
                        >
                            {loadingMore.authors && (
                                <span className="inline-block w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin"></span>
                            )}
                            Cargar más autores
                        </button>
                    </div>
                )}
            </section>

            {/* SECCIÓN 2 — USUARIOS QUE SIGO */}
            <section className="mb-12">
                <h2 className="text-xl font-black uppercase mb-4 flex items-center gap-2 border-b-2 border-black pb-2">
                    <span className="w-3 h-3 bg-brand-yellow border-2 border-black block"></span>
                    Usuarios que sigo
                    <span className="text-sm font-bold text-gray-500 normal-case ml-1">
                        ({data?.following_count ?? 0})
                    </span>
                </h2>

                {data?.following?.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {data.following.map((user) => (
                            <UserCard
                                key={user.id}
                                user={user}
                                statLabel="seguidores"
                                statValue={user.followers_count ?? 0}
                            />
                        ))}
                    </div>
                ) : (
                    <div className="col-span-full text-center py-12 border-2 border-dashed border-black bg-gray-50">
                        <p className="font-bold text-gray-500 uppercase">Aún no sigues a ningún usuario.</p>
                        <Link to="/community" className="mt-4 inline-block text-brand-blue underline font-bold">
                            Explorar la comunidad
                        </Link>
                    </div>
                )}

                {/* Botón cargar más usuarios seguidos */}
                {data?.has_more_following && (
                    <div className="mt-6 flex justify-center">
                        <button
                            onClick={() => handleLoadMore('following')}
                            disabled={loadingMore.following}
                            className="neo-btn-secondary px-8 py-3 uppercase font-black flex items-center gap-2 cursor-pointer disabled:opacity-60 disabled:cursor-wait"
                        >
                            {loadingMore.following && (
                                <span className="inline-block w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin"></span>
                            )}
                            Cargar más usuarios
                        </button>
                    </div>
                )}
            </section>

            {/* SECCIÓN 3 — USUARIOS QUE ME SIGUEN */}
            <section>
                <h2 className="text-xl font-black uppercase mb-4 flex items-center gap-2 border-b-2 border-black pb-2">
                    <span className="w-3 h-3 bg-black border-2 border-black block"></span>
                    Usuarios que me siguen
                    <span className="text-sm font-bold text-gray-500 normal-case ml-1">
                        ({data?.followers_count ?? 0})
                    </span>
                </h2>

                {data?.followers?.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {data.followers.map((user) => (
                            <UserCard
                                key={user.id}
                                user={user}
                                statLabel="libros"
                                statValue={user.books_count ?? 0}
                            />
                        ))}
                    </div>
                ) : (
                    <div className="col-span-full text-center py-12 border-2 border-dashed border-black bg-gray-50">
                        <p className="font-bold text-gray-500 uppercase">Aún nadie te sigue.</p>
                        <Link to="/community" className="mt-4 inline-block text-brand-blue underline font-bold">
                            Descubrir lectores
                        </Link>
                    </div>
                )}

                {/* Botón cargar más seguidores */}
                {data?.has_more_followers && (
                    <div className="mt-6 flex justify-center">
                        <button
                            onClick={() => handleLoadMore('followers')}
                            disabled={loadingMore.followers}
                            className="neo-btn-secondary px-8 py-3 uppercase font-black flex items-center gap-2 cursor-pointer disabled:opacity-60 disabled:cursor-wait"
                        >
                            {loadingMore.followers && (
                                <span className="inline-block w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin"></span>
                            )}
                            Cargar más seguidores
                        </button>
                    </div>
                )}
            </section>
        </div>
    );
}

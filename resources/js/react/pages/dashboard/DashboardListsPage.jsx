import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import listService from '../../services/listService';
import ListCard from '../../components/cards/ListCard';

/**
 * Mis Listas — Colecciones creadas por el usuario y listas que sigue.
 * Replica la maquetación y la paginación progresiva de la vista original.
 */
export default function DashboardListsPage() {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [createdLimit, setCreatedLimit] = useState(6);
    const [followedLimit, setFollowedLimit] = useState(6);
    const [loadingMore, setLoadingMore] = useState({
        created: false,
        followed: false,
    });

    const loadData = useCallback((limits = {}) => {
        const params = {
            created_limit: limits.createdLimit ?? createdLimit,
            followed_limit: limits.followedLimit ?? followedLimit,
        };
        return listService.getDashboardLists(params)
            .then((resData) => {
                setData(resData);
            })
            .catch((err) => {
                console.error('Error loading dashboard lists data:', err);
            });
    }, [createdLimit, followedLimit]);

    useEffect(() => {
        setLoading(true);
        loadData().finally(() => {
            setLoading(false);
        });
    }, [loadData]);

    useEffect(() => {
        const handleEventUpdate = () => {
            loadData();
        };
        window.addEventListener('list-updated', handleEventUpdate);
        return () => {
            window.removeEventListener('list-updated', handleEventUpdate);
        };
    }, [loadData]);

    const handleDelete = async (listId) => {
        if (!confirm('¿Seguro que quieres eliminar esta lista?')) return;
        try {
            await listService.deleteList(listId);
            await loadData();
            
            // Dispatch event to sync listing in case other pages display lists count
            window.dispatchEvent(new CustomEvent('list-updated', {
                detail: { listId, action: 'deleted' }
            }));
        } catch (err) {
            console.error('Error deleting list:', err);
        }
    };

    const handleLoadMore = async (section) => {
        setLoadingMore((prev) => ({ ...prev, [section]: true }));

        let newLimits = { createdLimit, followedLimit };
        if (section === 'created') {
            newLimits.createdLimit = createdLimit + 6;
            setCreatedLimit(newLimits.createdLimit);
        } else if (section === 'followed') {
            newLimits.followedLimit = followedLimit + 6;
            setFollowedLimit(newLimits.followedLimit);
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
            <header className="mb-8 border-b-4 border-black pb-4 flex justify-between items-end gap-4">
                <div>
                    <h1 className="text-3xl font-black uppercase font-display">Mis Listas</h1>
                    <p className="text-gray-600 font-bold mt-1">Colecciones que has creado y listas que sigues</p>
                </div>
                <button
                    onClick={() => {
                        window.dispatchEvent(new CustomEvent('open-add-to-list-modal'));
                    }}
                    className="neo-btn-primary text-xs cursor-pointer shrink-0"
                >
                    + Nueva lista
                </button>
            </header>

            {/* SECCIÓN 1: LISTAS CREADAS */}
            <section className="mb-12">
                <h2 className="text-xl font-black uppercase mb-4 flex items-center gap-2 border-b-2 border-black pb-2">
                    <span className="w-3 h-3 bg-brand-blue border-2 border-black block"></span>
                    Listas Creadas
                    <span className="text-sm font-bold text-gray-500 normal-case ml-1">
                        ({data?.total_created ?? 0})
                    </span>
                </h2>

                {data?.created?.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {data.created.map((list) => (
                            <ListCard
                                key={list.id}
                                list={list}
                                dashboard={true}
                                onDelete={handleDelete}
                            />
                        ))}
                    </div>
                ) : (
                    <div className="col-span-full text-center py-12 border-2 border-dashed border-black bg-gray-50">
                        <p className="font-bold text-gray-500 uppercase">Aún no has creado ninguna lista.</p>
                        <button
                            onClick={() => {
                                window.dispatchEvent(new CustomEvent('open-add-to-list-modal'));
                            }}
                            className="mt-4 text-brand-blue underline font-bold cursor-pointer"
                        >
                            Crea tu primera lista
                        </button>
                    </div>
                )}

                {/* Botón cargar más listas creadas */}
                {data?.has_more_created && (
                    <div className="mt-6 flex justify-center">
                        <button
                            onClick={() => handleLoadMore('created')}
                            disabled={loadingMore.created}
                            className="neo-btn-secondary px-8 py-3 uppercase font-black flex items-center gap-2 cursor-pointer disabled:opacity-60 disabled:cursor-wait"
                        >
                            {loadingMore.created && (
                                <span className="inline-block w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin"></span>
                            )}
                            Cargar más listas creadas
                        </button>
                    </div>
                )}
            </section>

            {/* SECCIÓN 2: LISTAS SEGUIDAS */}
            <section>
                <h2 className="text-xl font-black uppercase mb-4 flex items-center gap-2 border-b-2 border-black pb-2">
                    <span className="w-3 h-3 bg-brand-yellow border-2 border-black block"></span>
                    Listas Seguidas
                    <span className="text-sm font-bold text-gray-500 normal-case ml-1">
                        ({data?.total_followed ?? 0})
                    </span>
                </h2>

                {data?.followed?.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {data.followed.map((list) => (
                            <ListCard
                                key={list.id}
                                list={list}
                                dashboard={false}
                            />
                        ))}
                    </div>
                ) : (
                    <div className="col-span-full text-center py-12 border-2 border-dashed border-black bg-gray-50">
                        <p className="font-bold text-gray-500 uppercase">Aún no sigues ninguna lista.</p>
                        <Link to="/lists" className="mt-4 inline-block text-brand-blue underline font-bold">
                            Explorar listas públicas
                        </Link>
                    </div>
                )}

                {/* Botón cargar más listas seguidas */}
                {data?.has_more_followed && (
                    <div className="mt-6 flex justify-center">
                        <button
                            onClick={() => handleLoadMore('followed')}
                            disabled={loadingMore.followed}
                            className="neo-btn-secondary px-8 py-3 uppercase font-black flex items-center gap-2 cursor-pointer disabled:opacity-60 disabled:cursor-wait"
                        >
                            {loadingMore.followed && (
                                <span className="inline-block w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin"></span>
                            )}
                            Cargar más listas seguidas
                        </button>
                    </div>
                )}
            </section>
        </div>
    );
}

import { useState, useEffect } from 'react';
import apiClient from '../../api/client';
import ListCard from '../../components/cards/ListCard';
import Pagination from '../../components/ui/Pagination';

/**
 * Catálogo de listas públicas — Replica pages.list.index.
 */
export default function ListsIndexPage() {
    const [lists, setLists] = useState([]);
    const [meta, setMeta] = useState(null);
    const [page, setPage] = useState(1);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        setLoading(true);
        apiClient.get('/lists', { params: { page } }).then((res) => {
            setLists(res.data.data);
            setMeta(res.data.meta);
            setLoading(false);
        });
    }, [page]);

    return (
        <div className="max-w-7xl mx-auto px-4 py-8">
            <h1 className="text-3xl font-black uppercase tracking-tight mb-8">Listas</h1>

            {loading ? (
                <div className="flex justify-center py-20"><div className="neo-spinner"></div></div>
            ) : lists.length === 0 ? (
                <div className="neo-card p-12 text-center">
                    <p className="font-bold">No hay listas públicas todavía</p>
                </div>
            ) : (
                <>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                        {lists.map((list) => (
                            <ListCard key={list.id} list={list} />
                        ))}
                    </div>
                    <Pagination meta={meta} onPageChange={(p) => setPage(p)} />
                </>
            )}
        </div>
    );
}

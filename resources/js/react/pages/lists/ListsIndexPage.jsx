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
            {/* Cabecera */}
            <div className="mb-12 border-b-4 border-black pb-4">
                <h1 className="text-4xl md:text-6xl font-black font-display uppercase tracking-tighter">
                    Explora <span className="text-brand-yellow [text-shadow:3px_3px_0px_#000]">Listas</span>
                </h1>
                <p className="text-lg font-bold mt-2 text-gray-600 uppercase tracking-widest">
                    Colecciones seleccionadas por la comunidad
                </p>
            </div>

            {/* Sección: Listas Públicas */}
            <section className="mb-16">
                <div className="flex items-center justify-between mb-6 border-b-2 border-black pb-2">
                    <h2 className="text-2xl font-black uppercase flex items-center gap-2">
                        <span className="w-4 h-4 bg-brand-blue border-2 border-black block"></span>
                        Listas Públicas
                    </h2>
                </div>

                {loading ? (
                    <div className="flex justify-center py-20">
                        <div className="neo-spinner"></div>
                    </div>
                ) : lists.length === 0 ? (
                    <div className="text-center py-10">
                        <h3 className="text-2xl font-black uppercase text-gray-400">
                            No se han encontrado listas públicas.
                        </h3>
                    </div>
                ) : (
                    <>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {lists.map((list) => (
                                <ListCard key={list.id} list={list} />
                            ))}
                        </div>

                        {/* Paginación */}
                        <div className="mt-8">
                            <Pagination meta={meta} onPageChange={(p) => setPage(p)} />
                        </div>
                    </>
                )}
            </section>

            {/* Sección: Mejor Valoradas */}
            <section className="mb-16">
                <div className="flex items-center justify-between mb-6 border-b-2 border-black pb-2">
                    <h2 className="text-2xl font-black uppercase flex items-center gap-2">
                        <span className="w-4 h-4 bg-brand-yellow border-2 border-black block"></span>
                        Mejor Valoradas
                    </h2>
                    <span className="text-sm font-bold uppercase hover:underline hover:text-brand-blue cursor-pointer">
                        Ver todas -&gt;
                    </span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    {[0, 1, 2, 3].map((i) => (
                        <div key={i} className="neo-card p-4 hover:bg-yellow-50/50 transition-colors cursor-pointer group">
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-xs font-bold uppercase bg-black text-white px-2 py-0.5">
                                    Top 1%
                                </span>
                                <div className="flex gap-1">
                                    {[0, 1, 2, 3, 4].map((j) => (
                                        <div key={j} className="w-3 h-3 bg-brand-yellow rounded-full border border-black"></div>
                                    ))}
                                </div>
                            </div>
                            <h3 className="text-lg font-bold uppercase leading-tight group-hover:underline">
                                Lo mejor de 2025
                            </h3>
                            <p className="text-xs text-gray-600 mt-1 uppercase">por Curador{i}</p>
                        </div>
                    ))}
                </div>
            </section>

            {/* Sección: Tendencias */}
            <section className="mb-8">
                <div className="flex items-center justify-between mb-6 border-b-2 border-black pb-2">
                    <h2 className="text-2xl font-black uppercase flex items-center gap-2">
                        <span className="w-4 h-4 bg-black block"></span>
                        Tendencias
                    </h2>
                    <span className="text-sm font-bold uppercase hover:underline hover:text-brand-blue cursor-pointer">
                        Ver todas -&gt;
                    </span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="bg-brand-blue text-white border-2 border-black shadow-[6px_6px_0px_#000] p-8 flex items-center justify-between">
                        <div>
                            <h3 className="text-3xl font-black uppercase mb-2 font-display">TikTok BookTok</h3>
                            <p className="font-bold uppercase opacity-80 mb-6">Éxitos virales del momento</p>
                            <button className="bg-white text-black border-2 border-black font-bold uppercase px-6 py-2 shadow-[4px_4px_0px_#000] hover:translate-y-[-2px] hover:shadow-[6px_6px_0px_#000] transition-all cursor-pointer">
                                Ver Lista
                            </button>
                        </div>
                        <div className="text-6xl font-black opacity-20 rotate-12 font-display select-none">#1</div>
                    </div>
                    <div className="bg-brand-yellow text-black border-2 border-black shadow-[6px_6px_0px_#000] p-8 flex items-center justify-between">
                        <div>
                            <h3 className="text-3xl font-black uppercase mb-2 font-display">Lecturas de Verano</h3>
                            <p className="font-bold uppercase opacity-80 mb-6">Ideales para la playa</p>
                            <button className="bg-white text-black border-2 border-black font-bold uppercase px-6 py-2 shadow-[4px_4px_0px_#000] hover:translate-y-[-2px] hover:shadow-[6px_6px_0px_#000] transition-all cursor-pointer">
                                Ver Lista
                            </button>
                        </div>
                        <div className="text-6xl font-black opacity-20 rotate-12 font-display select-none">#2</div>
                    </div>
                </div>
            </section>
        </div>
    );
}

import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import userService from '../../services/userService';
import bookService from '../../services/bookService';
import { useAuth } from '../../context/AuthContext';
import { formatDate } from '../../utils/formatDate';

/**
 * Dashboard principal — Estadísticas y colecciones del usuario.
 * Replica el diseño y lógica de la vista general pre-migración.
 */
export default function DashboardIndexPage() {
    const { user } = useAuth();
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState({}); // { [isbn]: 'read' | 'pending' }

    const loadDashboardData = useCallback(() => {
        userService.getDashboard()
            .then((resData) => {
                setData(resData);
                setLoading(false);
            })
            .catch((err) => {
                console.error('Error loading dashboard index data:', err);
                setLoading(false);
            });
    }, []);

    useEffect(() => {
        setLoading(true);
        loadDashboardData();
    }, [loadDashboardData]);

    useEffect(() => {
        const handleEventUpdate = () => {
            loadDashboardData();
        };
        window.addEventListener('book-status-updated', handleEventUpdate);
        window.addEventListener('review-saved', handleEventUpdate);
        window.addEventListener('list-updated', handleEventUpdate);
        return () => {
            window.removeEventListener('book-status-updated', handleEventUpdate);
            window.removeEventListener('review-saved', handleEventUpdate);
            window.removeEventListener('list-updated', handleEventUpdate);
        };
    }, [loadDashboardData]);

    const handleStatusChange = async (isbn, status) => {
        setActionLoading((prev) => ({ ...prev, [isbn]: status }));
        try {
            await bookService.updateBookStatus(isbn, status);
            // Recargar datos reactivamente tras la actualización
            loadDashboardData();
            
            // Dispatch event for BookShowPage or other pages
            window.dispatchEvent(new CustomEvent('book-status-updated', {
                detail: { isbn, status }
            }));
        } catch (error) {
            console.error('Error updating book reading status:', error);
        } finally {
            setActionLoading((prev) => {
                const copy = { ...prev };
                delete copy[isbn];
                return copy;
            });
        }
    };

    const resolveCover = (book) => {
        if (!book) return 'https://via.placeholder.com/300x450';
        if (book.cover_image) return book.cover_image;
        if (book.cover_path) {
            return `${window.location.origin}/storage/${book.cover_path.replace(/^\/?(storage\/)?/, '')}`;
        }
        return `https://ui-avatars.com/api/?name=${encodeURIComponent(book.title)}&size=300&background=0E3FA9&color=fff&bold=true`;
    };

    const trimAuthorName = (author) => {
        if (!author) return 'Autor desconocido';
        const name = author.name || author.full_name || '';
        const surname = author.surname || '';
        return `${name} ${surname}`.trim();
    };

    const dateOptions = {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
    };

    if (loading) {
        return (
            <div className="flex justify-center py-20">
                <div className="neo-spinner"></div>
            </div>
        );
    }

    return (
        <div className="flex-grow space-y-8">
            {/* Encabezado */}
            <header className="flex flex-col md:flex-row justify-between items-start md:items-end border-b-4 border-black pb-6 gap-4">
                <div>
                    <h1 className="text-4xl font-black uppercase font-display leading-none">
                        Hola, <span className="text-brand-blue">{user?.name || 'Lector'}</span>
                    </h1>
                    <p className="text-gray-600 font-bold mt-2">Esto es lo que está pasando con tus libros.</p>
                </div>
                <Link to="/books" className="hidden md:inline-block neo-btn-primary text-sm shrink-0">
                    + Registrar nuevo libro
                </Link>
            </header>

            {/* Cuadrícula de estadísticas (5 tarjetas: leídos, leyendo, para leer, listas, reseñas) */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                {/* Libros leídos */}
                <div className="neo-card text-center py-6 bg-brand-yellow/10">
                    <div className="text-4xl font-black">{data?.stats?.read_books ?? 0}</div>
                    <div className="text-xs font-bold uppercase text-gray-600 mt-1">Leídos</div>
                </div>
                {/* Leyendo actualmente */}
                <div className="neo-card text-center py-6 bg-brand-blue/5">
                    <div className="text-4xl font-black">{data?.stats?.reading_books ?? 0}</div>
                    <div className="text-xs font-bold uppercase text-gray-600 mt-1">Leyendo</div>
                </div>
                {/* Quiero leer (pending) */}
                <div className="neo-card text-center py-6 bg-white">
                    <div className="text-4xl font-black">{data?.stats?.pending_books ?? 0}</div>
                    <div className="text-xs font-bold uppercase text-gray-600 mt-1">Para leer</div>
                </div>
                {/* Listas creadas */}
                <div className="neo-card text-center py-6 bg-white">
                    <div className="text-4xl font-black">{data?.stats?.lists ?? 0}</div>
                    <div className="text-xs font-bold uppercase text-gray-600 mt-1">Listas creadas</div>
                </div>
                {/* Reseñas escritas */}
                <div className="neo-card text-center py-6 bg-white">
                    <div className="text-4xl font-black">{data?.stats?.reviews ?? 0}</div>
                    <div className="text-xs font-bold uppercase text-gray-600 mt-1">Reseñas</div>
                </div>
            </div>

            {/* Actividad reciente */}
            <section>
                <h2 className="text-xl font-black uppercase mb-4 flex items-center gap-2">
                    <span className="w-3 h-3 bg-black border border-black"></span>
                    Actividad reciente
                </h2>
                {data?.recent_activity?.length > 0 ? (
                    <div className="space-y-3">
                        {data.recent_activity.map((item) => (
                            <div key={item.id} className="neo-card flex items-center gap-4 py-4 px-6 bg-white">
                                <div className={`w-10 h-10 ${item.status === 'read' ? 'bg-green-100' : 'bg-brand-yellow/20'} rounded-full border-2 border-black flex items-center justify-center shrink-0`}>
                                    <span className="text-xl">{item.status === 'read' ? '📚' : '📖'}</span>
                                </div>
                                <div className="min-w-0">
                                    <p className="text-sm font-bold truncate">
                                        {item.status === 'read' ? 'Terminaste de leer ' : 'Estás leyendo '}
                                        <Link to={`/books/${item.book?.isbn}`} className="text-brand-blue hover:underline">
                                            {item.book?.title}
                                        </Link>
                                    </p>
                                    <p className="text-xs text-gray-500 uppercase mt-0.5">
                                        {item.status === 'read' && item.finished_at ? (
                                            `Terminado el ${formatDate(item.finished_at, 'es-ES', dateOptions)}`
                                        ) : item.started_at ? (
                                            `Desde el ${formatDate(item.started_at, 'es-ES', dateOptions)}`
                                        ) : (
                                            'Recientemente'
                                        )}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="neo-card text-center py-8 bg-white">
                        <p className="font-bold text-gray-400 uppercase">Sin actividad reciente.</p>
                    </div>
                )}
            </section>

            {/* Leyendo actualmente */}
            <section>
                <h2 className="text-xl font-black uppercase mb-4 flex items-center gap-2">
                    <span className="w-3 h-3 bg-brand-yellow border border-black"></span>
                    Leyendo actualmente
                </h2>
                {data?.reading_books?.length > 0 ? (
                    <div className="space-y-4">
                        {data.reading_books.map((entrada) => {
                            const book = entrada.book;
                            const cover = resolveCover(book);
                            const authorName = book?.authors?.length > 0
                                ? trimAuthorName(book.authors[0])
                                : 'Autor desconocido';

                            return (
                                <div key={entrada.id} className="neo-card p-6 flex flex-col sm:flex-row gap-5 items-start bg-white">
                                    {/* Portada */}
                                    <div className="w-20 flex-shrink-0 border-2 border-black shadow-[4px_4px_0px_#000] overflow-hidden self-start">
                                        <img src={cover} alt={book?.title} className="w-full h-auto object-cover" />
                                    </div>

                                    {/* Info + acciones */}
                                    <div className="flex-grow w-full min-w-0">
                                        <h3 className="font-bold text-lg uppercase leading-tight truncate">
                                            <Link to={`/books/${book?.isbn}`} className="hover:text-brand-blue transition-colors">
                                                {book?.title}
                                            </Link>
                                        </h3>
                                        <p className="text-sm text-gray-600 mb-3">por {authorName}</p>

                                        <p className="text-xs font-bold text-gray-500 uppercase mb-4">
                                            Comenzado {entrada.started_at ? formatDate(entrada.started_at, 'es-ES', dateOptions) : 'recientemente'}
                                        </p>

                                        {/* Acciones */}
                                        <div className="flex flex-wrap items-center gap-2 border-t-2 border-black/10 pt-3 w-full">
                                            {/* Botón: Leído */}
                                            <button
                                                onClick={() => handleStatusChange(book.isbn, 'read')}
                                                disabled={!!actionLoading[book.isbn]}
                                                className="neo-btn-primary py-1.5 px-4 text-xs flex items-center gap-1.5 cursor-pointer disabled:opacity-60 disabled:cursor-wait shrink-0"
                                            >
                                                {actionLoading[book.isbn] === 'read' ? (
                                                    <span className="w-3.5 h-3.5 border-2 border-black border-t-transparent rounded-full animate-spin inline-block"></span>
                                                ) : (
                                                    '📚 Leído'
                                                )}
                                            </button>

                                            {/* Botón: Dejar de leer */}
                                            <button
                                                onClick={() => handleStatusChange(book.isbn, 'pending')}
                                                disabled={!!actionLoading[book.isbn]}
                                                className="bg-brand-yellow text-black border-2 border-black font-bold uppercase tracking-wide py-1.5 px-4 text-xs shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:-translate-y-0.5 transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-60 disabled:cursor-wait shrink-0"
                                            >
                                                {actionLoading[book.isbn] === 'pending' ? (
                                                    <span className="w-3.5 h-3.5 border-2 border-black border-t-transparent rounded-full animate-spin inline-block"></span>
                                                ) : (
                                                    '✕ Dejar de leer'
                                                )}
                                            </button>

                                            {/* Enlace: Ver página del libro */}
                                            <Link to={`/books/${book?.isbn}`} className="neo-btn-secondary py-1.5 px-4 text-xs ml-auto shrink-0">
                                                Ver libro →
                                            </Link>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                ) : (
                    <div className="neo-card text-center py-8 bg-white">
                        <p className="font-bold text-gray-400 uppercase mb-2">No estás leyendo nada ahora mismo.</p>
                        <Link to="/books" className="text-brand-blue underline font-bold text-sm">
                            Explorar libros
                        </Link>
                    </div>
                )}
            </section>

            {/* Mi Biblioteca */}
            <section className="space-y-8">
                <h2 className="text-xl font-black uppercase mb-6 flex items-center gap-2">
                    <span className="w-3 h-3 bg-brand-blue border border-black"></span>
                    Mi Biblioteca
                </h2>

                {/* Sub-sección: Para leer */}
                <div>
                    <div className="flex items-center justify-between border-b-2 border-black pb-1 mb-4">
                        <h3 className="text-sm font-black uppercase flex items-center gap-2">
                            📕 Para leer
                        </h3>
                        <span className="text-xs font-bold text-gray-500 uppercase">
                            {data?.stats?.pending_books ?? 0} {data?.stats?.pending_books === 1 ? 'libro' : 'libros'}
                        </span>
                    </div>

                    {data?.pending_collection?.length > 0 ? (
                        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3">
                            {data.pending_collection.map((entrada) => {
                                const book = entrada.book;
                                const cover = resolveCover(book);
                                return (
                                    <Link
                                        key={entrada.id}
                                        to={`/books/${book?.isbn}`}
                                        className="neo-card p-0 block overflow-hidden group hover:-translate-y-1 transition-all bg-white"
                                        title={book?.title}
                                    >
                                        {/* Portada */}
                                        <div className="aspect-[2/3] relative overflow-hidden bg-gray-200">
                                            <img
                                                src={cover}
                                                alt={book?.title}
                                                className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-300"
                                                loading="lazy"
                                            />
                                        </div>
                                        {/* Título */}
                                        <div className="p-1.5 border-t-2 border-black bg-white">
                                            <p className="text-xs font-bold uppercase truncate leading-tight">{book?.title}</p>
                                        </div>
                                    </Link>
                                );
                            })}
                        </div>
                    ) : (
                        <div className="neo-card text-center py-6 bg-white">
                            <p className="font-bold text-gray-400 uppercase text-sm mb-2">Sin libros pendientes.</p>
                            <Link to="/books" className="text-brand-blue underline font-bold text-xs">
                                Explorar libros →
                            </Link>
                        </div>
                    )}
                </div>

                {/* Sub-sección: Leídos */}
                <div>
                    <div className="flex items-center justify-between border-b-2 border-black pb-1 mb-4">
                        <h3 className="text-sm font-black uppercase flex items-center gap-2">
                            📚 Leídos
                        </h3>
                        <span className="text-xs font-bold text-gray-500 uppercase">
                            {data?.stats?.read_books ?? 0} {data?.stats?.read_books === 1 ? 'libro' : 'libros'}
                        </span>
                    </div>

                    {data?.read_collection?.length > 0 ? (
                        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3">
                            {data.read_collection.map((entrada) => {
                                const book = entrada.book;
                                const cover = resolveCover(book);
                                return (
                                    <Link
                                        key={entrada.id}
                                        to={`/books/${book?.isbn}`}
                                        className="neo-card p-0 block overflow-hidden group hover:-translate-y-1 transition-all bg-white"
                                        title={book?.title}
                                    >
                                        {/* Portada */}
                                        <div className="aspect-[2/3] relative overflow-hidden bg-gray-200">
                                            <img
                                                src={cover}
                                                alt={book?.title}
                                                className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-300"
                                                loading="lazy"
                                            />
                                        </div>
                                        {/* Título */}
                                        <div className="p-1.5 border-t-2 border-black bg-white">
                                            <p className="text-xs font-bold uppercase truncate leading-tight">{book?.title}</p>
                                        </div>
                                    </Link>
                                );
                            })}
                        </div>
                    ) : (
                        <div className="neo-card text-center py-6 bg-white">
                            <p className="font-bold text-gray-400 uppercase text-sm">Aún no has terminado ningún libro.</p>
                        </div>
                    )}
                </div>
            </section>
        </div>
    );
}

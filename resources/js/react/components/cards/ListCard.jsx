import { Link } from 'react-router-dom';
import LikeButton from '../ui/LikeButton';

/**
 * Tarjeta de lista de favoritos estilo Neo-Brutalism.
 * Muestra vista previa de portadas, título, creador y likes.
 */
export default function ListCard({ list, dashboard = false, onDelete }) {
    const covers = list.books?.slice(0, 5) || [];
    const avatarUrl = list.user?.avatar_url
        || `https://ui-avatars.com/api/?name=${encodeURIComponent(list.user?.name || 'U')}&size=80&background=0E3FA9&color=fff`;

    // Formateador de fecha
    const formatDate = (dateString) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        return date.toLocaleDateString('es-ES', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
        });
    };

    // Formateador de tiempo relativo simple (hace X tiempo / diffForHumans)
    const getRelativeOrFormattedDate = (dateString) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        const now = new Date();
        const diffMs = now - date;
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMins / 60);
        const diffDays = Math.floor(diffHours / 24);

        if (diffMins < 1) return 'hace un momento';
        if (diffMins < 60) return `hace ${diffMins} ${diffMins === 1 ? 'minuto' : 'minutos'}`;
        if (diffHours < 24) return `hace ${diffHours} ${diffHours === 1 ? 'hora' : 'horas'}`;
        if (diffDays < 7) return `hace ${diffDays} ${diffDays === 1 ? 'día' : 'días'}`;

        return formatDate(dateString);
    };

    // Crear exactamente 5 slots de vista previa
    const previewSlots = Array.from({ length: 5 }, (_, i) => {
        const book = covers[i];
        return {
            hasBook: !!book,
            book: book,
            coverUrl: book ? (book.cover_image || (book.cover_path ? `${window.location.origin}/storage/${book.cover_path}` : null)) : null
        };
    });

    return (
        <div className="neo-card p-0 overflow-hidden group flex flex-col h-full hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:-translate-y-1 transition-all">
            <Link to={`/lists/${list.id}`} className="block">
                <div className="h-32 bg-gray-200 border-b-2 border-black relative">
                    <div className="grid grid-cols-5 h-full">
                        {previewSlots.map((slot, i) => {
                            if (slot.hasBook) {
                                return (
                                    <div key={i} className="bg-gray-300 border-r-2 border-black overflow-hidden relative last:border-r-0 h-full">
                                        {slot.coverUrl ? (
                                            <img
                                                src={slot.coverUrl}
                                                alt={slot.book.title || 'Portada'}
                                                className="w-full h-full object-cover"
                                                onError={(e) => {
                                                    e.target.style.display = 'none';
                                                    const fallback = e.target.nextSibling;
                                                    if (fallback) fallback.style.display = 'flex';
                                                }}
                                            />
                                        ) : null}
                                        <div
                                            className="absolute inset-0 flex items-center justify-center bg-brand-yellow/50 text-[10px] font-bold rotate-90 whitespace-nowrap uppercase"
                                            style={{ display: slot.coverUrl ? 'none' : 'flex' }}
                                        >
                                            LIBRO
                                        </div>
                                    </div>
                                );
                            } else {
                                return (
                                    <div key={i} className="bg-gray-100 border-r-2 border-black flex items-center justify-center last:border-r-0 h-full">
                                        <span className="text-gray-300 text-[10px] uppercase font-bold">Vacío</span>
                                    </div>
                                );
                            }
                        })}
                    </div>
                </div>
            </Link>

            <div className="p-6 flex flex-col flex-grow">
                <div className="flex items-start justify-between mb-1 gap-2">
                    <Link to={`/lists/${list.id}`} className="min-w-0 flex-grow">
                        <h3 className="text-xl font-bold uppercase group-hover:text-brand-blue transition-colors truncate">
                            {list.name}
                        </h3>
                    </Link>
                    <div className="flex items-center gap-3 flex-shrink-0">
                        {dashboard && list.visibility && (
                            <span className="bg-gray-100 text-gray-800 text-[10px] font-bold uppercase px-1.5 py-0.5 border border-black whitespace-nowrap">
                                {list.visibility === 'public' ? 'Pública' : (list.visibility === 'private' ? 'Privada' : 'Amigos')}
                            </span>
                        )}

                        {/* Botón de Me Gusta Genérico */}
                        <div className="relative z-10 scale-90 origin-right">
                            <LikeButton
                                type="list"
                                id={list.id}
                                initialLiked={list.is_liked}
                                initialCount={list.likes_count ?? 0}
                            />
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-2 mb-4">
                    <div className="w-6 h-6 rounded-full bg-gray-300 border border-black overflow-hidden flex-shrink-0">
                        <img
                            src={avatarUrl}
                            alt={`Avatar de ${list.user?.name || 'Usuario'}`}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                                e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(list.user?.name || 'U')}&size=80&background=0E3FA9&color=fff`;
                              }}
                        />
                    </div>
                    <span className="text-xs font-bold uppercase text-gray-600 truncate">
                        por <span className="text-black">{list.user?.name || 'Desconocido'}</span>
                    </span>
                </div>

                <div className="mt-auto flex items-center justify-between text-xs font-bold border-t-2 border-black pt-4">
                    <span>{list.books_count ?? list.books?.length ?? 0} Libros</span>
                    {dashboard ? (
                        <span className="text-gray-500 truncate ml-2">
                            Actualizada {getRelativeOrFormattedDate(list.updated_at)}
                        </span>
                    ) : (
                        <span className="text-gray-500 ml-2 whitespace-nowrap">
                            {formatDate(list.created_at)}
                        </span>
                    )}
                </div>

                {dashboard && onDelete && (
                    <div className="flex gap-2 mt-4 pt-4 border-t-2 border-dashed border-gray-300">
                        <button
                            onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                onDelete(list.id);
                            }}
                            className="w-full bg-red-100 border-2 border-black py-1.5 px-3 text-xs font-bold uppercase hover:bg-red-500 hover:text-white transition-colors"
                        >
                            Eliminar
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}

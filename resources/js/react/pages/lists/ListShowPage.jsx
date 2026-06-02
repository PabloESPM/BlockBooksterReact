import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import apiClient from '../../api/client';
import BookCard from '../../components/cards/BookCard';
import LikeButton from '../../components/ui/LikeButton';
import { useAuth } from '../../context/AuthContext';

/**
 * Detalle de lista — Replica pages.list.show.
 */
export default function ListShowPage() {
    const { id } = useParams();
    const { user: currentUser, isAuthenticated } = useAuth();
    const [list, setList] = useState(null);
    const [loading, setLoading] = useState(true);

    // Estado del modal de edición
    const [showEditModal, setShowEditModal] = useState(false);
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [visibility, setVisibility] = useState('public');
    const [submitting, setSubmitting] = useState(false);
    const [errors, setErrors] = useState({});
    const [successMessage, setSuccessMessage] = useState('');

    const fetchList = () => {
        apiClient.get(`/lists/${id}`).then((res) => {
            setList(res.data.data);
            setName(res.data.data.name || '');
            setDescription(res.data.data.description || '');
            setVisibility(res.data.data.visibility || 'public');
            setLoading(false);
        });
    };

    useEffect(() => {
        setLoading(true);
        fetchList();
    }, [id]);

    const handleShare = () => {
        const shareData = {
            title: list.name,
            url: window.location.href
        };
        if (navigator.share && navigator.canShare && navigator.canShare(shareData)) {
            navigator.share(shareData).catch((err) => console.error(err));
        } else {
            navigator.clipboard.writeText(window.location.href);
            alert("¡Enlace copiado al portapapeles!");
        }
    };

    const handleUpdateList = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        setErrors({});

        try {
            const res = await apiClient.put(`/lists/${id}`, {
                name,
                description,
                visibility
            });
            setList(res.data.data);
            setSuccessMessage(res.data.message || '¡Lista actualizada correctamente!');
            setShowEditModal(false);
            // Ocultar mensaje automáticamente
            setTimeout(() => setSuccessMessage(''), 5000);
        } catch (err) {
            if (err.response?.status === 422) {
                setErrors(err.response.data.errors || {});
            } else {
                console.error(err);
                alert('Ocurrió un error al actualizar la lista.');
            }
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center py-20">
                <div className="neo-spinner"></div>
            </div>
        );
    }

    if (!list) {
        return <div className="text-center py-12 font-bold">Lista no encontrada</div>;
    }

    const avatarUrl = list.user?.avatar_url
        || `https://ui-avatars.com/api/?name=${encodeURIComponent(list.user?.name || 'U')}&size=80&background=0E3FA9&color=fff`;

    const formatDate = (dateString) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        const formatted = date.toLocaleDateString('es-ES', {
            month: 'short',
            year: 'numeric',
        });
        return formatted.charAt(0).toUpperCase() + formatted.slice(1);
    };

    const isOwner = list.is_owner || (isAuthenticated && currentUser && list.user?.id === currentUser.id);

    return (
        <div className="max-w-7xl mx-auto px-4 py-8">
            {/* Mensaje de éxito */}
            {successMessage && (
                <div className="mb-6 p-4 bg-green-100 border-2 border-black text-green-800 font-bold shadow-[4px_4px_0px_#000]">
                    {successMessage}
                </div>
            )}

            {/* Cabecera de la Lista */}
            <div className="mb-12">
                <div className="flex flex-col md:flex-row gap-8 items-start">
                    <div className="flex-grow min-w-0">
                        <div className="flex items-center gap-2 mb-2">
                            <span className="bg-brand-blue text-white text-xs font-bold uppercase px-2 py-1 border border-black shadow-[2px_2px_0px_#000]">
                                Lista
                            </span>
                            {list.visibility === 'private' && (
                                <span className="bg-gray-200 text-gray-600 text-xs font-bold uppercase px-2 py-1 border border-black">
                                    Privada
                                </span>
                            )}
                            {list.visibility === 'friends' && (
                                <span className="bg-gray-100 text-gray-600 text-xs font-bold uppercase px-2 py-1 border border-black">
                                    Amigos
                                </span>
                            )}
                        </div>
                        <h1 className="text-4xl md:text-6xl font-black font-display uppercase tracking-tighter mb-4 break-words">
                            {list.name}
                        </h1>
                        <p className="text-lg font-medium text-gray-700 max-w-2xl mb-6 border-l-4 border-brand-yellow pl-4 break-words">
                            {list.description || 'Sin descripción disponible.'}
                        </p>

                        {/* Datos creador */}
                        <div className="flex items-center gap-4 flex-wrap">
                            <Link
                                to={`/users/${list.user?.id}`}
                                className="flex items-center gap-2 hover:opacity-80 transition-opacity"
                            >
                                <div className="w-8 h-8 rounded-full bg-gray-300 border border-black overflow-hidden flex-shrink-0">
                                    <img
                                        src={avatarUrl}
                                        alt={`Avatar de ${list.user?.name || 'Usuario'}`}
                                        className="w-full h-full object-cover"
                                        onError={(e) => {
                                            e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(list.user?.name || 'U')}&size=80&background=0E3FA9&color=fff`;
                                        }}
                                    />
                                </div>
                                <span className="text-sm font-bold uppercase whitespace-nowrap">
                                    por <span className="underline hover:text-brand-blue">{list.user?.name || 'Desconocido'}</span>
                                </span>
                            </Link>
                            <span className="text-gray-400">|</span>
                            <span className="text-sm font-bold text-gray-600 uppercase whitespace-nowrap">
                                {list.books_count ?? list.books?.length ?? 0} Libros
                            </span>
                            <span className="text-gray-400">|</span>
                            <span className="text-sm font-bold text-gray-600 uppercase whitespace-nowrap">
                                Creada en {formatDate(list.created_at)}
                            </span>
                        </div>
                    </div>

                    {/* Botones de Acción */}
                    <div className="flex-shrink-0 flex gap-2 items-center flex-wrap">
                        {/* Botón de Like */}
                        <div className="scale-100">
                            <LikeButton
                                type="list"
                                id={list.id}
                                initialLiked={list.is_liked}
                                initialCount={list.likes_count ?? 0}
                                disabled={isOwner}
                            />
                        </div>

                        <button
                            onClick={handleShare}
                            className="neo-btn-primary text-sm px-4 py-1 cursor-pointer"
                        >
                            Compartir
                        </button>

                        {isOwner && (
                            <button
                                onClick={() => setShowEditModal(true)}
                                className="neo-btn-secondary text-sm px-4 py-1 cursor-pointer"
                            >
                                Editar Lista
                            </button>
                        )}
                    </div>
                </div>
            </div>

            {/* Cuadrícula de Libros */}
            <section>
                <div className="flex items-center justify-between mb-6 border-b-2 border-black pb-2">
                    <h2 className="text-2xl font-black uppercase flex items-center gap-2">
                        <span className="w-4 h-4 bg-brand-yellow border-2 border-black block"></span>
                        Libros en esta lista
                    </h2>
                </div>

                {list.books?.length > 0 ? (
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                        {list.books.map((book) => (
                            <div key={book.isbn} className="h-full">
                                <BookCard book={book} />
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="py-12 text-center border-2 border-dashed border-gray-400 bg-gray-50">
                        <p className="text-xl font-bold text-gray-500 uppercase">
                            Aún no hay libros en esta lista.
                        </p>
                    </div>
                )}
            </section>

            {/* Modal de Edición */}
            {showEditModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                    <div className="bg-white border-2 border-black shadow-[8px_8px_0px_#000] w-full max-w-md p-6 relative">
                        <button
                            onClick={() => setShowEditModal(false)}
                            className="absolute top-4 right-4 text-2xl font-black hover:text-red-600 cursor-pointer"
                        >
                            &times;
                        </button>

                        <h2 className="text-2xl font-black uppercase mb-6 font-display">Editar Lista</h2>

                        <form onSubmit={handleUpdateList}>
                            <div className="mb-4">
                                <label htmlFor="edit_name" className="block font-bold uppercase text-sm mb-2">
                                    Nombre de la Lista
                                </label>
                                <input
                                    type="text"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    id="edit_name"
                                    required
                                    className="w-full border-2 border-black p-2 focus:outline-none focus:shadow-[4px_4px_0px_#000] transition-shadow"
                                />
                                {errors.name && (
                                    <span className="text-red-600 text-xs font-bold block mt-1">
                                        {errors.name[0]}
                                    </span>
                                )}
                            </div>

                            <div className="mb-4">
                                <label htmlFor="edit_description" className="block font-bold uppercase text-sm mb-2">
                                    Descripción
                                </label>
                                <textarea
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    id="edit_description"
                                    rows={3}
                                    className="w-full border-2 border-black p-2 focus:outline-none focus:shadow-[4px_4px_0px_#000] transition-shadow resize-none"
                                />
                                {errors.description && (
                                    <span className="text-red-600 text-xs font-bold block mt-1">
                                        {errors.description[0]}
                                    </span>
                                )}
                            </div>

                            <div className="mb-6">
                                <label htmlFor="edit_visibility" className="block font-bold uppercase text-sm mb-2">
                                    Visibilidad
                                </label>
                                <select
                                    value={visibility}
                                    onChange={(e) => setVisibility(e.target.value)}
                                    id="edit_visibility"
                                    className="w-full border-2 border-black p-2 bg-white focus:outline-none focus:shadow-[4px_4px_0px_#000] transition-shadow"
                                >
                                    <option value="public">Pública (Visible para todos)</option>
                                    <option value="friends">Solo Amigos</option>
                                    <option value="private">Privada (Solo yo)</option>
                                </select>
                                {errors.visibility && (
                                    <span className="text-red-600 text-xs font-bold block mt-1">
                                        {errors.visibility[0]}
                                    </span>
                                )}
                            </div>

                            <div className="flex gap-4">
                                <button
                                    type="button"
                                    onClick={() => setShowEditModal(false)}
                                    className="flex-1 neo-btn-secondary py-3 uppercase font-black cursor-pointer"
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    disabled={submitting}
                                    className="flex-1 neo-btn-primary py-3 uppercase font-black cursor-pointer flex items-center justify-center disabled:opacity-50"
                                >
                                    {submitting && (
                                        <span className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin inline-block mr-2"></span>
                                    )}
                                    Guardar
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}


import { useState, useEffect } from 'react';
import listService from '../../services/listService';
import { useAuth } from '../../context/AuthContext';

/**
 * Modal para agregar un libro a una lista existente o crear una nueva lista.
 * Se abre mediante el evento de window 'open-add-to-list-modal'.
 */
export default function AddToListModal() {
    const { isAuthenticated } = useAuth();
    const [show, setShow] = useState(false);
    const [bookIsbn, setBookIsbn] = useState('');
    
    // Listas del usuario
    const [userLists, setUserLists] = useState([]);
    const [loadingLists, setLoadingLists] = useState(false);

    // Campos para nueva lista
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [visibility, setVisibility] = useState('public');

    const [submitting, setSubmitting] = useState(false);
    const [errors, setErrors] = useState({});

    // Cargar listas del usuario desde la API
    const fetchUserLists = async () => {
        setLoadingLists(true);
        try {
            const data = await listService.getDashboardLists();
            // La API devuelve { created: [...], followed: [...] }
            setUserLists(data.created || []);
        } catch (err) {
            console.error('Error fetching user lists:', err);
        } finally {
            setLoadingLists(false);
        }
    };

    // Escuchar el evento de apertura del modal
    useEffect(() => {
        const handleOpen = (e) => {
            if (!isAuthenticated) {
                window.location.href = '/login';
                return;
            }
            const isbn = e.detail?.bookId || '';
            setBookIsbn(isbn);
            setName('');
            setDescription('');
            setVisibility('public');
            setErrors({});
            setShow(true);
            
            // Cargar listas siempre que se abra
            fetchUserLists();
        };

        window.addEventListener('open-add-to-list-modal', handleOpen);
        return () => window.removeEventListener('open-add-to-list-modal', handleOpen);
    }, [isAuthenticated]);

    // Cerrar con Escape
    useEffect(() => {
        if (!show) return;

        const handleKeyDown = (e) => {
            if (e.key === 'Escape') {
                closeModal();
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [show]);

    const closeModal = () => {
        setShow(false);
        setBookIsbn('');
        setName('');
        setDescription('');
        setVisibility('public');
        setErrors({});
    };

    const handleBackdropClick = (e) => {
        if (e.target === e.currentTarget) {
            closeModal();
        }
    };

    // Agregar libro a una lista existente
    const handleAddToList = async (listId) => {
        if (!bookIsbn) return;
        setSubmitting(true);

        try {
            await listService.addBookToList(listId, bookIsbn);
            closeModal();
            window.dispatchEvent(new CustomEvent('list-updated', { 
                detail: { isbn: bookIsbn, listId, action: 'attached' } 
            }));
        } catch (err) {
            if (err.response?.status === 409) {
                alert(err.response.data.message || 'El libro ya está en esta lista.');
            } else {
                console.error(err);
                alert('Ocurrió un error al añadir el libro a la lista.');
            }
        } finally {
            setSubmitting(false);
        }
    };

    // Crear lista y (opcionalmente) agregar libro
    const handleCreateList = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        setErrors({});

        if (!name.trim()) {
            setErrors({ name: ['El nombre de la lista es obligatorio.'] });
            setSubmitting(false);
            return;
        }

        try {
            let resData;
            if (bookIsbn) {
                // Crear y agregar el libro inmediatamente
                resData = await listService.createListAndAttach({
                    name,
                    description: description || null,
                    visibility,
                    book_isbn: bookIsbn
                });
            } else {
                // Crear lista vacía
                resData = await listService.createList({
                    name,
                    description: description || null,
                    visibility
                });
            }

            closeModal();
            window.dispatchEvent(new CustomEvent('list-updated', { 
                detail: { isbn: bookIsbn, listId: resData?.data?.id || null, data: resData } 
            }));
        } catch (err) {
            if (err.response?.status === 422) {
                setErrors(err.response.data.errors || {});
            } else {
                console.error(err);
                alert('Ocurrió un error al crear la lista.');
            }
        } finally {
            setSubmitting(false);
        }
    };

    if (!show) return null;

    return (
        <div
            onClick={handleBackdropClick}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 text-left"
        >
            <div className="bg-white border-2 border-black shadow-[8px_8px_0px_#000] w-full max-w-sm p-6 relative max-h-[90vh] overflow-y-auto">
                {/* Botón cerrar */}
                <button
                    onClick={closeModal}
                    className="absolute top-4 right-4 text-2xl font-black hover:text-red-600 z-50 cursor-pointer"
                >
                    &times;
                </button>

                {/* Título dinámico */}
                <h2 className="text-xl font-black uppercase mb-4 font-display">
                    {bookIsbn ? 'Agregar a la Lista' : 'Crear Nueva Lista'}
                </h2>

                {/* Listas Existentes (solo si se está añadiendo un libro) */}
                {bookIsbn && (
                    <div className="mb-6">
                        <h3 className="font-bold text-sm uppercase mb-2 text-gray-500">Tus Listas</h3>
                        {loadingLists ? (
                            <div className="text-center py-4 text-sm font-bold">Cargando listas...</div>
                        ) : userLists.length > 0 ? (
                            <div className="space-y-2 max-h-40 overflow-y-auto border border-black p-2 bg-gray-50">
                                {userLists.map((list) => (
                                    <button
                                        key={list.id}
                                        onClick={() => handleAddToList(list.id)}
                                        disabled={submitting}
                                        className="w-full text-left flex justify-between items-center group hover:bg-white p-1 transition-colors cursor-pointer disabled:opacity-50"
                                    >
                                        <span className="font-bold truncate text-sm">{list.name}</span>
                                        <span className="text-xs bg-black text-white px-2 py-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                                            AGREGAR
                                        </span>
                                    </button>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-2 text-xs text-gray-500 border border-dashed border-gray-400 p-2">
                                No tienes listas creadas aún.
                            </div>
                        )}
                    </div>
                )}

                {/* Crear Nueva Lista */}
                <div className={bookIsbn ? 'border-t-2 border-black pt-4' : ''}>
                    {bookIsbn && (
                        <h3 className="font-bold text-sm uppercase mb-3 text-brand-blue">O Crear Nueva Lista</h3>
                    )}

                    <form onSubmit={handleCreateList}>
                        {/* Nombre de la lista */}
                        <div className="mb-3">
                            {!bookIsbn && (
                                <label htmlFor="list_name" className="block font-bold uppercase text-xs mb-1">
                                    Nombre de la lista
                                </label>
                            )}
                            <input
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                id="list_name"
                                required
                                className="w-full border-2 border-black p-2 text-sm focus:outline-none focus:shadow-[2px_2px_0px_#000] transition-shadow placeholder-gray-500"
                                placeholder="Nombre de la Lista"
                            />
                            {errors.name && (
                                <span className="text-red-600 text-xs font-bold block mt-1">
                                    {errors.name[0]}
                                </span>
                            )}
                        </div>

                        {/* Descripción */}
                        <div className="mb-3">
                            {!bookIsbn && (
                                <label htmlFor="list_description" className="block font-bold uppercase text-xs mb-1">
                                    Descripción
                                </label>
                            )}
                            <textarea
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                id="list_description"
                                rows={2}
                                className="w-full border-2 border-black p-2 text-sm focus:outline-none focus:shadow-[2px_2px_0px_#000] transition-shadow placeholder-gray-500 resize-none"
                                placeholder="Descripción breve..."
                            />
                            {errors.description && (
                                <span className="text-red-600 text-xs font-bold block mt-1">
                                    {errors.description[0]}
                                </span>
                            )}
                        </div>

                        {/* Visibilidad */}
                        <div className="mb-4">
                            {!bookIsbn && (
                                <label htmlFor="list_visibility" className="block font-bold uppercase text-xs mb-1">
                                    Visibilidad
                                </label>
                            )}
                            <select
                                value={visibility}
                                onChange={(e) => setVisibility(e.target.value)}
                                id="list_visibility"
                                className="w-full border-2 border-black p-2 text-sm bg-white focus:outline-none focus:shadow-[2px_2px_0px_#000] transition-shadow"
                            >
                                <option value="public">Pública</option>
                                <option value="followers">Seguidores</option>
                                <option value="friends">Solo Amigos</option>
                                <option value="private">Privada</option>
                            </select>
                            {errors.visibility && (
                                <span className="text-red-600 text-xs font-bold block mt-1">
                                    {errors.visibility[0]}
                                </span>
                            )}
                        </div>

                        {/* Botones de acción */}
                        <div className="flex gap-2">
                            {!bookIsbn && (
                                <button
                                    type="button"
                                    onClick={closeModal}
                                    className="w-1/3 py-2 bg-white border-2 border-black font-bold uppercase text-sm hover:bg-gray-100 transition-colors cursor-pointer"
                                >
                                    Cancelar
                                </button>
                            )}
                            <button
                                type="submit"
                                disabled={submitting}
                                className={`py-2 bg-brand-yellow border-2 border-black font-bold uppercase text-sm shadow-[2px_2px_0px_#000] hover:translate-y-px hover:translate-x-px hover:shadow-none transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 ${
                                    bookIsbn ? 'w-full' : 'w-2/3'
                                }`}
                            >
                                {submitting && (
                                    <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin"></div>
                                )}
                                {bookIsbn ? 'Crear y Agregar' : 'Crear Lista'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}

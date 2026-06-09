import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import bookService from '../../../services/bookService';
import lookupCache from '../../../utils/lookupCache';

/**
 * Formulario de creación/edición de libro.
 * Replica admin.books.edit Livewire SFC con autocompletado de autor.
 */
export default function AdminBookEditPage() {
    const { isbn } = useParams();
    const navigate = useNavigate();
    const isEdit = !!isbn;

    const [form, setForm] = useState({
        isbn: '', title: '', description: '', genre_id: '', language_id: '',
        publisher: '', publication_year: '', number_of_pages: '',
        author_id: null, author_name: '',
    });
    const [coverFile, setCoverFile] = useState(null);
    const [coverPreview, setCoverPreview] = useState(null);
    const [genres, setGenres] = useState([]);
    const [languages, setLanguages] = useState([]);
    const [authorSuggestions, setAuthorSuggestions] = useState([]);
    const [errors, setErrors] = useState({});
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState('');
    const [loading, setLoading] = useState(isEdit);
    const debounceRef = useRef(null);

    // Cargar datos si estamos editando
    useEffect(() => {
        if (isEdit) {
            bookService.adminGetBook(isbn).then((resData) => {
                const f = resData.form;
                setForm({
                    isbn: f.isbn, title: f.title, description: f.description || '',
                    genre_id: f.genre_id || '', language_id: f.language_id || '',
                    publisher: f.publisher || '', publication_year: f.publication_year || '',
                    number_of_pages: f.number_of_pages || '',
                    author_id: f.author_id, author_name: f.author_name || '',
                });
                if (resData.data.cover_image) {
                    setCoverPreview(resData.data.cover_image);
                } else if (f.cover_path) {
                    setCoverPreview(`${window.location.origin}/storage/${f.cover_path}`);
                }
                setGenres(resData.genres);
                setLanguages(resData.languages);
                setLoading(false);
            });
        } else {
            Promise.all([
                lookupCache.getGenres(),
                lookupCache.getLanguages(),
            ]).then(([g, l]) => {
                setGenres(g);
                setLanguages(l);
            });
        }
    }, [isbn, isEdit]);

    const updateField = (field) => (e) => {
        setForm((prev) => ({ ...prev, [field]: e.target.value }));
    };

    // Búsqueda de autor con debounce
    const handleAuthorSearch = (value) => {
        setForm((prev) => ({ ...prev, author_name: value, author_id: null }));
        if (debounceRef.current) clearTimeout(debounceRef.current);
        if (value.length < 2) { setAuthorSuggestions([]); return; }
        debounceRef.current = setTimeout(async () => {
            try {
                const resData = await bookService.adminSearchAuthors(value);
                setAuthorSuggestions(resData.data);
            } catch (err) {
                console.error("Error searching authors:", err);
            }
        }, 300);
    };

    const selectAuthor = (id, label) => {
        setForm((prev) => ({ ...prev, author_id: id, author_name: label }));
        setAuthorSuggestions([]);
    };

    const handleCoverChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setCoverFile(file);
            setCoverPreview(URL.createObjectURL(file));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setErrors({});
        setSaving(true);

        const formData = new FormData();
        Object.entries(form).forEach(([key, value]) => {
            if (value !== null && value !== '') formData.append(key, value);
        });
        if (coverFile) formData.append('cover', coverFile);

        try {
            const resData = await bookService.adminSaveBook(formData);
            setMessage(resData.message);
            setTimeout(() => navigate('/admin/books'), 1000);
        } catch (error) {
            if (error.response?.status === 422) setErrors(error.response.data.errors || {});
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <div className="flex justify-center py-12"><div className="neo-spinner"></div></div>;

    return (
        <div>
            <div className="flex items-center gap-4 mb-8">
                <button onClick={() => navigate('/admin/books')} className="w-10 h-10 border-2 border-black flex items-center justify-center hover:bg-black hover:text-white transition-colors">
                    ←
                </button>
                <h1 className="text-3xl font-black uppercase font-display">{isEdit ? 'Editar Libro' : 'Nuevo Libro'}</h1>
            </div>

            {message && (
                <div className="mb-4 p-4 bg-green-100 border border-green-400 text-green-800 font-bold text-sm shadow-[2px_2px_0px_#000]">
                    {message}
                </div>
            )}

            <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Formulario principal */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="neo-card p-6 space-y-6">
                        <h3 className="font-black text-lg uppercase border-b-2 border-black pb-2">Detalles del Libro</h3>
                        <div>
                            <label className="block text-xs font-bold uppercase mb-2">Título</label>
                            <input type="text" className="neo-input w-full" value={form.title} onChange={updateField('title')} required />
                            {errors.title && <span className="text-red-600 text-xs font-bold">{errors.title[0]}</span>}
                        </div>
                        <div className="grid grid-cols-2 gap-6">
                            {/* Autor con autocompletado */}
                            <div className="relative">
                                <label className="block text-xs font-bold uppercase mb-2">
                                    Autor
                                    {form.author_id && <span className="ml-2 text-green-700 font-normal normal-case">✓ Existente</span>}
                                    {!form.author_id && form.author_name && <span className="ml-2 text-brand-blue font-normal normal-case">→ Nuevo autor</span>}
                                </label>
                                <input type="text" className="neo-input w-full" value={form.author_name} onChange={(e) => handleAuthorSearch(e.target.value)} placeholder="Escribe el nombre del autor..." autoComplete="off" />
                                {authorSuggestions.length > 0 && (
                                    <ul className="absolute z-50 w-full bg-white border-2 border-black shadow-[4px_4px_0px_#000] mt-1 max-h-48 overflow-y-auto">
                                        {authorSuggestions.map((s) => (
                                            <li key={s.id}>
                                                <button type="button" onClick={() => selectAuthor(s.id, s.label)} className="w-full text-left px-4 py-2 text-sm font-bold hover:bg-black hover:text-white transition-colors border-b border-gray-100 last:border-0">
                                                    {s.label}
                                                </button>
                                            </li>
                                        ))}
                                    </ul>
                                )}
                            </div>
                            <div>
                                <label className="block text-xs font-bold uppercase mb-2">Género</label>
                                <select className="neo-input w-full bg-white" value={form.genre_id} onChange={updateField('genre_id')}>
                                    <option value="">Seleccionar Género...</option>
                                    {genres.map((g) => <option key={g.id} value={g.id}>{g.name}</option>)}
                                </select>
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-6">
                            <div>
                                <label className="block text-xs font-bold uppercase mb-2">ISBN</label>
                                <input type="text" className="neo-input w-full" value={form.isbn} onChange={updateField('isbn')} readOnly={isEdit} required={!isEdit} />
                            </div>
                            <div>
                                <label className="block text-xs font-bold uppercase mb-2">Editorial</label>
                                <input type="text" className="neo-input w-full" value={form.publisher} onChange={updateField('publisher')} />
                            </div>
                        </div>
                        <div className="grid grid-cols-3 gap-6">
                            <div>
                                <label className="block text-xs font-bold uppercase mb-2">Año</label>
                                <input type="number" className="neo-input w-full" value={form.publication_year} onChange={updateField('publication_year')} />
                            </div>
                            <div>
                                <label className="block text-xs font-bold uppercase mb-2">Páginas</label>
                                <input type="number" className="neo-input w-full" value={form.number_of_pages} onChange={updateField('number_of_pages')} />
                            </div>
                            <div>
                                <label className="block text-xs font-bold uppercase mb-2">Idioma</label>
                                <select className="neo-input w-full bg-white" value={form.language_id} onChange={updateField('language_id')}>
                                    <option value="">Seleccionar...</option>
                                    {languages.map((l) => <option key={l.id} value={l.id}>{l.name}</option>)}
                                </select>
                            </div>
                        </div>
                        <div>
                            <label className="block text-xs font-bold uppercase mb-2">Descripción</label>
                            <textarea className="neo-input w-full" rows="6" value={form.description} onChange={updateField('description')} />
                        </div>
                    </div>
                </div>

                {/* Sidebar: portada + botón guardar */}
                <div className="space-y-6">
                    <div className="neo-card p-4 bg-gray-100">
                        <h3 className="font-black text-sm uppercase mb-4">Imagen de Portada</h3>
                        <label className="block w-full aspect-[2/3] bg-gray-300 border-2 border-black mb-4 overflow-hidden relative group cursor-pointer">
                            {coverPreview ? (
                                <img
                                    src={coverPreview}
                                    className="w-full h-full object-cover"
                                    alt=""
                                    onError={(e) => {
                                        e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(form.title || 'B')}&size=400&background=0E3FA9&color=fff&bold=true`;
                                    }}
                                />
                            ) : (
                                <div className="w-full h-full flex flex-col items-center justify-center">
                                    <span className="text-gray-500 font-bold uppercase text-xs">Sin Portada</span>
                                </div>
                            )}
                            <div className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                <span className="text-white font-black uppercase text-xs">Cambiar Portada</span>
                            </div>
                            <input type="file" accept="image/*" onChange={handleCoverChange} className="hidden" />
                        </label>
                        <p className="text-xs text-gray-500 text-center">Haz clic en la portada para cargar una imagen</p>
                    </div>
                    <button type="submit" className="w-full neo-btn-primary py-4 text-lg" disabled={saving}>
                        {saving ? 'Guardando...' : 'Guardar Cambios'}
                    </button>
                </div>
            </form>
        </div>
    );
}

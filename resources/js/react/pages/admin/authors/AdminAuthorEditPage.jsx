import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import apiClient from '../../../api/client';

/**
 * Formulario de creación/edición de autor.
 */
export default function AdminAuthorEditPage() {
    const { id } = useParams();
    const navigate = useNavigate();
    const isEdit = !!id;

    const [form, setForm] = useState({
        name: '', surname: '', birth_date: '', biography: '', country_id: '',
    });
    const [photoFile, setPhotoFile] = useState(null);
    const [photoPreview, setPhotoPreview] = useState(null);
    const [countries, setCountries] = useState([]);
    const [errors, setErrors] = useState({});
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState('');
    const [loading, setLoading] = useState(isEdit);

    useEffect(() => {
        if (isEdit) {
            apiClient.get(`/admin/authors/${id}`).then((res) => {
                const a = res.data.data;
                setForm({
                    name: a.name || '', surname: a.surname || '',
                    birth_date: a.birth_date || '', biography: a.biography || '',
                    country_id: a.country?.id || '',
                });
                if (a.photo) setPhotoPreview(a.photo);
                setCountries(res.data.countries);
                setLoading(false);
            });
        } else {
            apiClient.get('/countries/all').then((res) => setCountries(res.data.data));
        }
    }, [id]);

    const updateField = (field) => (e) => setForm((prev) => ({ ...prev, [field]: e.target.value }));

    const handleSubmit = async (e) => {
        e.preventDefault();
        setErrors({}); setSaving(true);

        const formData = new FormData();
        if (isEdit) formData.append('id', id);
        Object.entries(form).forEach(([k, v]) => { if (v) formData.append(k, v); });
        if (photoFile) formData.append('photo', photoFile);

        try {
            const res = await apiClient.post('/admin/authors', formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });
            setMessage(res.data.message);
            setTimeout(() => navigate('/admin/authors'), 1000);
        } catch (error) {
            if (error.response?.status === 422) setErrors(error.response.data.errors || {});
        } finally { setSaving(false); }
    };

    if (loading) return <div className="flex justify-center py-12"><div className="neo-spinner"></div></div>;

    return (
        <div>
            <div className="flex items-center gap-4 mb-8">
                <button onClick={() => navigate('/admin/authors')} className="w-10 h-10 border-2 border-black flex items-center justify-center hover:bg-black hover:text-white transition-colors">←</button>
                <h1 className="text-3xl font-black uppercase font-display">{isEdit ? 'Editar Autor' : 'Nuevo Autor'}</h1>
            </div>

            {message && <div className="mb-4 p-4 bg-green-100 border border-green-400 text-green-800 font-bold text-sm shadow-[2px_2px_0px_#000]">{message}</div>}

            <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 neo-card p-6 space-y-6">
                    <div className="grid grid-cols-2 gap-6">
                        <div>
                            <label className="block text-xs font-bold uppercase mb-2">Nombre</label>
                            <input type="text" className="neo-input w-full" value={form.name} onChange={updateField('name')} required />
                            {errors.name && <span className="text-red-600 text-xs font-bold">{errors.name[0]}</span>}
                        </div>
                        <div>
                            <label className="block text-xs font-bold uppercase mb-2">Apellido</label>
                            <input type="text" className="neo-input w-full" value={form.surname} onChange={updateField('surname')} />
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-6">
                        <div>
                            <label className="block text-xs font-bold uppercase mb-2">Fecha de nacimiento</label>
                            <input type="date" className="neo-input w-full" value={form.birth_date} onChange={updateField('birth_date')} />
                        </div>
                        <div>
                            <label className="block text-xs font-bold uppercase mb-2">País</label>
                            <select className="neo-input w-full bg-white" value={form.country_id} onChange={updateField('country_id')}>
                                <option value="">Seleccionar...</option>
                                {countries.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                            </select>
                        </div>
                    </div>
                    <div>
                        <label className="block text-xs font-bold uppercase mb-2">Biografía</label>
                        <textarea className="neo-input w-full" rows="6" value={form.biography} onChange={updateField('biography')} />
                    </div>
                </div>
                <div className="space-y-6">
                    <div className="neo-card p-4 bg-gray-100">
                        <h3 className="font-black text-sm uppercase mb-4">Foto</h3>
                        <label className="block w-full aspect-square bg-gray-300 border-2 border-black mb-4 overflow-hidden relative group cursor-pointer">
                            {photoPreview ? (
                                <img
                                    src={photoPreview}
                                    className="w-full h-full object-cover"
                                    alt=""
                                    onError={(e) => {
                                        e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(form.name || 'A')}&size=200&background=0E3FA9&color=fff&bold=true`;
                                    }}
                                />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-xs text-gray-500 font-bold">Sin foto</div>
                            )}
                            <div className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"><span className="text-white font-black uppercase text-xs">Cambiar</span></div>
                            <input type="file" accept="image/*" onChange={(e) => { setPhotoFile(e.target.files[0]); setPhotoPreview(URL.createObjectURL(e.target.files[0])); }} className="hidden" />
                        </label>
                    </div>
                    <button type="submit" className="w-full neo-btn-primary py-4 text-lg" disabled={saving}>{saving ? 'Guardando...' : 'Guardar'}</button>
                </div>
            </form>
        </div>
    );
}

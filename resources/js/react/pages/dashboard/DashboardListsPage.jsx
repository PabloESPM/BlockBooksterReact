import { useState, useEffect } from 'react';
import apiClient from '../../api/client';
import ListCard from '../../components/cards/ListCard';

/**
 * Mis Listas — Replica pages.dashboard.lists.
 */
export default function DashboardListsPage() {
    const [lists, setLists] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [form, setForm] = useState({ name: '', description: '', visibility: 'public' });
    const [errors, setErrors] = useState({});
    const [saving, setSaving] = useState(false);

    const loadLists = () => {
        apiClient.get('/dashboard/lists').then((res) => {
            setLists(res.data.data);
            setLoading(false);
        });
    };

    useEffect(() => { loadLists(); }, []);

    const handleCreate = async (e) => {
        e.preventDefault();
        setErrors({});
        setSaving(true);
        try {
            await apiClient.post('/lists', form);
            setForm({ name: '', description: '', visibility: 'public' });
            setShowForm(false);
            loadLists();
        } catch (error) {
            if (error.response?.status === 422) setErrors(error.response.data.errors || {});
        } finally { setSaving(false); }
    };

    const handleDelete = async (listId) => {
        if (!confirm('¿Seguro que quieres eliminar esta lista?')) return;
        await apiClient.delete(`/lists/${listId}`);
        loadLists();
    };

    if (loading) return <div className="flex justify-center py-12"><div className="neo-spinner"></div></div>;

    return (
        <div>
            <div className="flex items-center justify-between mb-6">
                <h1 className="text-2xl font-black uppercase tracking-tight">Mis Listas</h1>
                <button onClick={() => setShowForm(!showForm)} className="neo-btn-primary text-xs">
                    {showForm ? 'Cancelar' : '+ Nueva lista'}
                </button>
            </div>

            {/* Formulario de nueva lista */}
            {showForm && (
                <form onSubmit={handleCreate} className="neo-card p-4 mb-6 space-y-3">
                    <input type="text" className="neo-input" placeholder="Nombre de la lista" value={form.name} onChange={(e) => setForm(f => ({ ...f, name: e.target.value }))} required />
                    {errors.name && <span className="text-red-600 text-xs font-bold">{errors.name[0]}</span>}
                    <textarea className="neo-input" rows="2" placeholder="Descripción (opcional)" value={form.description} onChange={(e) => setForm(f => ({ ...f, description: e.target.value }))} />
                    <select className="neo-input bg-white" value={form.visibility} onChange={(e) => setForm(f => ({ ...f, visibility: e.target.value }))}>
                        <option value="public">Pública</option>
                        <option value="followers">Solo seguidores</option>
                        <option value="friends">Solo amigos</option>
                    </select>
                    <button type="submit" className="neo-btn-primary text-xs" disabled={saving}>
                        {saving ? 'Creando...' : 'Crear lista'}
                    </button>
                </form>
            )}

            {lists.length === 0 ? (
                <div className="neo-card p-8 text-center">
                    <p className="font-bold mb-2">No tienes listas</p>
                    <p className="text-sm text-gray-500">¡Crea una para organizar tus lecturas!</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {lists.map((list) => (
                        <ListCard 
                            key={list.id} 
                            list={list} 
                            dashboard={true} 
                            onDelete={handleDelete} 
                        />
                    ))}
                </div>
            )}
        </div>
    );
}

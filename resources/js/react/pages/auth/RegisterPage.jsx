import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import apiClient from '../../api/client';

export default function RegisterPage() {
    const { register } = useAuth();
    const navigate = useNavigate();

    const [form, setForm] = useState({
        name: '',
        email: '',
        email_confirmation: '',
        password: '',
        date_of_birth: '',
        gender: '',
        country_id: '',
        telephone: '',
    });
    const [countries, setCountries] = useState([]);
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        apiClient.get('/auth/countries').then((res) => {
            setCountries(res.data.data);
        });
    }, []);

    const updateField = (field) => (e) => {
        setForm((prev) => ({ ...prev, [field]: e.target.value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setErrors({});
        setLoading(true);

        try {
            await register(form);
            navigate('/');
        } catch (error) {
            if (error.response?.status === 422) {
                setErrors(error.response.data.errors || {});
            } else {
                setErrors({ email: ['Ha ocurrido un error. Inténtalo de nuevo.'] });
            }
        } finally {
            setLoading(false);
        }
    };

    const renderError = (field) =>
        errors[field] ? (
            <span className="text-red-600 text-xs font-bold mt-1 block">{errors[field][0]}</span>
        ) : null;

    return (
        <div>
            <div className="mb-6 text-center">
                <h1 className="text-2xl font-black uppercase mb-2">Únete a BlockBookster</h1>
                <p className="text-xs font-bold uppercase tracking-widest text-gray-500">
                    Crea tu cuenta
                </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
                {/* Nombre */}
                <div>
                    <label htmlFor="name" className="block text-xs font-bold uppercase mb-2">
                        Nombre Completo
                    </label>
                    <input
                        id="name"
                        type="text"
                        className="neo-input"
                        placeholder="Jane Doe"
                        value={form.name}
                        onChange={updateField('name')}
                        required
                        autoFocus
                    />
                    {renderError('name')}
                </div>

                {/* Email + Confirmación */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label htmlFor="email" className="block text-xs font-bold uppercase mb-2">
                            Correo Electrónico
                        </label>
                        <input
                            id="email"
                            type="email"
                            className="neo-input"
                            placeholder="jane@ejemplo.com"
                            value={form.email}
                            onChange={updateField('email')}
                            required
                        />
                        {renderError('email')}
                    </div>
                    <div>
                        <label htmlFor="email_confirmation" className="block text-xs font-bold uppercase mb-2">
                            Repetir Correo
                        </label>
                        <input
                            id="email_confirmation"
                            type="email"
                            className="neo-input"
                            placeholder="jane@ejemplo.com"
                            value={form.email_confirmation}
                            onChange={updateField('email_confirmation')}
                            required
                        />
                    </div>
                </div>

                {/* Contraseña */}
                <div>
                    <label htmlFor="password" className="block text-xs font-bold uppercase mb-2">
                        Contraseña
                    </label>
                    <input
                        id="password"
                        type="password"
                        className="neo-input"
                        placeholder="••••••••"
                        value={form.password}
                        onChange={updateField('password')}
                        required
                    />
                    {renderError('password')}
                </div>

                {/* Fecha de nacimiento + Género */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label htmlFor="date_of_birth" className="block text-xs font-bold uppercase mb-2">
                            Fecha de Nacimiento
                        </label>
                        <input
                            id="date_of_birth"
                            type="date"
                            className="neo-input"
                            value={form.date_of_birth}
                            onChange={updateField('date_of_birth')}
                            required
                        />
                        {renderError('date_of_birth')}
                    </div>
                    <div>
                        <label htmlFor="gender" className="block text-xs font-bold uppercase mb-2">
                            Género
                        </label>
                        <select
                            id="gender"
                            className="neo-input bg-white appearance-none"
                            value={form.gender}
                            onChange={updateField('gender')}
                            required
                        >
                            <option value="" disabled>Selecciona Género</option>
                            <option value="Male">Masculino</option>
                            <option value="Female">Femenino</option>
                            <option value="Other">Otro</option>
                        </select>
                        {renderError('gender')}
                    </div>
                </div>

                {/* País + Teléfono */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="md:col-span-2">
                        <label htmlFor="country_id" className="block text-xs font-bold uppercase mb-2">
                            País
                        </label>
                        <select
                            id="country_id"
                            className="neo-input bg-white appearance-none"
                            value={form.country_id}
                            onChange={updateField('country_id')}
                            required
                        >
                            <option value="" disabled>Selecciona País</option>
                            {countries.map((country) => (
                                <option key={country.id} value={country.id}>
                                    {country.name} (+{country.phone_code})
                                </option>
                            ))}
                        </select>
                        {renderError('country_id')}
                    </div>
                    <div>
                        <label htmlFor="telephone" className="block text-xs font-bold uppercase mb-2">
                            Teléfono
                        </label>
                        <input
                            id="telephone"
                            type="tel"
                            className="neo-input"
                            placeholder="123456789"
                            value={form.telephone}
                            onChange={updateField('telephone')}
                            required
                        />
                        {renderError('telephone')}
                    </div>
                </div>

                <button type="submit" className="w-full neo-btn-primary mt-6" disabled={loading}>
                    {loading ? 'Creando cuenta...' : 'Registrarse'}
                </button>
            </form>

            {/* Footer */}
            <div className="mt-8 pt-4 border-t-2 border-black text-center text-sm font-bold">
                <span className="text-gray-600">¿Ya tienes una cuenta?</span>
                <Link
                    to="/login"
                    className="ml-1 text-black font-black uppercase hover:text-brand-blue hover:underline"
                >
                    Iniciar Sesión
                </Link>
            </div>
        </div>
    );
}

import { useState, useEffect } from 'react';
import apiClient from '../../api/client';

/**
 * Plantilla genérica para páginas estáticas.
 * Recibe título y contenido como children.
 */
export function StaticPage({ title, children }) {
    return (
        <div className="max-w-4xl mx-auto px-4 py-12">
            <h1 className="text-3xl font-black uppercase tracking-tight mb-8 border-b-4 border-black pb-3">{title}</h1>
            <div className="prose prose-sm max-w-none text-gray-700 leading-relaxed space-y-4">
                {children}
            </div>
        </div>
    );
}

export function AboutPage() {
    const [stats, setStats] = useState({
        total_books: '...',
        total_users: '...',
        total_reviews: '...',
        total_ads: 0
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        apiClient.get('/stats')
            .then(res => {
                setStats(res.data);
                setLoading(false);
            })
            .catch(err => {
                console.error("Error al cargar estadísticas:", err);
                // Valores de fallback por si falla la API
                setStats({
                    total_books: '24k+',
                    total_users: '12k+',
                    total_reviews: '85k+',
                    total_ads: 0
                });
                setLoading(false);
            });
    }, []);

    // Formateador para números grandes (ej. 24000 -> 24k+)
    const formatNumber = (num, fallback) => {
        if (typeof num === 'string') return num;
        if (num === null || num === undefined) return fallback;
        if (num >= 1000) {
            return (num / 1000).toFixed(0) + 'k+';
        }
        return num;
    };

    return (
        <StaticPage title="Sobre Nosotros">
            {/* Sección Misión */}
            <section className="text-center mb-16 mt-4">
                <h2 className="text-4xl md:text-6xl font-black uppercase font-display mb-8 text-black leading-tight">
                    Amamos los <br /><span className="bg-black text-white px-2 inline-block transform -rotate-1">Datos</span> y los Libros.
                </h2>
                <p className="max-w-2xl mx-auto text-lg md:text-xl font-bold text-gray-700 leading-relaxed">
                    BlockBookster nació de la frustración con sitios de seguimiento de libros saturados y llenos de anuncios.
                    Creemos en la simplicidad radical, los datos puros y una comunidad que se preocupa más por la historia que por el estatus.
                </p>
            </section>

            {/* Sección Estadísticas */}
            <section className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-16">
                <div className="text-center border-r-2 border-black last:border-0 py-2">
                    <div className="text-4xl md:text-5xl font-black text-brand-blue [text-shadow:2px_2px_0px_#000]">
                        {loading ? '...' : formatNumber(stats.total_books, '24k+')}
                    </div>
                    <div className="text-xs font-bold uppercase mt-2 text-black">Libros registrados</div>
                </div>
                <div className="text-center border-r-2 border-black last:border-0 py-2">
                    <div className="text-4xl md:text-5xl font-black text-brand-yellow [text-shadow:2px_2px_0px_#000]">
                        {loading ? '...' : formatNumber(stats.total_users, '12k+')}
                    </div>
                    <div className="text-xs font-bold uppercase mt-2 text-black">Usuarios activos</div>
                </div>
                <div className="text-center border-r-2 border-black last:border-0 py-2">
                    <div className="text-4xl md:text-5xl font-black text-black [text-shadow:2px_2px_0px_#ccc]">
                        {loading ? '...' : formatNumber(stats.total_reviews, '85k+')}
                    </div>
                    <div className="text-xs font-bold uppercase mt-2 text-black">Reseñas</div>
                </div>
                <div className="text-center py-2">
                    <div className="text-4xl md:text-5xl font-black text-gray-400">
                        {loading ? '0' : stats.total_ads}
                    </div>
                    <div className="text-xs font-bold uppercase mt-2 text-gray-500">Anuncios mostrados</div>
                </div>
            </section>

            {/* Sección Equipo */}
            <section className="text-center">
                <div className="inline-block mx-auto mb-10">
                    <h2 className="text-3xl font-black uppercase font-display border-b-4 border-black pb-2 px-1 text-black">
                        El Equipo
                    </h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-left">
                    {/* Miembro 1 */}
                    <div className="neo-card p-6 text-center group hover:-translate-y-2 transition-all duration-300 bg-white border-2 border-black shadow-[4px_4px_0px_#000]">
                        <div className="w-32 h-32 mx-auto bg-gray-200 rounded-full border-4 border-black mb-4 overflow-hidden shadow-[2px_2px_0px_#000]">
                            <img src="https://ui-avatars.com/api/?name=Alex+Founder&background=random"
                                 className="w-full h-full object-cover" alt="Alex Founder" />
                        </div>
                        <h3 className="font-black uppercase text-xl text-black">Alex Founder</h3>
                        <p className="text-sm font-bold text-brand-blue uppercase mb-2">CEO y Desarrollador Principal</p>
                        <p className="text-sm text-gray-600 font-medium italic">
                            "Solo quería un lugar donde listar mi colección de ciencia ficción sin ruido."
                        </p>
                    </div>

                    {/* Miembro 2 */}
                    <div className="neo-card p-6 text-center group hover:-translate-y-2 transition-all duration-300 bg-white border-2 border-black shadow-[4px_4px_0px_#000]">
                        <div className="w-32 h-32 mx-auto bg-gray-200 rounded-full border-4 border-black mb-4 overflow-hidden shadow-[2px_2px_0px_#000]">
                            <img src="https://ui-avatars.com/api/?name=Sarah+Design&background=random"
                                 className="w-full h-full object-cover" alt="Sarah Design" />
                        </div>
                        <h3 className="font-black uppercase text-xl text-black">Sarah Design</h3>
                        <p className="text-sm font-bold text-brand-yellow uppercase mb-2 [text-shadow:1px_1px_0px_#000]">
                            Directora de Producto
                        </p>
                        <p className="text-sm text-gray-600 font-medium italic">
                            "El brutalismo no es solo una estética, es una filosofía de honestidad."
                        </p>
                    </div>

                    {/* Miembro 3 */}
                    <div className="neo-card p-6 text-center group hover:-translate-y-2 transition-all duration-300 bg-white border-2 border-black shadow-[4px_4px_0px_#000]">
                        <div className="w-32 h-32 mx-auto bg-gray-200 rounded-full border-4 border-black mb-4 overflow-hidden shadow-[2px_2px_0px_#000]">
                            <img src="https://ui-avatars.com/api/?name=Mike+Ops&background=random"
                                 className="w-full h-full object-cover" alt="Mike Ops" />
                        </div>
                        <h3 className="font-black uppercase text-xl text-black">Mike Ops</h3>
                        <p className="text-sm font-bold text-gray-500 uppercase mb-2">Responsable de Comunidad</p>
                        <p className="text-sm text-gray-600 font-medium italic">
                            "Manteniendo a los trolls bajo el puente y las conversaciones en un tono civilizado."
                        </p>
                    </div>
                </div>
            </section>
        </StaticPage>
    );
}

export function ContactPage() {
    const [form, setForm] = useState({
        name: '',
        email: '',
        subject: 'Consulta general',
        message: ''
    });
    const [submitting, setSubmitting] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const [errors, setErrors] = useState({});

    const handleChange = (field) => (e) => {
        setForm(prev => ({ ...prev, [field]: e.target.value }));
        if (errors[field]) {
            setErrors(prev => ({ ...prev, [field]: null }));
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        
        // Validación básica en el cliente
        const newErrors = {};
        if (!form.name.trim()) newErrors.name = 'El nombre es obligatorio.';
        if (!form.email.trim()) {
            newErrors.email = 'El correo electrónico es obligatorio.';
        } else if (!/\S+@\S+\.\S+/.test(form.email)) {
            newErrors.email = 'El correo electrónico no es válido.';
        }
        if (!form.message.trim()) newErrors.message = 'El mensaje es obligatorio.';

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }

        setSubmitting(true);

        // Simulación de envío del formulario
        setTimeout(() => {
            setSubmitting(false);
            setSubmitted(true);
            setForm({
                name: '',
                email: '',
                subject: 'Consulta general',
                message: ''
            });
        }, 1200);
    };

    return (
        <StaticPage title="Contacto">
            <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-12 mt-4">
                <div>
                    <h2 className="text-4xl md:text-5xl font-black uppercase font-display mb-6 text-black leading-none">
                        Ponte en <span className="text-brand-blue [text-shadow:2px_2px_0px_#000]">Contacto</span>
                    </h2>
                    <p className="text-xl mb-8 font-bold text-gray-700">
                        ¿Tienes alguna pregunta? ¿Has encontrado un error? ¿Solo quieres saludar?
                        Nos encantaría saber de ti.
                    </p>

                    <div className="space-y-6">
                        <div className="flex items-center gap-4">
                            <div
                                className="w-12 h-12 bg-black text-white flex items-center justify-center font-black rounded-full text-xl shadow-[4px_4px_0px_#888] shrink-0">
                                @</div>
                            <div>
                                <h3 className="font-black uppercase text-sm text-black">Envíanos un correo</h3>
                                <p className="font-mono text-sm text-gray-600">hello@blockbookster.com</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-4">
                            <div
                                className="w-12 h-12 bg-brand-yellow text-black flex items-center justify-center font-black rounded-full text-xl border-2 border-black shadow-[4px_4px_0px_#000] shrink-0">
                                X</div>
                            <div>
                                <h3 className="font-black uppercase text-sm text-black">Síguenos</h3>
                                <p className="font-mono text-sm text-gray-600">@BlockBookster</p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="neo-card bg-white p-8 border-2 border-black shadow-[4px_4px_0px_#000]">
                    <h2 className="font-black text-2xl uppercase mb-6 text-black">Enviar un mensaje</h2>
                    
                    {submitted && (
                        <div className="mb-6 p-4 bg-green-100 border-2 border-green-600 text-green-900 font-bold text-sm shadow-[2px_2px_0px_#000] animate-bounce">
                            ¡Mensaje enviado con éxito! Nos pondremos en contacto contigo lo antes posible.
                            <button 
                                onClick={() => setSubmitted(false)}
                                className="block mt-2 text-xs underline uppercase cursor-pointer hover:text-black font-black"
                            >
                                Enviar otro mensaje
                            </button>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-xs font-bold uppercase mb-2 text-black">Nombre</label>
                            <input 
                                type="text" 
                                className={`neo-input w-full ${errors.name ? 'border-red-600 bg-red-50' : ''}`}
                                placeholder="Tu nombre"
                                value={form.name}
                                onChange={handleChange('name')}
                                disabled={submitting}
                            />
                            {errors.name && <p className="text-red-600 text-xs font-bold mt-1">{errors.name}</p>}
                        </div>
                        <div>
                            <label className="block text-xs font-bold uppercase mb-2 text-black">Correo electrónico</label>
                            <input 
                                type="email" 
                                className={`neo-input w-full ${errors.email ? 'border-red-600 bg-red-50' : ''}`}
                                placeholder="tu@ejemplo.com"
                                value={form.email}
                                onChange={handleChange('email')}
                                disabled={submitting}
                            />
                            {errors.email && <p className="text-red-600 text-xs font-bold mt-1">{errors.email}</p>}
                        </div>
                        <div>
                            <label className="block text-xs font-bold uppercase mb-2 text-black">Asunto</label>
                            <select 
                                className="neo-input w-full bg-white cursor-pointer"
                                value={form.subject}
                                onChange={handleChange('subject')}
                                disabled={submitting}
                            >
                                <option value="Consulta general">Consulta general</option>
                                <option value="Reporte de error">Reporte de error</option>
                                <option value="Sugerencia de funcionalidad">Sugerencia de funcionalidad</option>
                                <option value="Solicitud de incorporación de libro">Solicitud de incorporación de libro</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-xs font-bold uppercase mb-2 text-black">Mensaje</label>
                            <textarea 
                                rows="5" 
                                className={`neo-input w-full ${errors.message ? 'border-red-600 bg-red-50' : ''}`}
                                placeholder="¿Cómo podemos ayudarte?"
                                value={form.message}
                                onChange={handleChange('message')}
                                disabled={submitting}
                            ></textarea>
                            {errors.message && <p className="text-red-600 text-xs font-bold mt-1">{errors.message}</p>}
                        </div>
                        <button 
                            type="submit" 
                            className="neo-btn-primary w-full py-3 cursor-pointer flex items-center justify-center gap-2"
                            disabled={submitting}
                        >
                            {submitting ? (
                                <>
                                    <div className="w-5 h-5 border-t-2 border-white rounded-full animate-spin"></div>
                                    Enviando...
                                </>
                            ) : 'Enviar mensaje'}
                        </button>
                    </form>
                </div>
            </div>
        </StaticPage>
    );
}

export function FaqPage() {
    const [active, setActive] = useState(null);

    // Lista de preguntas y respuestas adaptadas a la normativa vigente en España y la UE (RGPD/LOPDGDD)
    // y a las características reales de la plataforma BlockBookster.
    const faqs = [
        {
            q: '¿Es BlockBookster gratuito?',
            a: '¡Sí! BlockBookster es completamente gratuito para todos los usuarios. Puedes llevar el seguimiento de tus lecturas, crear listas y reseñar libros sin pagar nada. Además, conforme a nuestro compromiso con tu privacidad y el RGPD, no vendemos ni comercializamos con tus datos personales a terceros. Es posible que introduzcamos funcionalidades premium en el futuro, pero la experiencia principal siempre será gratuita.'
        },
        {
            q: '¿Cómo puedo añadir un libro que no aparece?',
            a: 'Actualmente, solo los administradores pueden añadir nuevos libros a la base de datos para garantizar la veracidad y calidad de la información mostrada. Si quieres registrar un libro que no figura en nuestra biblioteca, puedes solicitar su incorporación de manera sencilla a través de nuestra página de Contacto seleccionando el asunto "Solicitud de incorporación de libro". Nuestro equipo lo revisará y añadirá en un plazo de 24 a 48 horas.'
        },
        {
            q: '¿Puedo exportar mis datos?',
            a: '¡Sí! De acuerdo con el derecho a la portabilidad que te asiste bajo el Reglamento General de Protección de Datos (RGPD - Reglamento UE 2016/679), tienes control sobre tu información. Actualmente estamos trabajando en una función de descarga automática en formato CSV que estará disponible próximamente en la Configuración de tu cuenta. Hasta entonces, puedes ejercer este derecho solicitando un volcado completo de tu historial literario, listas y reseñas a través de nuestra página de Contacto o escribiendo a privacy@blockbookster.com, y te lo facilitaremos en un plazo máximo de 30 días.'
        },
        {
            q: '¿Cómo se calcula la puntuación de «Popularidad»?',
            a: 'En cumplimiento con las directivas de la Unión Europea sobre transparencia y protección de consumidores en plataformas digitales, te informamos de que la popularidad se calcula mediante un algoritmo objetivo libre de patrocinios comerciales. Esta métrica pondera de manera transparente: el número de usuarios que están leyendo el libro actualmente (60%), las reseñas y valoraciones de estrellas recibidas durante los últimos 30 días (30%), y las incorporaciones del libro a listas de lectura públicas (10%).'
        },
        {
            q: '¿Cómo puedo eliminar mis datos de BlockBookster?',
            a: 'De acuerdo con el derecho de supresión (derecho al olvido) garantizado por el RGPD y la LOPDGDD, puedes eliminar de forma permanente y definitiva tu cuenta y todos tus datos asociados en cualquier momento. Para ello, accede a Dashboard → Configuración de Cuenta, introduce tu contraseña actual en la sección de confirmación de seguridad de la "Zona de Peligro" y haz clic en el botón de eliminación. Este proceso es inmediato, irreversible y borrará por completo tu perfil, historial de lecturas, valoraciones y listas de nuestras bases de datos.'
        }
    ];

    return (
        <StaticPage title="Preguntas Frecuentes">
            <div className="space-y-4 mt-6">
                {faqs.map((faq, index) => {
                    const isOpen = active === index;
                    return (
                        <div
                            key={index}
                            className="border-2 border-black bg-white shadow-[4px_4px_0px_#000] transition-all duration-200"
                        >
                            <button
                                onClick={() => setActive(isOpen ? null : index)}
                                className="w-full text-left p-6 font-black uppercase flex justify-between items-center hover:bg-gray-50 transition-colors cursor-pointer focus:outline-none"
                                aria-expanded={isOpen}
                            >
                                <span className="text-black text-sm md:text-base pr-4">{faq.q}</span>
                                <span className="text-xl font-mono shrink-0 select-none">
                                    {isOpen ? '-' : '+'}
                                </span>
                            </button>
                            {isOpen && (
                                <div className="p-6 pt-0 text-sm leading-relaxed border-t-2 border-black/10 text-gray-700 font-medium whitespace-pre-line animate-fadeIn">
                                    {faq.a}
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        </StaticPage>
    );
}


export function PrivacyPage() {
    return (
        <StaticPage title="Política de Privacidad">
            <div className="max-w-4xl mx-auto space-y-8 mt-4">
                <div className="neo-card p-6 bg-brand-yellow/10 border-2 border-black shadow-[4px_4px_0px_#000] text-black">
                    <p className="font-black text-sm uppercase">Última actualización: 8 de junio de 2026</p>
                    <p className="text-sm mt-2 font-bold text-gray-700">
                        De conformidad con el Reglamento General de Protección de Datos (RGPD - Reglamento UE 2016/679) y la Ley Orgánica 3/2018 de Protección de Datos Personales y Garantía de los Derechos Digitales (LOPDGDD).
                    </p>
                </div>

                <div className="neo-card p-6 bg-white border-2 border-black shadow-[4px_4px_0px_#000] text-black space-y-4">
                    <h2 className="text-xl font-black uppercase border-b-2 border-black pb-2 text-brand-blue">1. Responsable del Tratamiento</h2>
                    <p className="text-sm text-gray-700 font-medium">
                        El responsable del tratamiento de los datos personales recopilados a través de esta plataforma es:
                    </p>
                    <ul className="list-disc pl-5 text-sm text-gray-700 font-bold space-y-1">
                        <li>Denominación Social: BlockBookster</li>
                        <li>Dirección: Madrid, España</li>
                        <li>Contacto de Privacidad: <span className="font-mono text-brand-blue">privacy@blockbookster.com</span></li>
                    </ul>
                </div>

                <div className="neo-card p-6 bg-white border-2 border-black shadow-[4px_4px_0px_#000] text-black space-y-4">
                    <h2 className="text-xl font-black uppercase border-b-2 border-black pb-2 text-brand-blue">2. Datos que recopilamos</h2>
                    <p className="text-sm text-gray-700 font-medium">
                        Para poder ofrecerte nuestro servicio de seguimiento de lecturas y comunidad literaria, recopilamos los siguientes datos personales:
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="border border-black p-3 bg-gray-50">
                            <strong className="text-sm uppercase block text-brand-blue">Datos de Cuenta e Identidad</strong>
                            <p className="text-xs text-gray-600 mt-1 font-bold">Nombre completo, nombre de usuario (username), fecha de nacimiento, género, país de residencia y teléfono.</p>
                        </div>
                        <div className="border border-black p-3 bg-gray-50">
                            <strong className="text-sm uppercase block text-brand-blue">Datos de Contacto</strong>
                            <p className="text-xs text-gray-600 mt-1 font-bold">Dirección de correo electrónico.</p>
                        </div>
                        <div className="border border-black p-3 bg-gray-50">
                            <strong className="text-sm uppercase block text-brand-blue">Datos de Actividad y Perfil</strong>
                            <p className="text-xs text-gray-600 mt-1 font-bold">Reseñas creadas, valoraciones por estrellas (ratings), listas de libros favoritas (públicas y privadas), historial de lectura (libros leídos, leyendo o pendientes) y relaciones sociales (seguidores, seguidos y autores seguidos).</p>
                        </div>
                        <div className="border border-black p-3 bg-gray-50">
                            <strong className="text-sm uppercase block text-brand-blue">Datos Técnicos</strong>
                            <p className="text-xs text-gray-600 mt-1 font-bold">Dirección IP, tipo de navegador y versión, ajustes de zona horaria y datos de sesión.</p>
                        </div>
                    </div>
                </div>

                <div className="neo-card p-6 bg-white border-2 border-black shadow-[4px_4px_0px_#000] text-black space-y-4">
                    <h2 className="text-xl font-black uppercase border-b-2 border-black pb-2 text-brand-blue">3. Finalidad y Bases de Legitimación</h2>
                    <p className="text-sm text-gray-700 font-medium">
                        Tratamos tus datos de acuerdo con las siguientes finalidades y bases legales:
                    </p>
                    <ul className="list-disc pl-5 text-sm text-gray-700 space-y-2 font-medium">
                        <li>
                            <strong className="text-black uppercase text-xs block">Ejecución del Contrato / Términos de Servicio:</strong>
                            Para crear tu cuenta de usuario, gestionar tus listas, valoraciones literarias, perfiles de autores y permitir tu participación en el espacio social de la plataforma.
                        </li>
                        <li>
                            <strong className="text-black uppercase text-xs block">Consentimiento del Interesado:</strong>
                            Para actualizar de forma opcional tu avatar de perfil y biografía, así como para gestionar los niveles de visibilidad social y privacidad de tu perfil en el dashboard.
                        </li>
                        <li>
                            <strong className="text-black uppercase text-xs block">Interés Legítimo:</strong>
                            Para garantizar la seguridad de la web, prevenir el spam y ataques maliciosos a través de cookies de sesión esenciales (CSRF y tokens de sesión), y para moderar comentarios y perfiles que violen las directrices de la comunidad.
                        </li>
                    </ul>
                </div>

                <div className="neo-card p-6 bg-white border-2 border-black shadow-[4px_4px_0px_#000] text-black space-y-4">
                    <h2 className="text-xl font-black uppercase border-b-2 border-black pb-2 text-brand-blue">4. Destinatarios y Transferencias</h2>
                    <p className="text-sm text-gray-700 font-medium">
                        BlockBookster **no vende, alquila ni comparte** tus datos personales con terceros para fines comerciales o publicitarios.
                    </p>
                    <p className="text-sm text-gray-700 font-medium">
                        Tus datos de perfil público (nombre, avatar, biografía, libros leídos, listas públicas) serán visibles para otros usuarios según la configuración de privacidad que elijas en tu panel de control.
                    </p>
                </div>

                <div className="neo-card p-6 bg-white border-2 border-black shadow-[4px_4px_0px_#000] text-black space-y-4">
                    <h2 className="text-xl font-black uppercase border-b-2 border-black pb-2 text-brand-blue">5. Conservación de los Datos</h2>
                    <p className="text-sm text-gray-700 font-medium">
                        Conservaremos tus datos personales únicamente mientras mantengas activa tu cuenta de usuario en BlockBookster. 
                    </p>
                    <p className="text-sm text-gray-700 font-medium">
                        Puedes solicitar la eliminación total de tus datos en cualquier momento eliminando tu cuenta directamente desde el **Dashboard → Ajustes → Eliminar cuenta**. Una vez de baja, tus datos personales serán suprimidos permanentemente de nuestra base de datos.
                    </p>
                </div>

                <div className="neo-card p-6 bg-white border-2 border-black shadow-[4px_4px_0px_#000] text-black space-y-4">
                    <h2 className="text-xl font-black uppercase border-b-2 border-black pb-2 text-brand-blue">6. Tus Derechos (Derechos ARCO+)</h2>
                    <p className="text-sm text-gray-700 font-medium">
                        Tienes derecho a acceder, rectificar, suprimir, oponerse al tratamiento, solicitar la limitación del tratamiento y ejercer el derecho a la portabilidad de tus datos personales. 
                    </p>
                    <p className="text-sm text-gray-700 font-medium">
                        Para ejercer cualquiera de estos derechos o si tienes cualquier duda, puedes enviar una solicitud firmada adjuntando copia de tu documento de identidad a <span className="font-mono text-brand-blue font-bold">privacy@blockbookster.com</span>. También tienes derecho a presentar una reclamación ante la Agencia Española de Protección de Datos (AEPD) si consideras que tus derechos han sido vulnerados.
                    </p>
                </div>
            </div>
        </StaticPage>
    );
}

export function TermsPage() {
    return (
        <StaticPage title="Términos de Servicio">
            <div className="max-w-4xl mx-auto space-y-8 mt-4">
                {/* Nota de última actualización */}
                <div className="neo-card p-6 bg-brand-yellow/10 border-2 border-black shadow-[4px_4px_0px_#000] text-black">
                    <p className="font-black text-sm uppercase">Última actualización: 8 de junio de 2026</p>
                    <p className="text-sm mt-2 font-bold text-gray-700">
                        Te damos la bienvenida a BlockBookster. Estos términos regulan el uso de nuestra plataforma y los servicios de seguimiento y comunidad literaria que ofrecemos, de conformidad con la legislación española y europea vigente.
                    </p>
                </div>

                {/* 1. Aceptación de los Términos */}
                <div className="neo-card p-6 bg-white border-2 border-black shadow-[4px_4px_0px_#000] text-black space-y-4">
                    <h2 className="text-xl font-black uppercase border-b-2 border-black pb-2 text-brand-yellow [text-shadow:1.5px_1.5px_0px_#000]">
                        1. Aceptación de los Términos
                    </h2>
                    <p className="text-sm text-gray-700 font-medium">
                        Al acceder y utilizar BlockBookster, registrarte en el sitio o interactuar con cualquiera de sus funciones (como el seguimiento de lecturas, valoraciones, reseñas, comentarios o listas de libros), aceptas cumplir con las condiciones establecidas en este acuerdo.
                    </p>
                    <p className="text-sm text-gray-700 font-medium">
                        De conformidad con el artículo 7 de la LOPDGDD, la edad mínima para registrarse y consentir el tratamiento de sus datos personales en España es de 14 años. Los menores de esta edad deberán contar con el consentimiento previo y acreditado de sus padres o tutores legales para crear una cuenta.
                    </p>
                </div>

                {/* 2. Conducta del Usuario y Uso Aceptable */}
                <div className="neo-card p-6 bg-white border-2 border-black shadow-[4px_4px_0px_#000] text-black space-y-4">
                    <h2 className="text-xl font-black uppercase border-b-2 border-black pb-2 text-brand-yellow [text-shadow:1.5px_1.5px_0px_#000]">
                        2. Conducta del Usuario y Uso Aceptable
                    </h2>
                    <p className="text-sm text-gray-700 font-medium">
                        Como usuario de BlockBookster, te comprometes a hacer un uso lícito y ético de la plataforma. Queda estrictamente prohibido:
                    </p>
                    <ul className="list-disc pl-5 text-sm text-gray-700 font-bold space-y-1">
                        <li>Publicar cualquier reseña, comentario o nombre de lista que sea difamatorio, obsceno, abusivo, xenófobo, racista, constituyente de discurso de odio o ilegal.</li>
                        <li>Crear múltiples cuentas ficticias ("bots" o cuentas títere) con el propósito de manipular artificialmente las calificaciones de popularidad, las valoraciones con estrellas o el sistema de comentarios. Este comportamiento infringe la normativa española de consumo y la regulación de la UE sobre la transparencia en plataformas.</li>
                        <li>Interferir con el correcto funcionamiento técnico de la web, inyectar código malicioso o malware, o realizar técnicas de extracción masiva de datos ("web scraping") no autorizadas sobre el catálogo de libros o perfiles.</li>
                    </ul>
                </div>

                {/* 3. Moderación y DSA (Ley de Servicios Digitales) */}
                <div className="neo-card p-6 bg-white border-2 border-black shadow-[4px_4px_0px_#000] text-black space-y-4">
                    <h2 className="text-xl font-black uppercase border-b-2 border-black pb-2 text-brand-yellow [text-shadow:1.5px_1.5px_0px_#000]">
                        3. Moderación y DSA (Ley de Servicios Digitales)
                    </h2>
                    <p className="text-sm text-gray-700 font-medium">
                        En cumplimiento de la Ley de Servicios Digitales (DSA) de la Unión Europea, BlockBookster implementa moderación de contenidos. Nos reservamos el derecho a retirar de forma inmediata contenidos no conformes, así como suspender o eliminar cuentas que incurran en infracciones repetidas. En tal caso, el usuario será notificado con los motivos específicos de la acción y dispondrá del derecho a apelar la decisión escribiendo a través de la sección de Contacto.
                    </p>
                </div>

                {/* 4. Propiedad Intelectual y Licencia de Contenido */}
                <div className="neo-card p-6 bg-white border-2 border-black shadow-[4px_4px_0px_#000] text-black space-y-4">
                    <h2 className="text-xl font-black uppercase border-b-2 border-black pb-2 text-brand-yellow [text-shadow:1.5px_1.5px_0px_#000]">
                        4. Propiedad Intelectual y Licencia de Contenido
                    </h2>
                    <p className="text-sm text-gray-700 font-medium">
                        El código fuente de la plataforma (Laravel 12 y React 18), su diseño visual Neo-Brutalist, sus logotipos y su base de datos recopilada son propiedad exclusiva de BlockBookster y están protegidos por las leyes de propiedad intelectual.
                    </p>
                    <p className="text-sm text-gray-700 font-medium">
                        Al publicar reseñas, valoraciones o comentarios en el sitio, otorgas a BlockBookster una licencia no exclusiva, gratuita, mundial y sublicenciable para albergar, mostrar y distribuir tu contenido en la plataforma. Sigues siendo el propietario original de tus textos.
                    </p>
                    <p className="text-sm text-gray-700 font-medium">
                        Las portadas de libros, sinopsis oficiales y otros metadatos protegidos por propiedad intelectual se muestran de conformidad con el derecho de cita e información bibliográfica recogido en el artículo 32 de la Ley de Propiedad Intelectual (LPI) de España.
                    </p>
                </div>

                {/* 5. Limitación de Responsabilidad */}
                <div className="neo-card p-6 bg-white border-2 border-black shadow-[4px_4px_0px_#000] text-black space-y-4">
                    <h2 className="text-xl font-black uppercase border-b-2 border-black pb-2 text-brand-yellow [text-shadow:1.5px_1.5px_0px_#000]">
                        5. Limitación de Responsabilidad
                    </h2>
                    <p className="text-sm text-gray-700 font-medium">
                        BlockBookster se ofrece "tal cual" y no garantiza la disponibilidad técnica ininterrumpida ni la ausencia de errores. No nos hacemos responsables de las opiniones de los usuarios expuestas en las reseñas, ni de posibles pérdidas de datos o interrupciones del servicio debidas a causas técnicas de fuerza mayor.
                    </p>
                </div>

                {/* 6. Ley Aplicable y Jurisdicción */}
                <div className="neo-card p-6 bg-white border-2 border-black shadow-[4px_4px_0px_#000] text-black space-y-4">
                    <h2 className="text-xl font-black uppercase border-b-2 border-black pb-2 text-brand-yellow [text-shadow:1.5px_1.5px_0px_#000]">
                        6. Ley Aplicable y Jurisdicción
                    </h2>
                    <p className="text-sm text-gray-700 font-medium">
                        Estos términos y condiciones se rigen por la legislación vigente en España. Si utilizas la plataforma en calidad de consumidor, la competencia judicial corresponderá a los juzgados y tribunales de tu propio domicilio conforme a la normativa imperativa. En caso contrario, cualquier controversia se someterá a la jurisdicción exclusiva de los tribunales de Madrid, España.
                    </p>
                </div>
            </div>
        </StaticPage>
    );
}


export function CookiesPage() {
    return (
        <StaticPage title="Política de Cookies">
            <p className="text-base font-bold text-gray-800 mb-6">
                En BlockBookster, nos comprometemos a ser transparentes sobre cómo recopilamos y usamos tus datos. A continuación, te explicamos qué son las cookies, cómo las utilizamos en nuestra plataforma y cómo puedes gestionarlas de acuerdo con la normativa vigente (RGPD y LSSI-CE).
            </p>

            <div className="neo-card p-6 bg-brand-yellow/10 mb-8 border-2 border-black shadow-[4px_4px_0px_#000]">
                <h2 className="text-xl font-black uppercase mb-3 text-black">1. ¿Qué son las cookies?</h2>
                <p className="text-sm text-gray-700 font-medium">
                    Las cookies son pequeños archivos de texto que los sitios web almacenan en tu navegador o dispositivo cuando los visitas. Se utilizan habitualmente para hacer que los sitios web funcionen de manera más eficiente, mejorar la experiencia de usuario y proporcionar información a los propietarios del sitio.
                </p>
            </div>

            <div className="neo-card p-6 bg-white mb-8 border-2 border-black shadow-[4px_4px_0px_#000]">
                <h2 className="text-xl font-black uppercase mb-3 text-black">2. ¿Qué tipos de cookies utiliza BlockBookster?</h2>
                <p className="text-sm text-gray-700 font-medium mb-4">
                    Nuestra plataforma utiliza únicamente <strong>cookies técnicas y esenciales</strong>. Estas cookies son estrictamente necesarias para el correcto funcionamiento de la aplicación y para garantizar la seguridad de la navegación.
                </p>
                <div className="bg-brand-blue text-white p-4 border-2 border-black font-bold text-xs uppercase mb-2 shadow-[2px_2px_0px_#000] inline-block">
                    ⚠️ NOTA: No utilizamos cookies de publicidad, seguimiento o análisis de terceros.
                </div>
            </div>

            <h2 className="text-xl font-black uppercase mb-4 text-black">3. Detalle de las Cookies Utilizadas</h2>
            <div className="overflow-x-auto border-2 border-black shadow-[4px_4px_0px_#000] mb-8">
                <table className="w-full text-left border-collapse bg-white">
                    <thead>
                        <tr className="bg-black text-white border-b-2 border-black uppercase text-xs font-black">
                            <th className="p-3 border-r-2 border-black">Nombre</th>
                            <th className="p-3 border-r-2 border-black">Origen</th>
                            <th className="p-3 border-r-2 border-black">Duración</th>
                            <th className="p-3">Finalidad / Información</th>
                        </tr>
                    </thead>
                    <tbody className="text-sm font-medium text-gray-800">
                        <tr className="border-b-2 border-black hover:bg-gray-50">
                            <td className="p-3 border-r-2 border-black font-bold">XSRF-TOKEN</td>
                            <td className="p-3 border-r-2 border-black">Propia (BlockBookster)</td>
                            <td className="p-3 border-r-2 border-black">2 horas (de sesión)</td>
                            <td className="p-3 text-gray-600">Garantiza la seguridad de la navegación protegiendo contra ataques de falsificación de solicitudes en sitios cruzados (CSRF).</td>
                        </tr>
                        <tr className="hover:bg-gray-50">
                            <td className="p-3 border-r-2 border-black font-bold">blockbooksterreact_session</td>
                            <td className="p-3 border-r-2 border-black">Propia (BlockBookster)</td>
                            <td className="p-3 border-r-2 border-black">2 horas (de sesión)</td>
                            <td className="p-3 text-gray-600">Mantiene el estado de autenticación de tu sesión de usuario para que no tengas que iniciar sesión en cada página.</td>
                        </tr>
                    </tbody>
                </table>
            </div>

            <div className="neo-card p-6 bg-white border-2 border-black shadow-[4px_4px_0px_#000] mb-8">
                <h2 className="text-xl font-black uppercase mb-3 text-black">4. ¿Cómo puedes desactivar o configurar las cookies?</h2>
                <p className="text-sm text-gray-700 font-medium mb-4">
                    Al ser cookies técnicas estrictamente necesarias para prestar el servicio solicitado, no requieren de un consentimiento activo según la legislación. No obstante, puedes restringir, bloquear o borrar las cookies de este o cualquier otro sitio web utilizando la configuración de tu navegador de Internet:
                </p>
                <ul className="list-disc pl-5 space-y-2 text-sm text-gray-700 font-bold">
                    <li><a href="https://support.google.com/chrome/answer/95647" target="_blank" rel="noopener noreferrer" className="hover:underline text-brand-blue">Google Chrome</a></li>
                    <li><a href="https://support.mozilla.org/es/kb/habilitar-y-deshabilitar-cookies-sitios-web-rastrear-preferencias" target="_blank" rel="noopener noreferrer" className="hover:underline text-brand-blue">Mozilla Firefox</a></li>
                    <li><a href="https://support.apple.com/es-es/guide/safari/sfri11471/mac" target="_blank" rel="noopener noreferrer" className="hover:underline text-brand-blue">Safari (macOS/iOS)</a></li>
                    <li><a href="https://support.microsoft.com/es-es/microsoft-edge/eliminar-y-administrar-cookies-168dab11-0753-2427-2824-4d873dd8a22b" target="_blank" rel="noopener noreferrer" className="hover:underline text-brand-blue">Microsoft Edge</a></li>
                </ul>
                <p className="text-sm text-red-600 font-bold mt-4">
                    * Nota: Si bloqueas o eliminas nuestras cookies esenciales, es posible que no puedas iniciar sesión o que algunas características funcionales de la plataforma dejen de estar disponibles.
                </p>
            </div>
        </StaticPage>
    );
}

export function JobsPage() {
    const [form, setForm] = useState({
        name: '',
        email: '',
        position: 'Desarrollador Fullstack',
        cv_link: '',
        message: ''
    });
    const [submitting, setSubmitting] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const [errors, setErrors] = useState({});

    const handleChange = (field) => (e) => {
        setForm(prev => ({ ...prev, [field]: e.target.value }));
        if (errors[field]) {
            setErrors(prev => ({ ...prev, [field]: null }));
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        
        // Validación básica en el cliente
        const newErrors = {};
        if (!form.name.trim()) newErrors.name = 'El nombre es obligatorio.';
        if (!form.email.trim()) {
            newErrors.email = 'El correo electrónico es obligatorio.';
        } else if (!/\S+@\S+\.\S+/.test(form.email)) {
            newErrors.email = 'El correo electrónico no es válido.';
        }
        if (!form.cv_link.trim()) {
            newErrors.cv_link = 'El enlace a tu CV o perfil de LinkedIn es obligatorio.';
        } else if (!/^https?:\/\/\S+/.test(form.cv_link)) {
            newErrors.cv_link = 'Introduce un enlace válido (ej. https://linkedin.com/in/tuperfil).';
        }
        if (!form.message.trim()) newErrors.message = 'La carta de presentación es obligatoria.';

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }

        setSubmitting(true);

        // Simulación de envío del formulario de empleo
        setTimeout(() => {
            setSubmitting(false);
            setSubmitted(true);
            setForm({
                name: '',
                email: '',
                position: 'Desarrollador Fullstack',
                cv_link: '',
                message: ''
            });
        }, 1200);
    };

    return (
        <StaticPage title="Trabaja con Nosotros">
            <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-12 mt-4">
                <div>
                    <h2 className="text-4xl md:text-5xl font-black uppercase font-display mb-6 text-black leading-none">
                        Únete a la <span className="text-brand-yellow bg-black px-2 inline-block transform -rotate-1 [text-shadow:2px_2px_0px_#000]">Revolución</span> Literaria
                    </h2>
                    <p className="text-xl mb-8 font-bold text-gray-700">
                        En BlockBookster estamos transformando el seguimiento y la comunidad de lectura. Si amas los libros, el diseño Neo-Brutalist y el código limpio, este es tu lugar.
                    </p>

                    <div className="neo-card p-6 bg-brand-blue/10 border-2 border-black shadow-[4px_4px_0px_#000] text-black mb-8 space-y-4">
                        <h3 className="font-black uppercase text-lg text-brand-blue">¿Por qué BlockBookster?</h3>
                        <ul className="list-disc pl-5 space-y-2 text-sm font-bold text-gray-700">
                            <li><strong>Filosofía brutalista:</strong> Sin distracciones, sin publicidad abusiva, centrados en el valor de los datos y la interacción de la comunidad.</li>
                            <li><strong>Stack moderno:</strong> Trabajamos a la vanguardia con Laravel 12, React 18, Tailwind y APIs REST robustas.</li>
                            <li><strong>Cultura remota y abierta:</strong> Fomentamos la autonomía, la conciliación y la transparencia en todos los niveles.</li>
                        </ul>
                    </div>

                    <div className="space-y-6">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-black text-white flex items-center justify-center font-black rounded-full text-xl shadow-[4px_4px_0px_#888] shrink-0">
                                @
                            </div>
                            <div>
                                <h3 className="font-black uppercase text-sm text-black">Correo de Talento</h3>
                                <p className="font-mono text-sm text-brand-blue font-bold">jobs@blockbookster.com</p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="neo-card bg-white p-8 border-2 border-black shadow-[4px_4px_0px_#000]">
                    <h2 className="font-black text-2xl uppercase mb-6 text-black">Enviar Candidatura</h2>
                    
                    {submitted && (
                        <div className="mb-6 p-4 bg-green-100 border-2 border-green-600 text-green-900 font-bold text-sm shadow-[2px_2px_0px_#000] animate-bounce">
                            ¡Candidatura recibida con éxito! Nuestro equipo de talento revisará tu perfil y se pondrá en contacto contigo muy pronto.
                            <button 
                                onClick={() => setSubmitted(false)}
                                className="block mt-2 text-xs underline uppercase cursor-pointer hover:text-black font-black"
                            >
                                Enviar otra postulación
                            </button>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-xs font-bold uppercase mb-2 text-black">Nombre Completo</label>
                            <input 
                                type="text" 
                                className={`neo-input w-full ${errors.name ? 'border-red-600 bg-red-50' : ''}`}
                                placeholder="Tu nombre y apellidos"
                                value={form.name}
                                onChange={handleChange('name')}
                                disabled={submitting}
                            />
                            {errors.name && <p className="text-red-600 text-xs font-bold mt-1">{errors.name}</p>}
                        </div>
                        <div>
                            <label className="block text-xs font-bold uppercase mb-2 text-black">Correo electrónico</label>
                            <input 
                                type="email" 
                                className={`neo-input w-full ${errors.email ? 'border-red-600 bg-red-50' : ''}`}
                                placeholder="tu@ejemplo.com"
                                value={form.email}
                                onChange={handleChange('email')}
                                disabled={submitting}
                            />
                            {errors.email && <p className="text-red-600 text-xs font-bold mt-1">{errors.email}</p>}
                        </div>
                        <div>
                            <label className="block text-xs font-bold uppercase mb-2 text-black">Puesto de interés</label>
                            <select 
                                className="neo-input w-full bg-white cursor-pointer"
                                value={form.position}
                                onChange={handleChange('position')}
                                disabled={submitting}
                            >
                                <option value="Desarrollador Fullstack">Desarrollador Fullstack (Laravel / React)</option>
                                <option value="Diseñador UX/UI">Diseñador UX/UI (Brutalismo y UX limpia)</option>
                                <option value="Moderador de Comunidad">Moderador de Comunidad e Integridad</option>
                                <option value="Redactor / Gestor de Contenido">Redactor / Gestor de Contenido Literario</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-xs font-bold uppercase mb-2 text-black">Enlace a tu CV o LinkedIn</label>
                            <input 
                                type="url" 
                                className={`neo-input w-full ${errors.cv_link ? 'border-red-600 bg-red-50' : ''}`}
                                placeholder="https://linkedin.com/in/tuperfil"
                                value={form.cv_link}
                                onChange={handleChange('cv_link')}
                                disabled={submitting}
                            />
                            {errors.cv_link && <p className="text-red-600 text-xs font-bold mt-1">{errors.cv_link}</p>}
                        </div>
                        <div>
                            <label className="block text-xs font-bold uppercase mb-2 text-black">Carta de Presentación / Motivación</label>
                            <textarea 
                                rows="4" 
                                className={`neo-input w-full ${errors.message ? 'border-red-600 bg-red-50' : ''}`}
                                placeholder="Cuéntanos por qué eres idóneo para BlockBookster..."
                                value={form.message}
                                onChange={handleChange('message')}
                                disabled={submitting}
                            ></textarea>
                            {errors.message && <p className="text-red-600 text-xs font-bold mt-1">{errors.message}</p>}
                        </div>
                        <button 
                            type="submit" 
                            className="neo-btn-primary w-full py-3 cursor-pointer flex items-center justify-center gap-2"
                            disabled={submitting}
                        >
                            {submitting ? (
                                <>
                                    <div className="w-5 h-5 border-t-2 border-white rounded-full animate-spin"></div>
                                    Enviando candidatura...
                                </>
                            ) : 'Enviar candidatura'}
                        </button>
                    </form>
                </div>
            </div>
        </StaticPage>
    );
}


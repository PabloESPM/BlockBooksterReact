
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
    return (
        <StaticPage title="Sobre Nosotros">
            <p>BlockBookster es una red social de libros donde puedes descubrir, valorar y compartir tus lecturas favoritas con la comunidad.</p>
            <p>Inspirado en la nostalgia de Blockbuster y la pasión por la lectura, BlockBookster combina el espíritu comunitario con la tecnología moderna para crear la mejor experiencia para los amantes de los libros.</p>
        </StaticPage>
    );
}

export function ContactPage() {
    return (
        <StaticPage title="Contacto">
            <p>¿Tienes preguntas, sugerencias o necesitas ayuda? No dudes en contactarnos.</p>
            <div className="neo-card p-6 mt-4">
                <p className="font-bold">📧 Email: soporte@blockbookster.com</p>
                <p className="font-bold mt-2">📍 Dirección: Madrid, España</p>
            </div>
        </StaticPage>
    );
}

export function FaqPage() {
    return (
        <StaticPage title="Preguntas Frecuentes">
            <div className="space-y-4">
                {[
                    { q: '¿Qué es BlockBookster?', a: 'BlockBookster es una plataforma social para amantes de la lectura donde puedes descubrir libros, escribir reseñas, crear listas y conectar con otros lectores.' },
                    { q: '¿Es gratis?', a: 'Sí, BlockBookster es completamente gratuito. Puedes crear una cuenta, valorar libros y participar en la comunidad sin coste alguno.' },
                    { q: '¿Puedo crear listas privadas?', a: 'Sí, puedes configurar la visibilidad de tus listas como pública, solo seguidores, solo amigos o privada.' },
                    { q: '¿Cómo cambio la privacidad de mi perfil?', a: 'En tu dashboard, ve a Ajustes → Privacidad y selecciona el nivel de visibilidad deseado.' },
                ].map((faq, i) => (
                    <div key={i} className="neo-card p-4">
                        <h3 className="font-bold text-sm mb-1">{faq.q}</h3>
                        <p className="text-sm text-gray-600">{faq.a}</p>
                    </div>
                ))}
            </div>
        </StaticPage>
    );
}

export function PrivacyPage() {
    return (
        <StaticPage title="Política de Privacidad">
            <p>En BlockBookster nos tomamos la privacidad de nuestros usuarios muy en serio. Esta política describe cómo recopilamos, usamos y protegemos tu información personal.</p>
            <p>Solo recopilamos la información necesaria para proporcionarte el servicio: nombre, correo electrónico, y datos opcionales de perfil.</p>
            <p>Nunca vendemos ni compartimos tu información personal con terceros sin tu consentimiento explícito.</p>
        </StaticPage>
    );
}

export function TermsPage() {
    return (
        <StaticPage title="Términos de Uso">
            <p>Al usar BlockBookster aceptas estos términos de uso. Te recomendamos leerlos detenidamente.</p>
            <p>Eres responsable del contenido que publicas (reseñas, listas, comentarios). No se permite contenido ofensivo, discriminatorio o que infrinja derechos de terceros.</p>
            <p>Nos reservamos el derecho de bloquear cuentas que violen estas normas.</p>
        </StaticPage>
    );
}

export function CookiesPage() {
    return (
        <StaticPage title="Política de Cookies">
            <p>BlockBookster utiliza cookies esenciales para el funcionamiento del servicio, incluyendo cookies de sesión para mantener tu inicio de sesión activo.</p>
            <p>No utilizamos cookies de seguimiento o publicidad de terceros.</p>
        </StaticPage>
    );
}

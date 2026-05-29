import { Link } from 'react-router-dom';

/**
 * Footer editorial estilo Neo-Brutalism.
 * Replica el footer completo del layout app.blade.php.
 */
export default function Footer() {
    return (
        <footer className="bg-black text-white border-t-4 border-brand-yellow mt-auto">
            <div className="max-w-7xl mx-auto px-4 py-12">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                    {/* Columna: Logo y descripción */}
                    <div className="md:col-span-1">
                        <Link to="/" className="text-2xl font-display font-black tracking-tighter uppercase">
                            Block<span className="text-brand-yellow">Book</span>ster
                        </Link>
                        <p className="text-xs text-gray-400 mt-3 leading-relaxed">
                            Tu red social de libros. Descubre, valora y comparte tus lecturas favoritas con la comunidad.
                        </p>
                    </div>

                    {/* Columna: Explorar */}
                    <div>
                        <h4 className="text-xs font-black uppercase tracking-widest text-brand-yellow mb-4">
                            Explorar
                        </h4>
                        <ul className="space-y-2">
                            {[
                                { to: '/books', label: 'Libros' },
                                { to: '/authors', label: 'Autores' },
                                { to: '/lists', label: 'Listas' },
                                { to: '/community', label: 'Comunidad' },
                            ].map((link) => (
                                <li key={link.to}>
                                    <Link to={link.to} className="text-xs text-gray-400 font-medium hover:text-white transition-colors">
                                        {link.label}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Columna: Legal */}
                    <div>
                        <h4 className="text-xs font-black uppercase tracking-widest text-brand-yellow mb-4">
                            Legal
                        </h4>
                        <ul className="space-y-2">
                            {[
                                { to: '/privacy', label: 'Privacidad' },
                                { to: '/terms', label: 'Términos' },
                                { to: '/cookies', label: 'Cookies' },
                                { to: '/faq', label: 'FAQ' },
                            ].map((link) => (
                                <li key={link.to}>
                                    <Link to={link.to} className="text-xs text-gray-400 font-medium hover:text-white transition-colors">
                                        {link.label}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Columna: Contacto */}
                    <div>
                        <h4 className="text-xs font-black uppercase tracking-widest text-brand-yellow mb-4">
                            Empresa
                        </h4>
                        <ul className="space-y-2">
                            {[
                                { to: '/about', label: 'Sobre nosotros' },
                                { to: '/contact', label: 'Contacto' },
                            ].map((link) => (
                                <li key={link.to}>
                                    <Link to={link.to} className="text-xs text-gray-400 font-medium hover:text-white transition-colors">
                                        {link.label}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>

                {/* Copyright */}
                <div className="border-t border-gray-800 mt-8 pt-6 text-center">
                    <p className="text-xs text-gray-500 font-medium">
                        © {new Date().getFullYear()} BlockBookster. Todos los derechos reservados.
                    </p>
                </div>
            </div>
        </footer>
    );
}

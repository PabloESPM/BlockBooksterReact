import { Link } from 'react-router-dom';

/**
 * Footer editorial estilo Neo-Brutalism (diseño original).
 */
export default function Footer() {
    return (
        <div className="border-t-4 border-black bg-white mt-auto">
            <div className="container mx-auto px-4 py-12">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                    {/* Marca */}
                    <div className="col-span-1 md:col-span-1">
                        <Link
                            to="/"
                            className="text-2xl font-black font-display uppercase tracking-tighter hover:text-brand-blue transition-colors text-black"
                        >
                            BlockBookster
                        </Link>
                        <p className="mt-4 text-sm font-bold text-gray-600">
                            La plataforma de seguimiento de libros sin rodeos para lectores brutalistas.
                        </p>
                        <div className="mt-6 flex gap-4">
                            <a
                                href="#"
                                className="w-10 h-10 border-2 border-black flex items-center justify-center hover:bg-black hover:text-white transition-colors text-black"
                            >
                                <span className="sr-only">Twitter</span>
                                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                                </svg>
                            </a>
                            <a
                                href="#"
                                className="w-10 h-10 border-2 border-black flex items-center justify-center hover:bg-black hover:text-white transition-colors text-black"
                            >
                                <span className="sr-only">GitHub</span>
                                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                    <path
                                        fillRule="evenodd"
                                        d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
                                        clipRule="evenodd"
                                    />
                                </svg>
                            </a>
                            {/* Instagram */}
                            <a
                                href="#"
                                className="w-10 h-10 border-2 border-black flex items-center justify-center hover:bg-black hover:text-white transition-colors text-black"
                            >
                                <span className="sr-only">Instagram</span>
                                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M7 2C4.239 2 2 4.239 2 7v10c0 2.761 2.239 5 5 5h10c2.761 0 5-2.239 5-5V7c0-2.761-2.239-5-5-5H7zm10 2c1.654 0 3 1.346 3 3v10c0 1.654-1.346 3-3 3H7c-1.654 0-3-1.346-3-3V7c0-1.654 1.346-3 3-3h10zm-5 3a5 5 0 100 10 5 5 0 000-10zm0 2a3 3 0 110 6 3 3 0 010-6zm4.5-.9a1.1 1.1 0 100 2.2 1.1 1.1 0 000-2.2z" />
                                </svg>
                            </a>

                            {/* TikTok */}
                            <a
                                href="#"
                                className="w-10 h-10 border-2 border-black flex items-center justify-center hover:bg-black hover:text-white transition-colors text-black"
                            >
                                <span className="sr-only">TikTok</span>
                                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M12.75 2h2.1c.3 2.1 1.8 3.9 3.9 4.2v2.1c-1.5 0-3-.6-4.2-1.5v7.5a5.25 5.25 0 11-5.25-5.25c.3 0 .6 0 .9.1v2.3a2.85 2.85 0 10 2.55 2.85V2z" />
                                </svg>
                            </a>

                            {/* Facebook */}
                            <a
                                href="#"
                                className="w-10 h-10 border-2 border-black flex items-center justify-center hover:bg-black hover:text-white transition-colors text-black"
                            >
                                <span className="sr-only">Facebook</span>
                                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M22 12a10 10 0 10-11.5 9.9v-7H8v-3h2.5V9.5c0-2.5 1.5-3.9 3.8-3.9 1.1 0 2.2.2 2.2.2v2.4h-1.2c-1.2 0-1.6.7-1.6 1.5V12H16l-.5 3h-2.6v7A10 10 0 0022 12z" />
                                </svg>
                            </a>

                            {/* Bluesky */}
                            <a
                                href="#"
                                className="w-10 h-10 border-2 border-black flex items-center justify-center hover:bg-black hover:text-white transition-colors text-black"
                            >
                                <span className="sr-only">Bluesky</span>
                                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M12 2c2.5 2.6 4.6 4.1 7.5 5.2-.4 3.5-1.6 6.5-4.3 8.9L12 22l-3.2-5.9C6.1 13.7 4.9 10.7 4.5 7.2 7.4 6.1 9.5 4.6 12 2z" />
                                </svg>
                            </a>
                        </div>
                    </div>

                    {/* Links */}
                    <div className="col-span-1 border-l-2 border-black pl-8">
                        <h3 className="font-black uppercase mb-4 text-sm bg-brand-yellow inline-block px-1 text-black">Descubrir</h3>
                        <ul className="space-y-2 text-sm font-bold">
                            <li><Link to="/books" className="hover:underline text-black">Libros</Link></li>
                            <li><Link to="/authors" className="hover:underline text-black">Autores</Link></li>
                            <li><Link to="/lists" className="hover:underline text-black">Listas</Link></li>
                            <li><Link to="/community" className="hover:underline text-black">Comunidad</Link></li>
                        </ul>
                    </div>

                    {/* Compañia */}
                    <div className="col-span-1 border-l-2 border-black pl-8">
                        <h3 className="font-black uppercase mb-4 text-sm bg-brand-blue text-white inline-block px-1">Empresa</h3>
                        <ul className="space-y-2 text-sm font-bold">
                            <li><Link to="/about" className="hover:underline text-black">Sobre nosotros</Link></li>
                            <li><Link to="/contact" className="hover:underline text-black">Contacto</Link></li>
                            <li><Link to="/faq" className="hover:underline text-black">Preguntas frecuentes</Link></li>
                            <li><Link to="/jobs" className="hover:underline text-black">Empleo</Link></li>
                        </ul>
                    </div>

                    {/* Legal */}
                    <div className="col-span-1 border-l-2 border-black pl-8">
                        <h3 className="font-black uppercase mb-4 text-sm bg-black text-white inline-block px-1">Legal</h3>
                        <ul className="space-y-2 text-sm font-bold">
                            <li><Link to="/privacy" className="hover:underline text-black">Política de Privacidad</Link></li>
                            <li><Link to="/terms" className="hover:underline text-black">Términos de Servicio</Link></li>
                            <li><Link to="/cookies" className="hover:underline text-black">Política de Cookies</Link></li>
                        </ul>
                    </div>
                </div>

                <div className="border-t-2 border-black mt-12 pt-8 flex flex-col md:flex-row justify-between items-center text-xs font-bold uppercase text-gray-500">
                    <p>&copy; {new Date().getFullYear()} BlockBookster. Todos los derechos reservados.</p>
                    <p>Hecho con 🖤 y Laravel.</p>
                </div>
            </div>
        </div>
    );
}


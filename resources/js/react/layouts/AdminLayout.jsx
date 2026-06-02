import { Outlet, NavLink, Link } from 'react-router-dom';

/**
 * AdminLayout — Layout del panel de administración.
 * Sidebar lateral con navegación + área de contenido.
 * Equivale a layouts/admin.blade.php.
 */
export default function AdminLayout() {
    const links = [
        { to: '/admin', label: 'Panel', icon: '📊', end: true },
        { to: '/admin/books', label: 'Libros', icon: '📚' },
        { to: '/admin/authors', label: 'Autores', icon: '✍️' },
        { to: '/admin/users', label: 'Usuarios', icon: '👥' },
        { to: '/admin/reviews', label: 'Reseñas', icon: '💬' },
        { to: '/admin/lists', label: 'Listas', icon: '📋' },
    ];

    return (
        <div className="min-h-screen bg-gray-100">
            {/* Cabecera admin */}
            <header className="bg-black text-white border-b-4 border-brand-yellow sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-4 h-14 flex items-center justify-between">
                    <Link to="/admin" className="text-lg font-display font-black tracking-tighter uppercase">
                        Block<span className="text-brand-yellow">Book</span>ster
                        <span className="text-xs text-red-500 font-bold ml-2">ADMIN</span>
                    </Link>
                    <Link to="/" className="text-xs font-bold uppercase text-gray-400 hover:text-white">
                        ← Volver al sitio
                    </Link>
                </div>
            </header>

            <div className="max-w-7xl mx-auto px-4 py-6">
                <div className="flex flex-col md:flex-row gap-6">
                    {/* Sidebar */}
                    <aside className="w-full md:w-56 shrink-0">
                        <div className="neo-card p-0 overflow-hidden sticky top-20">
                            <div className="bg-black p-3 border-b-2 border-black">
                                <h2 className="text-xs font-black uppercase text-brand-yellow tracking-widest">
                                    Administración
                                </h2>
                            </div>
                            <nav className="divide-y-2 divide-gray-100">
                                {links.map((link) => (
                                    <NavLink
                                        key={link.to}
                                        to={link.to}
                                        end={link.end}
                                        className={({ isActive }) =>
                                            `flex items-center gap-3 px-4 py-3 text-xs font-bold uppercase tracking-wide transition-colors ${
                                                isActive
                                                    ? 'bg-brand-yellow text-black'
                                                    : 'text-gray-600 hover:bg-gray-50'
                                            }`
                                        }
                                    >
                                        <span>{link.icon}</span>
                                        {link.label}
                                    </NavLink>
                                ))}
                            </nav>
                        </div>
                    </aside>

                    {/* Contenido */}
                    <div className="flex-grow min-w-0">
                        <Outlet />
                    </div>
                </div>
            </div>
        </div>
    );
}

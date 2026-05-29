import { Outlet, NavLink } from 'react-router-dom';

/**
 * DashboardLayout — Layout del panel del usuario.
 * Sidebar lateral con navegación + área de contenido.
 * Equivale a la sidebar del dashboard en dashboard/partials/sidebar.blade.php.
 */
export default function DashboardLayout() {
    const links = [
        { to: '/dashboard', label: 'Resumen', icon: '📊', end: true },
        { to: '/dashboard/profile', label: 'Mi Perfil', icon: '👤' },
        { to: '/dashboard/lists', label: 'Mis Listas', icon: '📚' },
        { to: '/dashboard/reviews', label: 'Mis Reseñas', icon: '✍️' },
        { to: '/dashboard/social', label: 'Social', icon: '👥' },
        { to: '/dashboard/settings', label: 'Ajustes', icon: '⚙️' },
    ];

    return (
        <div className="max-w-7xl mx-auto px-4 py-8">
            <div className="flex flex-col md:flex-row gap-6">
                {/* Sidebar */}
                <aside className="w-full md:w-64 shrink-0">
                    <div className="neo-card p-0 overflow-hidden sticky top-20">
                        <div className="bg-brand-blue p-4 border-b-2 border-black">
                            <h2 className="text-sm font-black uppercase text-white tracking-widest">
                                Mi Dashboard
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

                {/* Contenido principal */}
                <div className="flex-grow min-w-0">
                    <Outlet />
                </div>
            </div>
        </div>
    );
}

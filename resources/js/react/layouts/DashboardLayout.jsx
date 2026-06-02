import { Outlet, NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

/**
 * Avatar circular con iniciales del nombre completo si no hay foto de perfil.
 * "Pablo García" → "PG"   |   size: 'sm' (32px) | 'md' (48px, default)
 */
function UserAvatar({ user, size = 'md' }) {
    const name = user?.name;
    const initials = name
        ? name.trim().split(/\s+/).slice(0, 2).map(w => w[0].toUpperCase()).join('')
        : '?';

    const sizeClass = size === 'sm' ? 'w-8 h-8 text-xs' : 'w-12 h-12 text-sm';
    const avatarUrl = user?.avatar_url;

    return (
        <div
            className={`${sizeClass} rounded-full border-2 border-black overflow-hidden flex-shrink-0 flex items-center justify-center bg-brand-yellow font-display font-black select-none shadow-[2px_2px_0px_#000]`}
            aria-hidden="true"
        >
            {avatarUrl ? (
                <img
                    src={avatarUrl}
                    alt={`Avatar de ${name}`}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                        e.target.style.display = 'none';
                        const fallbackText = e.target.nextSibling;
                        if (fallbackText) fallbackText.style.display = 'block';
                    }}
                />
            ) : null}
            <span className="text-black" style={{ display: avatarUrl ? 'none' : 'block' }}>
                {initials}
            </span>
        </div>
    );
}

function SidebarLink({ link }) {
    const base =
        'flex items-center gap-3 px-5 py-3.5 font-bold uppercase text-sm tracking-wide ' +
        'transition-colors border-b-2 border-black last:border-b-0';

    return (
        <NavLink
            to={link.to}
            end={link.end}
            className={({ isActive }) => {
                if (link.danger) {
                    return `${base} ${isActive ? 'bg-red-500 text-white' : 'text-black hover:bg-red-500 hover:text-white'}`;
                }
                return `${base} ${isActive ? 'bg-brand-yellow text-black' : 'text-black hover:bg-gray-50'}`;
            }}
        >
            <span className="w-5 text-center text-base leading-none" aria-hidden="true">
                {link.icon}
            </span>
            <span>{link.label}</span>
        </NavLink>
    );
}

/**
 * DashboardLayout — Layout del panel del usuario.
 * Sidebar lateral con navegación + área de contenido.
 * Equivale a la sidebar del dashboard en dashboard/partials/sidebar.blade.php.
 */
export default function DashboardLayout() {
    const { user } = useAuth();

    const links = [
        { to: '/dashboard',          label: 'Vista General', icon: '📊', end: true },
        { to: '/dashboard/social',   label: 'Social',        icon: '👥'           },
        { to: '/dashboard/lists',    label: 'Mis Listas',    icon: '📚'           },
        { to: '/dashboard/reviews',  label: 'Mis Reseñas',   icon: '✍️'           },
        { to: '/dashboard/profile',  label: 'Editar Perfil', icon: '👤'           },
        { to: '/dashboard/settings', label: 'Ajustes',       icon: '⚙️', danger: true },
    ];

    return (
        <div className="max-w-7xl mx-auto px-4 py-8">
            <div className="flex flex-col lg:flex-row gap-12">

                {/* Sidebar */}
                <aside className="w-full lg:w-64 flex-shrink-0">
                    <div className="neo-card p-0 overflow-hidden sticky top-24">

                        {/* Cabecera unificada: etiqueta + avatar + nombre + email */}
                        <div className="p-5 bg-black text-white border-b-2 border-black">
                            <div className="flex items-center gap-3">
                                <UserAvatar user={user} />
                                <div className="min-w-0 flex-1">
                                    <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1">
                                        Mi Cuenta
                                    </p>
                                    <h2 className="font-display font-black text-sm uppercase leading-tight truncate">
                                        {user?.name ?? 'Usuario'}
                                    </h2>
                                    {user?.email && (
                                        <p className="text-xs text-gray-500 truncate mt-0.5 normal-case font-normal">
                                            {user.email}
                                        </p>
                                    )}
                                </div>
                            </div>
                        </div>

                        <nav className="flex flex-col">
                            {links.map((link) => (
                                <SidebarLink key={link.to} link={link} />
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

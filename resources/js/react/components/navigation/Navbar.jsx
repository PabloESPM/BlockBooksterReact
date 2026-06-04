import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import apiClient from '../../api/client';

/**
 * Navbar principal — Replica el header del layout app.blade.php.
 * Logo, navegación, buscador y acciones de usuario.
 */
export default function Navbar() {
    const { user, isAuthenticated, isAdmin, logout } = useAuth();
    const navigate = useNavigate();
    const [mobileOpen, setMobileOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState(null);
    const [showSearch, setShowSearch] = useState(false);
    const searchRef = useRef(null);
    const debounceRef = useRef(null);
    const [userMenuOpen, setUserMenuOpen] = useState(false);
    const userMenuRef = useRef(null);

    // Cerrar buscador y menú de usuario al hacer clic fuera
    useEffect(() => {
        const handler = (e) => {
            if (searchRef.current && !searchRef.current.contains(e.target)) {
                setShowSearch(false);
            }
            if (userMenuRef.current && !userMenuRef.current.contains(e.target)) {
                setUserMenuOpen(false);
            }
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    // Búsqueda con debounce
    const handleSearchInput = (value) => {
        setSearchQuery(value);
        if (debounceRef.current) clearTimeout(debounceRef.current);

        if (value.trim().length < 2) {
            setSearchResults(null);
            return;
        }

        debounceRef.current = setTimeout(async () => {
            try {
                const res = await apiClient.get('/search', { params: { q: value } });
                setSearchResults(res.data);
                setShowSearch(true);
            } catch {
                setSearchResults(null);
            }
        }, 300);
    };

    const handleSearchSubmit = (e) => {
        e.preventDefault();
        if (searchQuery.trim()) {
            navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
            setShowSearch(false);
            setSearchQuery('');
        }
    };

    const handleLogout = async () => {
        setMobileOpen(false);
        await logout();
        navigate('/');
    };

    const avatarUrl = user?.avatar_url
        || `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || 'U')}&size=80&background=FFA903&color=000&bold=true`;

    const navLinks = [
        { to: '/books', label: 'Libros' },
        { to: '/authors', label: 'Autores' },
        { to: '/lists', label: 'Listas' },
        { to: '/community', label: 'Comunidad' },
    ];

    // Menú de usuario desplegable — centraliza los enlaces duplicados
    const userMenuItems = [
        { to: '/dashboard',          label: 'PERFIL' },
        { to: '/dashboard/social',   label: 'SOCIAL' },
        { to: '/dashboard/lists',    label: 'MIS LISTAS' },
        { to: '/dashboard/reviews',  label: 'MIS RESEÑAS' },
        { to: '/dashboard/profile',  label: 'EDITAR PERFIL' },
        { to: '/dashboard/settings', label: 'AJUSTES', isLast: true },
    ];

    return (
        <header className="bg-brand-blue text-white border-b-4 border-black sticky top-0 z-50">
            <div className="max-w-7xl mx-auto px-4">
                <div className="flex items-center justify-between h-16">
                    {/* Logo */}
                    <Link to="/" className="text-3xl font-display font-black tracking-tighter uppercase shrink-0 [text-shadow:1.2px_1.2px_0px_#000,-1.2px_-1.2px_0px_#000,1.2px_-1.2px_0px_#000,-1.2px_1.2px_0px_#000]">
                        Block<span className="text-brand-yellow">Book</span>ster
                    </Link>

                    {/* Navegación desktop */}
                    <nav className="hidden md:flex items-center gap-1">
                        {navLinks.map((link) => (
                            <Link
                                key={link.to}
                                to={link.to}
                                className="text-xs font-bold uppercase tracking-wider px-3 py-2 hover:bg-white/10 transition-colors"
                            >
                                {link.label}
                            </Link>
                        ))}
                    </nav>

                    {/* Buscador desktop */}
                    <div ref={searchRef} className="hidden md:block relative">
                        <form onSubmit={handleSearchSubmit}>
                            <input
                                type="text"
                                placeholder="Buscar libros, autores..."
                                value={searchQuery}
                                onChange={(e) => handleSearchInput(e.target.value)}
                                className="w-48 lg:w-64 px-3 py-1.5 text-xs text-black border-2 border-black bg-white focus:outline-none focus:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
                            />
                        </form>

                        {/* Resultados del buscador rápido */}
                        {showSearch && searchResults && (
                            <div className="absolute right-0 top-full mt-2 w-80 bg-white border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] z-50 max-h-96 overflow-y-auto">
                                {searchResults.total_results === 0 ? (
                                    <p className="p-4 text-xs text-gray-500 font-bold uppercase text-center">
                                        Sin resultados
                                    </p>
                                ) : (
                                    <div className="divide-y-2 divide-black">
                                        {/* Libros */}
                                        {searchResults.books?.length > 0 && (
                                            <div className="p-3">
                                                <p className="text-xs font-black uppercase text-brand-blue mb-2">Libros</p>
                                                {searchResults.books.slice(0, 3).map((book) => (
                                                    <Link
                                                        key={book.isbn}
                                                        to={`/books/${book.isbn}`}
                                                        onClick={() => setShowSearch(false)}
                                                        className="block text-sm text-black font-medium hover:text-brand-blue py-1"
                                                    >
                                                        {book.title}
                                                    </Link>
                                                ))}
                                            </div>
                                        )}
                                        {/* Autores */}
                                        {searchResults.authors?.length > 0 && (
                                            <div className="p-3">
                                                <p className="text-xs font-black uppercase text-brand-blue mb-2">Autores</p>
                                                {searchResults.authors.slice(0, 3).map((author) => (
                                                    <Link
                                                        key={author.id}
                                                        to={`/authors/${author.id}`}
                                                        onClick={() => setShowSearch(false)}
                                                        className="block text-sm text-black font-medium hover:text-brand-blue py-1"
                                                    >
                                                        {author.full_name || author.name}
                                                    </Link>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                )}
                                {/* Enlace a resultados completos */}
                                <div className="p-2 border-t-2 border-black">
                                    <Link
                                        to={`/search?q=${encodeURIComponent(searchQuery)}`}
                                        onClick={() => setShowSearch(false)}
                                        className="block text-center text-xs font-bold uppercase text-brand-blue hover:underline"
                                    >
                                        Ver todos los resultados →
                                    </Link>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Acciones de usuario */}
                    <div className="hidden md:flex items-center gap-2">
                        {isAuthenticated ? (
                            <div ref={userMenuRef} className="ml-3 relative">
                                <div>
                                    <button
                                        onClick={() => setUserMenuOpen(!userMenuOpen)}
                                        type="button"
                                        className="bg-white border-2 border-black p-1 flex text-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:shadow-none active:translate-x-0.5 active:translate-y-0.5 cursor-pointer"
                                        id="user-menu-button"
                                    >
                                        <span className="sr-only">Abrir menú de usuario</span>
                                        <img
                                            className="h-8 w-8 object-cover border border-black"
                                            src={avatarUrl}
                                            alt={`Avatar de ${user?.name || 'Usuario'}`}
                                            onError={(e) => {
                                                e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || 'U')}&size=80&background=FFA903&color=000&bold=true`;
                                            }}
                                        />
                                    </button>
                                </div>

                                {userMenuOpen && (
                                    <div
                                        className="origin-top-right absolute right-0 mt-2 w-48 bg-white border-2 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] py-1 focus:outline-none z-50 transform transition-all"
                                        role="menu"
                                    >
                                        {isAdmin && (
                                            <Link
                                                to="/admin"
                                                onClick={() => setUserMenuOpen(false)}
                                                className="block px-4 py-2 text-sm text-brand-blue font-black hover:bg-brand-yellow border-b border-gray-100"
                                                role="menuitem"
                                            >
                                                PANEL ADMIN
                                            </Link>
                                        )}
                                        {userMenuItems.map((item) => (
                                            <Link
                                                key={item.to}
                                                to={item.to}
                                                onClick={() => setUserMenuOpen(false)}
                                                className={`block px-4 py-2 text-sm text-black font-bold hover:bg-brand-yellow${item.isLast ? '' : ' border-b border-gray-100'}`}
                                                role="menuitem"
                                            >
                                                {item.label}
                                            </Link>
                                        ))}

                                        <div className="border-t-2 border-black my-1"></div>

                                        <button
                                            onClick={() => {
                                                setUserMenuOpen(false);
                                                void handleLogout();
                                            }}
                                            className="block w-full text-left px-4 py-2 text-sm text-black font-bold hover:bg-red-500 hover:text-white cursor-pointer"
                                            role="menuitem"
                                        >
                                            CERRAR SESIÓN
                                        </button>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="flex items-center gap-3">
                                <Link
                                    to="/login"
                                    className="text-xs font-bold uppercase px-3 py-1.5 bg-white text-black border-2 border-black hover:bg-gray-100"
                                >
                                    INICIA SESIÓN
                                </Link>
                                <Link
                                    to="/register"
                                    className="text-xs font-bold uppercase px-3 py-1.5 bg-brand-yellow text-black border-2 border-black hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
                                >
                                    REGÍSTRATE
                                </Link>
                            </div>
                        )}
                    </div>

                    {/* Botón hamburguesa móvil */}
                    <button
                        onClick={() => setMobileOpen(!mobileOpen)}
                        className="md:hidden text-white text-2xl font-black"
                    >
                        {mobileOpen ? '✕' : '☰'}
                    </button>
                </div>
            </div>

            {/* Menú móvil */}
            {mobileOpen && (
                <div className="md:hidden border-t-2 border-black bg-brand-blue px-4 pb-4">
                    {/* Buscador móvil */}
                    <form onSubmit={handleSearchSubmit} className="my-3">
                        <input
                            type="text"
                            placeholder="Buscar..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full px-3 py-2 text-sm text-black border-2 border-black"
                        />
                    </form>

                    {navLinks.map((link) => (
                        <Link
                            key={link.to}
                            to={link.to}
                            onClick={() => setMobileOpen(false)}
                            className="block text-sm font-bold uppercase py-2 border-b border-white/20"
                        >
                            {link.label}
                        </Link>
                    ))}

                    <div className="mt-4 flex flex-col gap-2">
                        {isAuthenticated ? (
                            <>
                                <Link to="/dashboard" onClick={() => setMobileOpen(false)} className="neo-btn-primary text-center text-sm">
                                    Mi perfil
                                </Link>
                                <button onClick={handleLogout} className="neo-btn-secondary text-sm">
                                    Cerrar sesión
                                </button>
                            </>
                        ) : (
                            <>
                                <Link to="/login" onClick={() => setMobileOpen(false)} className="neo-btn-secondary text-center text-sm">
                                    Entrar
                                </Link>
                                <Link to="/register" onClick={() => setMobileOpen(false)} className="neo-btn-primary text-center text-sm">
                                    Registrarse
                                </Link>
                            </>
                        )}
                    </div>
                </div>
            )}
        </header>
    );
}

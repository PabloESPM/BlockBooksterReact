import { Outlet, Link, useLocation } from 'react-router-dom';

/**
 * AuthLayout — Replicates layouts/auth.blade.php
 * Blue background with dot pattern, centered card with Neo-Brutalism styling.
 */
export default function AuthLayout() {
    return (
        <div
            className="font-body bg-brand-blue flex items-center justify-center min-h-screen p-4"
            style={{
                backgroundImage: 'radial-gradient(#1e3a8a 1px, transparent 1px)',
                backgroundSize: '20px 20px',
            }}
        >
            <div className="w-full max-w-md">
                {/* Logo */}
                <div className="flex justify-center mb-8">
                    <Link
                        to="/"
                        className="text-4xl font-display font-black text-white tracking-tighter uppercase"
                        style={{ textShadow: '4px 4px 0px #000' }}
                    >
                        Block<span className="text-brand-yellow">Book</span>ster
                    </Link>
                </div>

                {/* Auth Card */}
                <div className="bg-white border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] p-8">
                    <Outlet />
                </div>

                <div className="mt-8 text-center text-xs font-bold text-white uppercase tracking-widest">
                    Identidad verificada
                </div>
            </div>
        </div>
    );
}

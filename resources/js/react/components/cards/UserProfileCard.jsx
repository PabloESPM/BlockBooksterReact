import React from 'react';
import FollowButton from '../ui/FollowButton';

/**
 * UserProfileCard — Cabecera de perfil estilo Neo-Brutalism.
 * Recibe:
 * - user: Objeto del usuario (profile)
 * - readBooksCount: Número de libros leídos
 * - readingBooksCount: Número de libros leyendo
 * - isOwner: Boolean si el perfil es del propio usuario autenticado
 */
export default function UserProfileCard({
    user,
    readBooksCount = 0,
    readingBooksCount = 0,
    isOwner = false,
    onFollowToggle = null,
}) {
    const fallbackUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&size=200&background=FFA903&color=000&bold=true`;
    const avatarUrl = user.avatar_url || fallbackUrl;
    const showFollowButton = user.can_follow && !isOwner;

    return (
        <div className="neo-card p-6 mb-8">
            <div className="flex flex-col md:flex-row gap-6 items-center md:items-start">
                {/* Avatar */}
                <div className="w-32 h-32 bg-gray-200 rounded-full border-2 border-black flex-shrink-0 overflow-hidden">
                    <img
                        src={avatarUrl}
                        alt={user.name}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                            e.target.src = fallbackUrl;
                        }}
                    />
                </div>

                {/* Info usuario */}
                <div className="flex-1 text-center md:text-left">
                    <h1 className="text-4xl font-black uppercase font-display mb-2">{user.name}</h1>
                    {user.country && (
                        <p className="text-sm font-bold text-gray-600 uppercase mb-4">
                            📍 {user.country.name}
                        </p>
                    )}

                    {/* Biografía del usuario (solo se muestra si tiene contenido) */}
                    {user.bio && (
                        <p className="text-sm text-gray-700 mb-4 max-w-prose mx-auto md:mx-0">{user.bio}</p>
                    )}

                    {/* Estadísticas del usuario */}
                    {(!user.can_view_content && !isOwner) ? (
                        <div className="grid grid-cols-2 gap-4 mt-6 max-w-xs mx-auto md:mx-0">
                            <div className="text-center md:text-left">
                                <div className="text-3xl font-black">{user.followers_count ?? 0}</div>
                                <div className="text-xs font-bold uppercase text-gray-600">Seguidores</div>
                            </div>
                            <div className="text-center md:text-left">
                                <div className="text-3xl font-black">{user.following_count ?? 0}</div>
                                <div className="text-xs font-bold uppercase text-gray-600">Siguiendo</div>
                            </div>
                        </div>
                    ) : (
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
                            <div className="text-center">
                                <div className="text-3xl font-black">{readBooksCount}</div>
                                <div className="text-xs font-bold uppercase text-gray-600">Libros Leídos</div>
                            </div>
                            <div className="text-center">
                                <div className="text-3xl font-black">{readingBooksCount}</div>
                                <div className="text-xs font-bold uppercase text-gray-600">Leyendo</div>
                            </div>
                            <div className="text-center">
                                <div className="text-3xl font-black">{user.lists_count ?? 0}</div>
                                <div className="text-xs font-bold uppercase text-gray-600">Listas</div>
                            </div>
                            <div className="text-center">
                                <div className="text-3xl font-black">{user.reviews_count ?? 0}</div>
                                <div className="text-xs font-bold uppercase text-gray-600">Reseñas</div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Botón Seguir */}
                {showFollowButton && (
                    <div className="flex-shrink-0">
                        <FollowButton
                            type="user"
                            id={user.id}
                            initialFollowing={!!user.is_following}
                            initialCount={user.followers_count ?? 0}
                            onToggle={onFollowToggle}
                        />
                    </div>
                )}
            </div>
        </div>
    );
}

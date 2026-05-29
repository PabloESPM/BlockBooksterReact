import { Link } from 'react-router-dom';

/**
 * Tarjeta de autor estilo Neo-Brutalism.
 */
export default function AuthorCard({ author }) {
    const fallbackUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(author.full_name || author.name)}&size=200&background=0E3FA9&color=fff&bold=true`;
    const photoUrl = author.photo
        ? author.photo
        : (author.photo_url
            ? `${window.location.origin}/storage/${author.photo_url.replace(/^\/?(storage\/)?/, '')}`
            : fallbackUrl);

    return (
        <Link
            to={`/authors/${author.id}`}
            className="block neo-card neo-shadow-hover overflow-hidden group"
        >
            {/* Foto */}
            <div className="aspect-square overflow-hidden border-b-2 border-black">
                <img
                    src={photoUrl}
                    alt={author.full_name || author.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    loading="lazy"
                    onError={(e) => {
                        e.target.src = fallbackUrl;
                    }}
                />
            </div>

            {/* Información */}
            <div className="p-3 text-center">
                <h3 className="font-bold text-sm mb-1 line-clamp-1">
                    {author.full_name || author.name}
                </h3>
                {author.books_count !== undefined && (
                    <p className="text-xs text-gray-500 font-medium">
                        {author.books_count} libro{author.books_count !== 1 ? 's' : ''}
                    </p>
                )}
            </div>
        </Link>
    );
}

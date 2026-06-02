import { Link } from 'react-router-dom';

/**
 * Tarjeta de Género estilo Neo-Brutalism.
 * Muestra el nombre del género y un listado de sus libros destacados con puntuación.
 */
export default function GenreCard({ genre }) {
    const books = genre.top_books || [];

    return (
        <div className="neo-card p-6 h-full hover:bg-gray-50 transition-all hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:-translate-y-1 cursor-default group">
            <h3 className="text-2xl font-black uppercase mb-4 border-b-2 border-black pb-2 group-hover:text-brand-blue transition-colors">
                {genre.name}
            </h3>

            <div className="space-y-3">
                {books.length > 0 ? (
                    books.map((book) => {
                        const rating = book.reviews_avg_rating ?? book.average_rating ?? 0;
                        return (
                            <div key={book.isbn} className="flex justify-between items-center text-sm font-bold border-b border-gray-300 pb-2 last:border-0">
                                <Link
                                    to={`/books/${book.isbn}`}
                                    className="hover:text-brand-blue transition-colors line-clamp-1 pr-4"
                                >
                                    {book.title}
                                </Link>
                                <span className="text-gray-500 whitespace-nowrap bg-gray-100 px-1.5 py-0.5 border border-black/10">
                                    {Number(rating).toFixed(1)}★
                                </span>
                            </div>
                        );
                    })
                ) : (
                    <p className="text-xs italic text-gray-400 uppercase">Sin valoraciones recientes</p>
                )}
            </div>
        </div>
    );
}

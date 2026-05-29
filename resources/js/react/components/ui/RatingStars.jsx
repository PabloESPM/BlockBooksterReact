
/**
 * Componente de estrellas de valoración interactivas (1-5).
 * Modo lectura: muestra estrellas rellenas según el rating.
 * Modo edición: permite hacer clic para seleccionar rating.
 */
export default function RatingStars({ rating = 0, onChange = null, size = 'md' }) {
    const editable = typeof onChange === 'function';
    const stars = [1, 2, 3, 4, 5];

    const sizeClasses = {
        sm: 'w-4 h-4',
        md: 'w-5 h-5',
        lg: 'w-6 h-6',
    };

    return (
        <div className="flex items-center gap-0.5">
            {stars.map((star) => (
                <button
                    key={star}
                    type="button"
                    onClick={() => editable && onChange(star)}
                    className={`${editable ? 'cursor-pointer hover:scale-110' : 'cursor-default'} transition-transform`}
                    disabled={!editable}
                    aria-label={`${star} estrella${star > 1 ? 's' : ''}`}
                >
                    <svg
                        className={`${sizeClasses[size]} ${star <= rating ? 'text-brand-yellow' : 'text-gray-300'}`}
                        fill="currentColor"
                        viewBox="0 0 20 20"
                    >
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                </button>
            ))}
            {/* Mostrar número de rating si está en modo lectura */}
            {!editable && rating > 0 && (
                <span className="ml-1 text-xs font-bold text-gray-600">
                    {Number(rating).toFixed(1)}
                </span>
            )}
        </div>
    );
}

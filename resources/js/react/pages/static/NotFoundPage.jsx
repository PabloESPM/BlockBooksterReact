
export default function NotFoundPage() {
    return (
        <div className="max-w-7xl mx-auto px-4 py-20 text-center">
            <div className="neo-card p-12 max-w-md mx-auto">
                <span className="text-6xl font-black text-brand-yellow block mb-4">404</span>
                <h1 className="text-2xl font-black uppercase mb-2">Página no encontrada</h1>
                <p className="text-sm text-gray-500 mb-6">La página que buscas no existe o ha sido movida.</p>
                <a href="/" className="neo-btn-primary text-sm">Volver al inicio</a>
            </div>
        </div>
    );
}

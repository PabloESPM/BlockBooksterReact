import { Outlet } from 'react-router-dom';
import Navbar from '../components/navigation/Navbar';
import Footer from '../components/navigation/Footer';
import AddReviewModal from '../components/modals/AddReviewModal';
import AddToListModal from '../components/modals/AddToListModal';

/**
 * AppLayout — Layout principal de la aplicación.
 * Incluye Navbar arriba, contenido central y Footer abajo.
 * Equivale a layouts/app.blade.php.
 */
export default function AppLayout() {
    return (
        <div className="flex flex-col min-h-screen">
            <Navbar />
            <main className="flex-grow">
                <Outlet />
            </main>
            <Footer />

            {/* Modales globales de la aplicación */}
            <AddReviewModal />
            <AddToListModal />
        </div>
    );
}

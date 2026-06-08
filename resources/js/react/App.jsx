import { Routes, Route } from 'react-router-dom';

// Layouts
import AuthLayout from './layouts/AuthLayout';
import AppLayout from './layouts/AppLayout';
import DashboardLayout from './layouts/DashboardLayout';
import AdminLayout from './layouts/AdminLayout';

// Guardias de ruta
import ProtectedRoute from './components/auth/ProtectedRoute';
import AdminRoute from './components/auth/AdminRoute';

// Páginas de autenticación
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';
import ForgotPasswordPage from './pages/auth/ForgotPasswordPage';
import ResetPasswordPage from './pages/auth/ResetPasswordPage';

// Páginas públicas
import HomePage from './pages/HomePage';
import BooksIndexPage from './pages/books/BooksIndexPage';
import BookShowPage from './pages/books/BookShowPage';
import AuthorsIndexPage from './pages/authors/AuthorsIndexPage';
import AuthorShowPage from './pages/authors/AuthorShowPage';
import ListsIndexPage from './pages/lists/ListsIndexPage';
import ListShowPage from './pages/lists/ListShowPage';
import CommunityPage from './pages/users/CommunityPage';
import UserProfilePage from './pages/users/UserProfilePage';
import SearchResultsPage from './pages/search/SearchResultsPage';

// Dashboard (protegido)
import DashboardIndexPage from './pages/dashboard/DashboardIndexPage';
import DashboardProfilePage from './pages/dashboard/DashboardProfilePage';
import DashboardListsPage from './pages/dashboard/DashboardListsPage';
import DashboardReviewsPage from './pages/dashboard/DashboardReviewsPage';
import DashboardSocialPage from './pages/dashboard/DashboardSocialPage';
import DashboardSettingsPage from './pages/dashboard/DashboardSettingsPage';

// Admin (protegido, solo admin/worker)
import AdminDashboardPage from './pages/admin/AdminDashboardPage';
import AdminBooksPage from './pages/admin/books/AdminBooksPage';
import AdminBookEditPage from './pages/admin/books/AdminBookEditPage';
import AdminAuthorsPage from './pages/admin/authors/AdminAuthorsPage';
import AdminAuthorEditPage from './pages/admin/authors/AdminAuthorEditPage';
import AdminUsersPage from './pages/admin/users/AdminUsersPage';
import AdminReviewsPage from './pages/admin/reviews/AdminReviewsPage';
import AdminListPage from './pages/admin/lists/AdminListPage';

// Páginas estáticas
import {
    AboutPage,
    ContactPage,
    FaqPage,
    PrivacyPage,
    TermsPage,
    CookiesPage,
    JobsPage,
} from './pages/static/StaticPages';
import NotFoundPage from './pages/static/NotFoundPage';

export default function App() {
    return (
        <Routes>
            {/* ── Rutas de autenticación (sin Navbar/Footer) ── */}
            <Route element={<AuthLayout />}>
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />
                <Route path="/forgot-password" element={<ForgotPasswordPage />} />
                <Route path="/reset-password" element={<ResetPasswordPage />} />
            </Route>

            {/* ── Panel de administración (layout propio, solo admin/worker) ── */}
            <Route
                path="/admin"
                element={
                    <AdminRoute>
                        <AdminLayout />
                    </AdminRoute>
                }
            >
                <Route index element={<AdminDashboardPage />} />
                <Route path="books" element={<AdminBooksPage />} />
                <Route path="books/create" element={<AdminBookEditPage />} />
                <Route path="books/:isbn/edit" element={<AdminBookEditPage />} />
                <Route path="authors" element={<AdminAuthorsPage />} />
                <Route path="authors/create" element={<AdminAuthorEditPage />} />
                <Route path="authors/:id/edit" element={<AdminAuthorEditPage />} />
                <Route path="users" element={<AdminUsersPage />} />
                <Route path="reviews" element={<AdminReviewsPage />} />
                <Route path="lists" element={<AdminListPage />} />
            </Route>

            {/* ── Rutas con layout principal (Navbar + Footer) ── */}
            <Route element={<AppLayout />}>
                {/* Públicas */}
                <Route path="/" element={<HomePage />} />
                <Route path="/books" element={<BooksIndexPage />} />
                <Route path="/books/:isbn" element={<BookShowPage />} />
                <Route path="/authors" element={<AuthorsIndexPage />} />
                <Route path="/authors/:id" element={<AuthorShowPage />} />
                <Route path="/lists" element={<ListsIndexPage />} />
                <Route path="/lists/:id" element={<ListShowPage />} />
                <Route path="/community" element={<CommunityPage />} />
                <Route path="/users/:id" element={<UserProfilePage />} />
                <Route path="/search" element={<SearchResultsPage />} />

                {/* Estáticas */}
                <Route path="/about" element={<AboutPage />} />
                <Route path="/contact" element={<ContactPage />} />
                <Route path="/faq" element={<FaqPage />} />
                <Route path="/privacy" element={<PrivacyPage />} />
                <Route path="/terms" element={<TermsPage />} />
                <Route path="/cookies" element={<CookiesPage />} />
                <Route path="/jobs" element={<JobsPage />} />

                {/* ── Dashboard (protegido, requiere autenticación) ── */}
                <Route
                    path="/dashboard"
                    element={
                        <ProtectedRoute>
                            <DashboardLayout />
                        </ProtectedRoute>
                    }
                >
                    <Route index element={<DashboardIndexPage />} />
                    <Route path="profile" element={<DashboardProfilePage />} />
                    <Route path="lists" element={<DashboardListsPage />} />
                    <Route path="reviews" element={<DashboardReviewsPage />} />
                    <Route path="social" element={<DashboardSocialPage />} />
                    <Route path="settings" element={<DashboardSettingsPage />} />
                </Route>

                {/* 404 */}
                <Route path="*" element={<NotFoundPage />} />
            </Route>
        </Routes>
    );
}

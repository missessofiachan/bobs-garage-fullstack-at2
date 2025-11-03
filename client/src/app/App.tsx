import { Suspense, lazy } from 'react';
import { Container } from 'react-bootstrap';
import { Routes, Route } from 'react-router-dom';
import ProtectedRoute, { AdminRoute } from '../routes/ProtectedRoute';
import NavBar from '../components/NavBar';
import ErrorBoundary from '../pages/Error';
// import Loading from './components/ui/Loading';
import Loading from '../components/ui/Loading';
import ScrollToTop from './ScrollToTop.tsx';
import Footer from '../components/Footer';
import { lightTheme, darkTheme } from '../styles/theme.css.ts';

// Lazy-load pages to reduce initial bundle size
const Home = lazy(() => import('../pages/Home'));
const About = lazy(() => import('../pages/About'));
const Services = lazy(() => import('../pages/Services'));
const Staff = lazy(() => import('../pages/Staff'));
const Login = lazy(() => import('../pages/Login'));
const Register = lazy(() => import('../pages/Register'));
const Admin = lazy(() => import('../pages/Admin'));
const Dashboard = lazy(() => import('../pages/Admin/Dashboard'));
const ServicesAdmin = lazy(() => import('../pages/Admin/ServicesAdmin'));
const StaffAdmin = lazy(() => import('../pages/Admin/StaffAdmin'));
const UsersAdmin = lazy(() => import('../pages/Admin/UsersAdmin'));
const Profile = lazy(() => import('../pages/Profile'));
const Settings = lazy(() => import('../pages/Settings'));
const NotFound = lazy(() => import('../pages/NotFound'));

export default function App() {
  return (
    <div
      className={
        document.documentElement.getAttribute('data-bs-theme') === 'light'
          ? lightTheme
          : darkTheme
      }
    >
      <NavBar />
      <ErrorBoundary>
        <ScrollToTop />
        <Container className="py-4">
          <Suspense fallback={<Loading message="Loading page…" />}>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/about" element={<About />} />
              <Route path="/services" element={<Services />} />
              <Route path="/staff" element={<Staff />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route
                path="/admin"
                element={
                  <AdminRoute>
                    <Admin />
                  </AdminRoute>
                }
              />
              <Route
                path="/admin/dashboard"
                element={
                  <AdminRoute>
                    <Dashboard />
                  </AdminRoute>
                }
              />
              <Route
                path="/profile"
                element={
                  <ProtectedRoute>
                    <Profile />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/settings"
                element={
                  <ProtectedRoute>
                    <Settings />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/services"
                element={
                  <AdminRoute>
                    <ServicesAdmin />
                  </AdminRoute>
                }
              />
              <Route
                path="/admin/staff"
                element={
                  <AdminRoute>
                    <StaffAdmin />
                  </AdminRoute>
                }
              />
              <Route
                path="/admin/users"
                element={
                  <AdminRoute>
                    <UsersAdmin />
                  </AdminRoute>
                }
              />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Suspense>
        </Container>
      </ErrorBoundary>
      <Footer />
    </div>
  );
}

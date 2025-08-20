import { Container } from 'react-bootstrap';
import { Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import About from './pages/About';
import Services from './pages/Services';
import Staff from './pages/Staff';
import Login from './pages/Login';
import Register from './pages/Register';
import Admin from './pages/Admin';
import Dashboard from './pages/Admin/Dashboard';
import ServicesAdmin from './pages/Admin/ServicesAdmin';
import StaffAdmin from './pages/Admin/StaffAdmin';
import UsersAdmin from './pages/Admin/UsersAdmin';
import ProtectedRoute, { AdminRoute } from './components/ProtectedRoute';
import NavBar from './components/layout/NavBar';
import Profile from './pages/Profile';
import NotFound from './pages/NotFound';
import ErrorBoundary from './pages/Error';

export default function App() {
  return (
    <>
      <NavBar />
      <ErrorBoundary>
        <Container className="py-4">
          <Routes>
          <Route path="/" element={<Home/>}/>
          <Route path="/about" element={<About/>}/>
          <Route path="/services" element={<Services/>}/>
          <Route path="/staff" element={<Staff/>}/>
          <Route path="/login" element={<Login/>}/>
          <Route path="/register" element={<Register/>}/>
          <Route path="/admin" element={<Admin/>}/>
          <Route path="/admin/dashboard" element={<AdminRoute><Dashboard/></AdminRoute>} />
          <Route path="/profile" element={<ProtectedRoute><Profile/></ProtectedRoute>} />
          <Route path="/admin/services" element={<AdminRoute><ServicesAdmin/></AdminRoute>} />
          <Route path="/admin/staff" element={<AdminRoute><StaffAdmin/></AdminRoute>} />
          <Route path="/admin/users" element={<AdminRoute><UsersAdmin/></AdminRoute>} />
            <Route path="*" element={<NotFound/>}/>
          </Routes>
        </Container>
      </ErrorBoundary>
    </>
  );
}

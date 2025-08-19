import { Container } from 'react-bootstrap';
import { Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import About from './pages/About';
import Services from './pages/Services';
import Login from './pages/Login';
import Register from './pages/Register';
// import Admin from './pages/Admin';
import Admin from './pages/Admin';
import Dashboard from './pages/Admin/Dashboard';
import ServicesAdmin from './pages/Admin/ServicesAdmin';
import StaffAdmin from './pages/Admin/StaffAdmin';
import UsersAdmin from './pages/Admin/UsersAdmin';
import { AdminRoute } from './components/ProtectedRoute';
import NavBar from './components/layout/NavBar';

export default function App() {
  return (
    <>
  <NavBar />

      <Container className="py-4">
        <Routes>
          <Route path="/" element={<Home/>}/>
          <Route path="/about" element={<About/>}/>
          <Route path="/services" element={<Services/>}/>
          <Route path="/login" element={<Login/>}/>
          <Route path="/register" element={<Register/>}/>
          <Route path="/admin" element={<Admin/>}/>
          <Route path="/admin/dashboard" element={<AdminRoute><Dashboard/></AdminRoute>} />
          <Route path="/admin/services" element={<AdminRoute><ServicesAdmin/></AdminRoute>} />
          <Route path="/admin/staff" element={<AdminRoute><StaffAdmin/></AdminRoute>} />
          <Route path="/admin/users" element={<AdminRoute><UsersAdmin/></AdminRoute>} />
          <Route path="*" element={<h1>404 Not Found</h1>}/>
        </Routes>
      </Container>
    </>
  );
}

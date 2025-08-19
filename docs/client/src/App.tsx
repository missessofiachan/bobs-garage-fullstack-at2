import { Container, Nav, Navbar } from 'react-bootstrap';
import { Routes, Route, Link } from 'react-router-dom';
import Home from './pages/Home';
import About from './pages/About';
import Services from './pages/Services';
import Login from './pages/Login';
import Register from './pages/Register';
import Admin from './pages/Admin';

export default function App() {
  return (
    <>
      <Navbar bg="dark" data-bs-theme="dark"><Container>
        <Navbar.Brand as={Link} to="/">Bob's Garage</Navbar.Brand>
        <Nav className="me-auto">
          <Nav.Link as={Link} to="/about">About</Nav.Link>
          <Nav.Link as={Link} to="/services">Services</Nav.Link>
          <Nav.Link as={Link} to="/login">Login</Nav.Link>
          <Nav.Link as={Link} to="/register">Register</Nav.Link>
          <Nav.Link as={Link} to="/admin">Admin</Nav.Link>
        </Nav>
      </Container></Navbar>

      <Container className="py-4">
        <Routes>
          <Route path="/" element={<Home/>}/>
          <Route path="/about" element={<About/>}/>
          <Route path="/services" element={<Services/>}/>
          <Route path="/login" element={<Login/>}/>
          <Route path="/register" element={<Register/>}/>
          <Route path="/admin" element={<Admin/>}/>
          <Route path="*" element={<h1>404 Not Found</h1>}/>
        </Routes>
      </Container>
    </>
  );
}

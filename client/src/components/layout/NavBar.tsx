import { Container, Nav, Navbar, Button } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { useEffect, useState } from 'react';

export default function NavBar() {
  const [theme, setTheme] = useState<string>(() => localStorage.getItem('theme') || 'dark');

  useEffect(() => {
    // bootstrap supports data-bs-theme on html/body
    document.documentElement.setAttribute('data-bs-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => setTheme(t => (t === 'dark' ? 'light' : 'dark'));

  return (
    <Navbar bg={theme} data-bs-theme={theme}>
      <Container>
        <Navbar.Brand as={Link} to="/">Bob's Garage</Navbar.Brand>
        <Nav className="me-auto">
          <Nav.Link as={Link} to="/about">About</Nav.Link>
          <Nav.Link as={Link} to="/services">Services</Nav.Link>
          <Nav.Link as={Link} to="/staff">Staff</Nav.Link>
          <Nav.Link as={Link} to="/login">Login</Nav.Link>
          <Nav.Link as={Link} to="/register">Register</Nav.Link>
          <Nav.Link as={Link} to="/admin">Admin</Nav.Link>
        </Nav>
        <div className="d-flex align-items-center gap-2">
          <span className="text-body-secondary" style={{ fontSize: 12 }}>{theme === 'dark' ? 'Dark' : 'Light'} mode</span>
          <Button size="sm" variant={theme === 'dark' ? 'outline-light' : 'outline-dark'} onClick={toggleTheme}>
            Toggle
          </Button>
        </div>
      </Container>
    </Navbar>
  );
}

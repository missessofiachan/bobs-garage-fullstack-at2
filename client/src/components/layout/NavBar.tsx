import { Container, Nav, Navbar, Button, NavDropdown, Spinner } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { useAppSelector, useAppDispatch } from '../../a/hooks';
import { clearAuth } from '../../slices/auth.slice';
import api, { clearAccessToken } from '../../api/axios';
import { lightTheme, darkTheme } from '../../styles/theme.css';

export default function NavBar() {
  const [theme, setTheme] = useState<string>(() => localStorage.getItem('theme') || 'dark');

  useEffect(() => {
    // bootstrap supports data-bs-theme on html/body
    document.documentElement.setAttribute('data-bs-theme', theme);
    localStorage.setItem('theme', theme);
  // apply vanilla-extract theme class on <html>
  document.documentElement.classList.remove(lightTheme, darkTheme);
  document.documentElement.classList.add(theme === 'light' ? lightTheme : darkTheme);
  }, [theme]);

  const toggleTheme = () => setTheme(t => (t === 'dark' ? 'light' : 'dark'));

  const { accessToken, role, email } = useAppSelector(s => s.auth);
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const [loggingOut, setLoggingOut] = useState(false);

  const onLogout = async () => {
    setLoggingOut(true);
    try {
      await api.post('/auth/logout');
    } catch {
      // ignore server errors
    } finally {
      clearAccessToken();
      dispatch(clearAuth());
      setLoggingOut(false);
      navigate('/');
    }
  };

  return (
    <Navbar bg={theme} data-bs-theme={theme}>
      <Container>
        <Navbar.Brand as={Link} to="/">Bob's Garage</Navbar.Brand>
        <Nav className="me-auto">
          <Nav.Link as={Link} to="/about">About</Nav.Link>
          <Nav.Link as={Link} to="/services">Services</Nav.Link>
          <Nav.Link as={Link} to="/staff">Staff</Nav.Link>
          {!accessToken ? (
            <>
              <Nav.Link as={Link} to="/login">Login</Nav.Link>
              <Nav.Link as={Link} to="/register">Register</Nav.Link>
            </>
          ) : (
            <>
              <NavDropdown title={email ?? 'Account'} id="nav-account-dropdown">
                  <NavDropdown.Item as={Link} to="/profile">Profile</NavDropdown.Item>
                  <NavDropdown.Item as={Link} to="/settings">Settings</NavDropdown.Item>
                <NavDropdown.Divider />
                  <NavDropdown.Item onClick={onLogout} disabled={loggingOut}>
                    {loggingOut ? (
                      <span className="d-inline-flex align-items-center gap-2"><Spinner size="sm" animation="border" role="status" aria-hidden="true" /> Logging out…</span>
                    ) : 'Logout'}
                  </NavDropdown.Item>
              </NavDropdown>
            </>
          )}
          {role === 'admin' && <Nav.Link as={Link} to="/admin">Admin</Nav.Link>}
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

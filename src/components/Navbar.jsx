import React from 'react';
import { Navbar as BootstrapNavbar, Nav, Container } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { clearToken } from '../slices/authSlice';
import '../CSS/Navbar.css';

function Navbar() {
  const { access } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleLogout = () => {
    // Clear tokens from localStorage
    localStorage.removeItem('token');
    localStorage.removeItem('refresh');
    dispatch(clearToken());
    navigate('/login', { replace: true }); // Use replace to prevent going back to protected routes
  };

  return (
    <BootstrapNavbar bg="dark" variant="dark" expand="lg" className="custom-navbar">
      <Container>
        <BootstrapNavbar.Brand as={Link} to="/" aria-label="CRM Home">
          CRM
        </BootstrapNavbar.Brand>
        <BootstrapNavbar.Toggle aria-controls="basic-navbar-nav" aria-label="Toggle navigation" />
        <BootstrapNavbar.Collapse id="basic-navbar-nav">
          <Nav className="me-auto">
            <Nav.Link as={Link} to="/" aria-label="Dashboard">
              Dashboard
            </Nav.Link>
            <Nav.Link as={Link} to="/contacts" aria-label="Contacts">
              Contacts
            </Nav.Link>
            <Nav.Link as={Link} to="/companies" aria-label="Companies">
              Companies
            </Nav.Link>
            <Nav.Link as={Link} to="/opportunities" aria-label="Opportunities">
              Opportunities
            </Nav.Link>
            <Nav.Link as={Link} to="/interactions" aria-label="Interactions">
              Interactions
            </Nav.Link>
            <Nav.Link as={Link} to="/tasks" aria-label="Tasks">
              Tasks
            </Nav.Link>
            <Nav.Link as={Link} to="/settings" aria-label="Settings">
              Settings
            </Nav.Link>
          </Nav>

          <Nav>
            {access ? (
              <Nav.Link onClick={handleLogout} aria-label="Logout">
                Logout
              </Nav.Link>
            ) : (
              <>
                <Nav.Link as={Link} to="/login" aria-label="Login">
                  Login
                </Nav.Link>
                <Nav.Link as={Link} to="/signup" aria-label="Signup">
                  Signup
                </Nav.Link>
              </>
            )}
          </Nav>
        </BootstrapNavbar.Collapse>
      </Container>
    </BootstrapNavbar>
  );
}

export default Navbar;
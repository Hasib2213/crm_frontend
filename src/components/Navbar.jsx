import React from 'react';
import { Navbar as BootstrapNavbar, Nav } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { clearToken } from '../slices/authSlice';
import '../CSS/Navbar.css';

function Navbar() {
  const { access } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleLogout = () => {
    dispatch(clearToken());
    navigate('/login');
  };

  return (
    <BootstrapNavbar bg="dark" variant="dark" expand="lg" className="custom-navbar">
      <BootstrapNavbar.Brand as={Link} to="/">CRM</BootstrapNavbar.Brand>
      <BootstrapNavbar.Toggle aria-controls="basic-navbar-nav" />
      <BootstrapNavbar.Collapse id="basic-navbar-nav">
        <Nav className="me-auto">
          <Nav.Link as={Link} to="/">Dashboard</Nav.Link>
          <Nav.Link as={Link} to="/contacts">Contacts</Nav.Link>
          <Nav.Link as={Link} to="/companies">Companies</Nav.Link>
          <Nav.Link as={Link} to="/opportunities">Opportunities</Nav.Link>
          <Nav.Link as={Link} to="/interactions">Interactions</Nav.Link>
          <Nav.Link as={Link} to="/tasks">Tasks</Nav.Link>
          <Nav.Link as={Link} to="/settings">Settings</Nav.Link>
        </Nav>

        <Nav>
          {access ? (
            <Nav.Link onClick={handleLogout}>Logout</Nav.Link>
          ) : (
            <>
              <Nav.Link as={Link} to="/login">Login</Nav.Link>
              <Nav.Link as={Link} to="/signup">Signup</Nav.Link>
            </>
          )}
        </Nav>
      </BootstrapNavbar.Collapse>
    </BootstrapNavbar>
  );
}

export default Navbar;

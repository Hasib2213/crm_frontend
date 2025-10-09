import React, { useState } from 'react';
import { Form, Button, Container, Alert, Card } from 'react-bootstrap';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import '../CSS/signup.css';


function Signup() {
  const [formData, setFormData] = useState({ username: '', email: '', password: '' });
  const [message, setMessage] = useState('');
  const [variant, setVariant] = useState('info');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000/api';
      const res = await axios.post(`${apiUrl}/signup/`, formData);
      setMessage(res.data.message);
      setVariant('success');
      setFormData({ username: '', email: '', password: '' });
      setTimeout(() => navigate('/login'), 2000);
    } catch (error) {
      setMessage(error.response?.data?.error || 'An error occurred during signup. Please try again.');
      setVariant('danger');
    }
  };

  return (
    <div className="signup-page">
      <Container className="signup-container">
        <Card className="signup-card shadow-lg">
          <Card.Body>
            <h3 className="mb-3 text-center text-light">Signup</h3>
            {message && <Alert variant={variant}>{message}</Alert>}
            <Form onSubmit={handleSubmit}>
              <Form.Group className="mb-3">
                <Form.Label className="text-light">Username</Form.Label>
                <Form.Control
                  type="text"
                  required
                  value={formData.username}
                  onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                  placeholder="Enter username"
                  className="form-control-transparent"
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label className="text-light">Email</Form.Label>
                <Form.Control
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="Enter email"
                  className="form-control-transparent"
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label className="text-light">Password</Form.Label>
                <Form.Control
                  type="password"
                  required
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  placeholder="Enter password"
                  className="form-control-transparent"
                />
              </Form.Group>

              <Button type="submit" className="w-100 signup-btn">
                Signup
              </Button>
            </Form>
          </Card.Body>
        </Card>
      </Container>
    </div>
  );
}

export default Signup;

import React, { useState } from 'react';
import { Form, Button, Container, Alert } from 'react-bootstrap';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

function Signup() {
  const [formData, setFormData] = useState({ username: '', email: '', password: '' });
  const [message, setMessage] = useState('');
  const [variant, setVariant] = useState('info'); // alert type
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    try {
      const res = await axios.post('http://127.0.0.1:8000/api/signup/', formData);
      setMessage(res.data.message);
      setVariant('success');
      setFormData({ username: '', email: '', password: '' }); // clear form
    } catch (error) {
      setMessage(error.response?.data?.error || 'Signup failed');
      setVariant('danger');
    }
  };

  return (
    <Container style={{ maxWidth: '400px', marginTop: '50px' }}>
      <h3 className="mb-3 text-center">Signup</h3>
      {message && <Alert variant={variant}>{message}</Alert>}
      <Form onSubmit={handleSubmit}>
        <Form.Group className="mb-3">
          <Form.Label>Username</Form.Label>
          <Form.Control
            type="text"
            required
            value={formData.username}
            onChange={e => setFormData({ ...formData, username: e.target.value })}
          />
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label>Email</Form.Label>
          <Form.Control
            type="email"
            required
            value={formData.email}
            onChange={e => setFormData({ ...formData, email: e.target.value })}
          />
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label>Password</Form.Label>
          <Form.Control
            type="password"
            required
            value={formData.password}
            onChange={e => setFormData({ ...formData, password: e.target.value })}
          />
        </Form.Group>

        <Button type="submit" className="w-100">Signup</Button>
      </Form>
    </Container>
  );
}

export default Signup;

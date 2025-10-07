import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { Container, Alert, Button } from 'react-bootstrap';

function VerifyEmail() {
  const { token } = useParams();
  const decodedToken = decodeURIComponent(token); // Decode the URL-encoded token
  const [message, setMessage] = useState('');
  const [variant, setVariant] = useState('info'); // For Alert styling

  const apiUrl = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000/api'; // Use environment variable

  useEffect(() => {
    console.log('Received Token:', token); // Debug
    console.log('Decoded Token:', decodedToken); // Debug
    axios
      .get(`${apiUrl}/verify-email/${decodedToken}/`)
      .then((res) => {
        setMessage(res.data.message);
        setVariant('success');
      })
      .catch((err) => {
        setMessage(err.response?.data?.error || 'Verification failed');
        setVariant('danger');
      });
  }, [decodedToken]);

  return (
    <Container style={{ maxWidth: '500px', marginTop: '50px', textAlign: 'center' }}>
      <Alert variant={variant}>{message || 'Verifying...'}</Alert>
      <Link to="/login">
        <Button variant="primary">Go to Login</Button>
      </Link>
    </Container>
  );
}

export default VerifyEmail;
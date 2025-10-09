import React, { useState } from "react";
import { Form, Button, Container, Alert } from "react-bootstrap";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import '../CSS/signup.css';



function Signup() {
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
  });
  const [message, setMessage] = useState("");
  const [variant, setVariant] = useState("info");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");

    try {
      const apiUrl = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000/api";
      const res = await axios.post(`${apiUrl}/signup/`, formData);

      setMessage(res.data.message || "Signup successful!");
      setVariant("success");
      setFormData({ username: "", email: "", password: "" });

      // Redirect to login page after 2 seconds
      setTimeout(() => navigate("/login"), 2000);
    } catch (error) {
      setMessage(
        error.response?.data?.error ||
          "An error occurred during signup. Please try again."
      );
      setVariant("danger");
    }
  };

  return (
    <Container className="signup-container">
      <h3 className="mb-3 text-center">Create an Account</h3>

      {message && <Alert variant={variant}>{message}</Alert>}

      <Form onSubmit={handleSubmit}>
        <Form.Group className="mb-3">
          <Form.Label>Username</Form.Label>
          <Form.Control
            type="text"
            required
            value={formData.username}
            onChange={(e) =>
              setFormData({ ...formData, username: e.target.value })
            }
            placeholder="Enter username"
          />
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label>Email</Form.Label>
          <Form.Control
            type="email"
            required
            value={formData.email}
            onChange={(e) =>
              setFormData({ ...formData, email: e.target.value })
            }
            placeholder="Enter email"
          />
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label>Password</Form.Label>
          <Form.Control
            type="password"
            required
            value={formData.password}
            onChange={(e) =>
              setFormData({ ...formData, password: e.target.value })
            }
            placeholder="Enter password"
          />
        </Form.Group>

        <Button type="submit" variant="primary" className="w-100">
          Sign Up
        </Button>
      </Form>
    </Container>
  );
}

export default Signup;

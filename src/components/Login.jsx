import React, { useState } from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { Form, Button, Container, Alert } from "react-bootstrap";
import axios from "axios";
import { setToken } from "../slices/authSlice";

function Login() {
  const [credentials, setCredentials] = useState({ username: "", password: "" });
  const [error, setError] = useState("");
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const res = await axios.post("http://127.0.0.1:8000/api/token/", credentials);
      const data = res.data;

      // ✅ Correctly extract tokens
      const accessToken = data.access || data.token;
      const refreshToken = data.refresh || null;

      if (accessToken) {
        // ✅ Save tokens in Redux + localStorage
        dispatch(
          setToken({
            access: accessToken,
            refresh: refreshToken,
          })
        );

        localStorage.setItem("token", accessToken);
        if (refreshToken) {
          localStorage.setItem("refresh", refreshToken);
        }

        navigate("/"); // Redirect to Dashboard
      } else {
        setError("No access token received. Please try again.");
      }
    } catch (err) {
      console.error("Login Error:", err.response || err.message);
      if (err.response?.status === 401) {
        setError("Invalid credentials. Please check your username or password.");
      } else {
        setError("Login failed. Please try again.");
      }
    }
  };

  return (
    <Container style={{ maxWidth: "400px", marginTop: "50px" }}>
      <h3 className="mb-3 text-center">Login</h3>
      {error && <Alert variant="danger">{error}</Alert>}

      <Form onSubmit={handleSubmit}>
        <Form.Group className="mb-3">
          <Form.Label>Username</Form.Label>
          <Form.Control
            type="text"
            required
            value={credentials.username}
            onChange={(e) =>
              setCredentials({ ...credentials, username: e.target.value })
            }
          />
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label>Password</Form.Label>
          <Form.Control
            type="password"
            required
            value={credentials.password}
            onChange={(e) =>
              setCredentials({ ...credentials, password: e.target.value })
            }
          />
        </Form.Group>

        <Button type="submit" className="w-100">
          Login
        </Button>
      </Form>
    </Container>
  );
}

export default Login;

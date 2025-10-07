import React, { useState, useEffect } from "react";
import { Table, Button, Container, Modal, Form, Alert } from "react-bootstrap";
import axios from "axios";
import { useSelector } from "react-redux";

function Interactions() {
  const { access } = useSelector((state) => state.auth); // Get access token from Redux
  const [interactions, setInteractions] = useState([]);
  const [contacts, setContacts] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    id: null,
    contact: "",
    company: "",
    type: "call",
    subject: "",
    summary: "",
    next_steps: "",
  });
  const [error, setError] = useState(""); // Added for error feedback
  const [loading, setLoading] = useState(false); // Added for loading state

  const apiUrl = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000/api"; // Use environment variable
  const headers = { Authorization: `Bearer ${access}` };

  // Fetch interactions
  const fetchInteractions = async () => {
    if (!access) {
      setError("No access token available. Please log in.");
      return;
    }
    setLoading(true);
    try {
      const res = await axios.get(`${apiUrl}/interactions/`, { headers });
      setInteractions(res.data.results || res.data);
      setError("");
    } catch (err) {
      console.error("Error fetching interactions:", err);
      setError(err.response?.data?.error || "Failed to fetch interactions. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Fetch dropdown data
  const fetchDropdowns = async () => {
    if (!access) {
      setError("No access token available. Please log in.");
      return;
    }
    setLoading(true);
    try {
      const [contactsRes, companiesRes] = await Promise.all([
        axios.get(`${apiUrl}/contacts/`, { headers }),
        axios.get(`${apiUrl}/companies/`, { headers }),
      ]);
      setContacts(contactsRes.data.results || contactsRes.data);
      setCompanies(companiesRes.data.results || companiesRes.data);
      setError("");
    } catch (err) {
      console.error("Error fetching dropdowns:", err);
      setError(err.response?.data?.error || "Failed to fetch dropdown data. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Load data on mount or when access changes
  useEffect(() => {
    fetchInteractions();
    fetchDropdowns();
  }, [access]);

  // Handle form submission
  const handleSave = async () => {
    if (!access) {
      setError("No access token available. Please log in.");
      return;
    }
    // Basic form validation
    if (!formData.contact || !formData.type || !formData.subject) {
      setError("Please fill in all required fields (Contact, Type, Subject).");
      return;
    }

    const payload = {
      contact: formData.contact,
      company: formData.company || null,
      type: formData.type,
      subject: formData.subject,
      summary: formData.summary || "",
      next_steps: formData.next_steps || "",
    };

    setLoading(true);
    try {
      if (formData.id) {
        await axios.put(`${apiUrl}/interactions/${formData.id}/`, payload, { headers });
      } else {
        await axios.post(`${apiUrl}/interactions/`, payload, { headers });
      }
      setShowModal(false);
      resetForm();
      setError("");
      fetchInteractions();
    } catch (err) {
      console.error("Error saving interaction:", err);
      setError(err.response?.data?.error || "Failed to save interaction. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Handle delete
  const handleDelete = async (id) => {
    if (!access) {
      setError("No access token available. Please log in.");
      return;
    }
    if (!window.confirm("Are you sure you want to delete this interaction?")) return;

    setLoading(true);
    try {
      await axios.delete(`${apiUrl}/interactions/${id}/`, { headers });
      setError("");
      fetchInteractions();
    } catch (err) {
      console.error("Error deleting interaction:", err);
      setError(err.response?.data?.error || "Failed to delete interaction. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Handle edit
  const handleEdit = (inter) => {
    setFormData({
      id: inter.id,
      contact: inter.contact || "",
      company: inter.company || "",
      type: inter.type || "call",
      subject: inter.subject || "",
      summary: inter.summary || "",
      next_steps: inter.next_steps || "",
    });
    setShowModal(true);
    setError("");
  };

  // Reset form
  const resetForm = () => {
    setFormData({
      id: null,
      contact: "",
      company: "",
      type: "call",
      subject: "",
      summary: "",
      next_steps: "",
    });
    setError("");
  };

  return (
    <Container className="mt-4">
      <h2>Interactions</h2>
      {error && <Alert variant="danger">{error}</Alert>}
      {loading && <Alert variant="info">Loading...</Alert>}

      <Button
        variant="primary"
        onClick={() => {
          resetForm();
          setShowModal(true);
        }}
        className="mb-3"
        disabled={loading}
      >
        Add Interaction
      </Button>

      {interactions.length === 0 ? (
        <p>No interactions available.</p>
      ) : (
        <Table striped bordered hover className="mt-3">
          <thead>
            <tr>
              <th>Date</th>
              <th>Contact</th>
              <th>Company</th>
              <th>Type</th>
              <th>Subject</th>
              <th>Summary</th>
              <th>Next Steps</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {interactions.map((inter) => (
              <tr key={inter.id}>
                <td>{inter.date ? new Date(inter.date).toLocaleDateString() : "-"}</td>
                <td>{inter.contact_detail || "-"}</td>
                <td>{inter.company_detail || "-"}</td>
                <td>{inter.type}</td>
                <td>{inter.subject}</td>
                <td>{inter.summary || "-"}</td>
                <td>{inter.next_steps || "-"}</td>
                <td>
                  <Button
                    variant="warning"
                    size="sm"
                    onClick={() => handleEdit(inter)}
                    className="me-2"
                    disabled={loading}
                  >
                    Edit
                  </Button>
                  <Button
                    variant="danger"
                    size="sm"
                    onClick={() => handleDelete(inter.id)}
                    disabled={loading}
                  >
                    Delete
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}

      {/* Add/Edit Modal */}
      <Modal show={showModal} onHide={() => setShowModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>{formData.id ? "Edit Interaction" : "Add Interaction"}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>Contact *</Form.Label>
              <Form.Control
                as="select"
                value={formData.contact}
                onChange={(e) => setFormData({ ...formData, contact: e.target.value })}
                required
                disabled={loading}
              >
                <option value="">Select Contact</option>
                {contacts.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.full_name || "Unknown"}
                  </option>
                ))}
              </Form.Control>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Company</Form.Label>
              <Form.Control
                as="select"
                value={formData.company}
                onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                disabled={loading}
              >
                <option value="">Select Company (Optional)</option>
                {companies.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name || "Unknown"}
                  </option>
                ))}
              </Form.Control>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Type *</Form.Label>
              <Form.Control
                as="select"
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                required
                disabled={loading}
              >
                <option value="call">Call</option>
                <option value="email">Email</option>
                <option value="meeting">Meeting</option>
              </Form.Control>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Subject *</Form.Label>
              <Form.Control
                type="text"
                value={formData.subject}
                onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                required
                placeholder="Enter subject"
                disabled={loading}
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Summary</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                value={formData.summary}
                onChange={(e) => setFormData({ ...formData, summary: e.target.value })}
                placeholder="Enter summary"
                disabled={loading}
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Next Steps</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                value={formData.next_steps}
                onChange={(e) => setFormData({ ...formData, next_steps: e.target.value })}
                placeholder="Enter next steps"
                disabled={loading}
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)} disabled={loading}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleSave} disabled={loading}>
            {loading ? "Saving..." : "Save"}
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
}

export default Interactions;
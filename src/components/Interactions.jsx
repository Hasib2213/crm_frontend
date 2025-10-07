import React, { useState, useEffect } from "react";
import { Table, Button, Container, Modal, Form } from "react-bootstrap";
import axios from "axios";
import { useSelector } from "react-redux";

function Interactions() {
  const { access } = useSelector((state) => state.auth); // ✅ get access token from Redux

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

  // ✅ Fetch interactions
  const fetchInteractions = async () => {
    if (!access) return;
    try {
      const res = await axios.get("/api/interactions/", {
        headers: { Authorization: `Bearer ${access}` },
      });
      setInteractions(res.data.results || res.data);
    } catch (err) {
      console.error("Error fetching interactions:", err);
    }
  };

  // ✅ Fetch dropdowns
  const fetchDropdowns = async () => {
    if (!access) return;
    try {
      const [contactsRes, companiesRes] = await Promise.all([
        axios.get("/api/contacts/", { headers: { Authorization: `Bearer ${access}` } }),
        axios.get("/api/companies/", { headers: { Authorization: `Bearer ${access}` } }),
      ]);

      setContacts(contactsRes.data.results || contactsRes.data);
      setCompanies(companiesRes.data.results || companiesRes.data);
    } catch (err) {
      console.error("Error fetching dropdowns:", err);
    }
  };

  // ✅ Load data on mount or when access changes
  useEffect(() => {
    fetchInteractions();
    fetchDropdowns();
  }, [access]);

  const handleSave = async () => {
    if (!access) return;

    const payload = {
      contact: formData.contact,
      company: formData.company || null,
      type: formData.type,
      subject: formData.subject,
      summary: formData.summary,
      next_steps: formData.next_steps,
    };

    try {
      if (formData.id) {
        // Update interaction
        await axios.put(`/api/interactions/${formData.id}/`, payload, {
          headers: { Authorization: `Bearer ${access}` },
        });
      } else {
        // Create interaction
        await axios.post("/api/interactions/", payload, {
          headers: { Authorization: `Bearer ${access}` },
        });
      }
      setShowModal(false);
      resetForm();
      fetchInteractions();
    } catch (err) {
      console.error("Error saving interaction:", err);
    }
  };

  const handleDelete = async (id) => {
    if (!access) return;
    if (!window.confirm("Are you sure you want to delete this interaction?")) return;

    try {
      await axios.delete(`/api/interactions/${id}/`, {
        headers: { Authorization: `Bearer ${access}` },
      });
      fetchInteractions();
    } catch (err) {
      console.error("Error deleting interaction:", err);
    }
  };

  const handleEdit = (inter) => {
    setFormData({
      id: inter.id,
      contact: inter.contact,
      company: inter.company,
      type: inter.type,
      subject: inter.subject,
      summary: inter.summary,
      next_steps: inter.next_steps,
    });
    setShowModal(true);
  };

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
  };

  return (
    <Container className="mt-4">
      <h2>Interactions</h2>
      <Button
        variant="primary"
        onClick={() => {
          resetForm();
          setShowModal(true);
        }}
      >
        Add Interaction
      </Button>

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
              <td>{inter.date ? new Date(inter.date).toLocaleString() : "-"}</td>
              <td>{inter.contact_detail || "-"}</td>
              <td>{inter.company_detail || "-"}</td>
              <td>{inter.type}</td>
              <td>{inter.subject}</td>
              <td>{inter.summary}</td>
              <td>{inter.next_steps}</td>
              <td>
                <Button variant="warning" size="sm" onClick={() => handleEdit(inter)}>
                  Edit
                </Button>{" "}
                <Button variant="danger" size="sm" onClick={() => handleDelete(inter.id)}>
                  Delete
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>

      {/* Add/Edit Modal */}
      <Modal show={showModal} onHide={() => setShowModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>{formData.id ? "Edit Interaction" : "Add Interaction"}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-2">
              <Form.Label>Contact</Form.Label>
              <Form.Control
                as="select"
                value={formData.contact}
                onChange={(e) => setFormData({ ...formData, contact: e.target.value })}
              >
                <option value="">Select Contact</option>
                {contacts.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.full_name}
                  </option>
                ))}
              </Form.Control>
            </Form.Group>

            <Form.Group className="mb-2">
              <Form.Label>Company</Form.Label>
              <Form.Control
                as="select"
                value={formData.company}
                onChange={(e) => setFormData({ ...formData, company: e.target.value })}
              >
                <option value="">Select Company</option>
                {companies.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </Form.Control>
            </Form.Group>

            <Form.Group className="mb-2">
              <Form.Label>Type</Form.Label>
              <Form.Control
                as="select"
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
              >
                <option value="call">Call</option>
                <option value="email">Email</option>
                <option value="meeting">Meeting</option>
              </Form.Control>
            </Form.Group>

            <Form.Group className="mb-2">
              <Form.Label>Subject</Form.Label>
              <Form.Control
                type="text"
                value={formData.subject}
                onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
              />
            </Form.Group>

            <Form.Group className="mb-2">
              <Form.Label>Summary</Form.Label>
              <Form.Control
                as="textarea"
                rows={2}
                value={formData.summary}
                onChange={(e) => setFormData({ ...formData, summary: e.target.value })}
              />
            </Form.Group>

            <Form.Group className="mb-2">
              <Form.Label>Next Steps</Form.Label>
              <Form.Control
                as="textarea"
                rows={2}
                value={formData.next_steps}
                onChange={(e) => setFormData({ ...formData, next_steps: e.target.value })}
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleSave}>
            Save
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
}

export default Interactions;

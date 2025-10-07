import React, { useState, useEffect } from "react";
import { Table, Button, Container, Form, Modal } from "react-bootstrap";
import axios from "axios";
import { useSelector } from "react-redux";

function Contacts() {
  const { access } = useSelector((state) => state.auth); // ✅ Get access token from Redux
  const [contacts, setContacts] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingContact, setEditingContact] = useState(null);

  const [formData, setFormData] = useState({
    full_name: "",
    company: "",
    email: "",
    phone: "",
    role_title: "",
    source: "other",
    status: "lead",
    notes: "",
    last_contact_date: "",
  });

  // ✅ Fetch contacts
  const fetchContacts = async () => {
    if (!access) return;
    try {
      const res = await axios.get("http://127.0.0.1:8000/api/contacts/", {
        headers: { Authorization: `Bearer ${access}` },
      });
      setContacts(res.data.results || res.data);
    } catch (err) {
      console.error("Error fetching contacts:", err);
    }
  };

  // ✅ Fetch companies
  const fetchCompanies = async () => {
    if (!access) return;
    try {
      const res = await axios.get("http://127.0.0.1:8000/api/companies/", {
        headers: { Authorization: `Bearer ${access}` },
      });
      setCompanies(res.data.results || res.data);
    } catch (err) {
      console.error("Error fetching companies:", err);
    }
  };

  // ✅ Load data on mount
  useEffect(() => {
    fetchContacts();
    fetchCompanies();
  }, [access]);

  // ✅ Open modal for Add/Edit
  const handleShow = (contact = null) => {
    if (contact) {
      setEditingContact(contact);
      setFormData({
        full_name: contact.full_name,
        company: contact.company || "",
        email: contact.email,
        phone: contact.phone,
        role_title: contact.role_title,
        source: contact.source,
        status: contact.status,
        notes: contact.notes,
        last_contact_date: contact.last_contact_date || "",
      });
    } else {
      setEditingContact(null);
      setFormData({
        full_name: "",
        company: "",
        email: "",
        phone: "",
        role_title: "",
        source: "other",
        status: "lead",
        notes: "",
        last_contact_date: "",
      });
    }
    setShowModal(true);
  };

  const handleClose = () => {
    setShowModal(false);
    setEditingContact(null);
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // ✅ Add or Update Contact
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!access) return;

    const payload = { ...formData, company: formData.company || null };

    try {
      if (editingContact) {
        // Update contact
        await axios.put(
          `http://127.0.0.1:8000/api/contacts/${editingContact.id}/`,
          payload,
          {
            headers: { Authorization: `Bearer ${access}` },
          }
        );
      } else {
        // Add new contact
        await axios.post("http://127.0.0.1:8000/api/contacts/", payload, {
          headers: { Authorization: `Bearer ${access}` },
        });
      }
      fetchContacts();
      handleClose();
    } catch (err) {
      console.error("Error saving contact:", err);
    }
  };

  // ✅ Delete contact
  const handleDelete = async (id) => {
    if (!access) return;
    if (!window.confirm("Are you sure you want to delete this contact?")) return;

    try {
      await axios.delete(`http://127.0.0.1:8000/api/contacts/${id}/`, {
        headers: { Authorization: `Bearer ${access}` },
      });
      fetchContacts();
    } catch (err) {
      console.error("Error deleting contact:", err);
    }
  };

  return (
    <Container className="mt-4">
      <h2>Contacts</h2>

      <Button variant="primary" className="mb-3" onClick={() => handleShow()}>
        Add Contact
      </Button>

      <Table striped bordered hover responsive>
        <thead>
          <tr>
            <th>ID</th>
            <th>Full Name</th>
            <th>Company</th>
            <th>Email</th>
            <th>Phone</th>
            <th>Role</th>
            <th>Source</th>
            <th>Status</th>
            <th>Last Contact</th>
            <th>Notes</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {contacts.map((contact) => (
            <tr key={contact.id}>
              <td>{contact.id}</td>
              <td>{contact.full_name}</td>
              <td>{contact.company_detail || "-"}</td>
              <td>{contact.email}</td>
              <td>{contact.phone}</td>
              <td>{contact.role_title}</td>
              <td>{contact.source}</td>
              <td>{contact.status}</td>
              <td>{contact.last_contact_date || "-"}</td>
              <td>{contact.notes}</td>
              <td>
                <Button
                  variant="warning"
                  size="sm"
                  onClick={() => handleShow(contact)}
                >
                  Edit
                </Button>{" "}
                <Button
                  variant="danger"
                  size="sm"
                  onClick={() => handleDelete(contact.id)}
                >
                  Delete
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>

      {/* ✅ Add/Edit Modal */}
      <Modal show={showModal} onHide={handleClose}>
        <Modal.Header closeButton>
          <Modal.Title>
            {editingContact ? "Edit Contact" : "Add Contact"}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-2">
              <Form.Label>Full Name</Form.Label>
              <Form.Control
                name="full_name"
                value={formData.full_name}
                onChange={handleChange}
                required
              />
            </Form.Group>

            <Form.Group className="mb-2">
              <Form.Label>Company</Form.Label>
              <Form.Select
                name="company"
                value={formData.company}
                onChange={handleChange}
              >
                <option value="">-- Select Company --</option>
                {companies.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </Form.Select>
            </Form.Group>

            <Form.Group className="mb-2">
              <Form.Label>Email</Form.Label>
              <Form.Control
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </Form.Group>

            <Form.Group className="mb-2">
              <Form.Label>Phone</Form.Label>
              <Form.Control
                name="phone"
                value={formData.phone}
                onChange={handleChange}
              />
            </Form.Group>

            <Form.Group className="mb-2">
              <Form.Label>Role Title</Form.Label>
              <Form.Control
                name="role_title"
                value={formData.role_title}
                onChange={handleChange}
              />
            </Form.Group>

            <Form.Group className="mb-2">
              <Form.Label>Source</Form.Label>
              <Form.Select
                name="source"
                value={formData.source}
                onChange={handleChange}
              >
                <option value="referral">Referral</option>
                <option value="web">Web</option>
                <option value="cold_outreach">Cold Outreach</option>
                <option value="other">Other</option>
              </Form.Select>
            </Form.Group>

            <Form.Group className="mb-2">
              <Form.Label>Status</Form.Label>
              <Form.Select
                name="status"
                value={formData.status}
                onChange={handleChange}
              >
                <option value="lead">Lead</option>
                <option value="prospect">Prospect</option>
                <option value="client">Client</option>
              </Form.Select>
            </Form.Group>

            <Form.Group className="mb-2">
              <Form.Label>Last Contact Date</Form.Label>
              <Form.Control
                type="date"
                name="last_contact_date"
                value={formData.last_contact_date || ""}
                onChange={handleChange}
              />
            </Form.Group>

            <Form.Group className="mb-2">
              <Form.Label>Notes</Form.Label>
              <Form.Control
                as="textarea"
                rows={2}
                name="notes"
                value={formData.notes}
                onChange={handleChange}
              />
            </Form.Group>

            <Button variant="success" type="submit">
              {editingContact ? "Update" : "Save Contact"}
            </Button>
          </Form>
        </Modal.Body>
      </Modal>
    </Container>
  );
}

export default Contacts;

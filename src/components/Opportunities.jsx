import React, { useState, useEffect } from "react";
import { Table, Button, Container, Modal, Form, Alert } from "react-bootstrap";
import axios from "axios";
import { useSelector } from "react-redux";

function Opportunities() {
  const { access } = useSelector((state) => state.auth); // Get access token from Redux
  const [opportunities, setOpportunities] = useState([]);
  const [contacts, setContacts] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [users, setUsers] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    id: null,
    deal_name: "",
    contact: "",
    company: "",
    stage: "prospecting",
    deal_value: 0,
    expected_close_date: "",
    probability: 0,
    owner: "",
    next_action: "",
  });
  const [error, setError] = useState(""); // Added for error feedback
  const [loading, setLoading] = useState(false); // Added for loading state

  const apiUrl = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000/api"; // Use environment variable
  const headers = { Authorization: `Bearer ${access}` };

  // Fetch opportunities
  const fetchOpportunities = async () => {
    if (!access) {
       setError("No access token available. Please log in.");
      return;
    }
    setLoading(true);
    try {
      const res = await axios.get(`${apiUrl}/opportunities/`, { headers });
      setOpportunities(res.data.results || res.data);
      setError("");
    } catch (err) {
      console.error("Error fetching opportunities:", err);
      setError(err.response?.data?.error || "Failed to fetch opportunities. Please try again.");
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
      const [contactsRes, companiesRes, usersRes] = await Promise.all([
        axios.get(`${apiUrl}/contacts/`, { headers }),
        axios.get(`${apiUrl}/companies/`, { headers }),
        axios.get(`${apiUrl}/users/`, { headers }),
      ]);
      setContacts(contactsRes.data.results || contactsRes.data);
      setCompanies(companiesRes.data.results || companiesRes.data);
      setUsers(usersRes.data.results || usersRes.data);
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
    fetchOpportunities();
    fetchDropdowns();
  }, [access]);

  // Handle form submission
  const handleSave = async () => {
    if (!access) {
      setError("No access token available. Please log in.");
      return;
    }
    // Basic form validation
    if (!formData.deal_name || !formData.contact || !formData.stage || !formData.next_action) {
      setError("Please fill in all required fields (Deal Name, Contact, Stage, Next Action).");
      return;
    }
    if (formData.deal_value < 0 || formData.probability < 0 || formData.probability > 100) {
      setError("Deal Value must be non-negative, and Probability must be between 0 and 100.");
      return;
    }

    const payload = {
      ...formData,
      deal_value: parseFloat(formData.deal_value) || 0,
      probability: parseInt(formData.probability) || 0,
      company: formData.company || null,
      owner: formData.owner || null,
      expected_close_date: formData.expected_close_date || null,
    };

    setLoading(true);
    try {
      if (formData.id) {
        await axios.put(`${apiUrl}/opportunities/${formData.id}/`, payload, { headers });
      } else {
        await axios.post(`${apiUrl}/opportunities/`, payload, { headers });
      }
      setShowModal(false);
      resetForm();
      setError("");
      fetchOpportunities();
    } catch (err) {
      console.error("Error saving opportunity:", err);
      setError(err.response?.data?.error || "Failed to save opportunity. Please try again.");
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
    if (!window.confirm("Are you sure you want to delete this opportunity?")) return;

    setLoading(true);
    try {
      await axios.delete(`${apiUrl}/opportunities/${id}/`, { headers });
      setError("");
      fetchOpportunities();
    } catch (err) {
      console.error("Error deleting opportunity:", err);
      setError(err.response?.data?.error || "Failed to delete opportunity. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Handle edit
  const handleEdit = (opp) => {
    setFormData({
      id: opp.id,
      deal_name: opp.deal_name || "",
      contact: opp.contact || "",
      company: opp.company || "",
      stage: opp.stage || "prospecting",
      deal_value: opp.deal_value || 0,
      expected_close_date: opp.expected_close_date || "",
      probability: opp.probability || 0,
      owner: opp.owner || "",
      next_action: opp.next_action || "",
    });
    setShowModal(true);
    setError("");
  };

  // Reset form
  const resetForm = () => {
    setFormData({
      id: null,
      deal_name: "",
      contact: "",
      company: "",
      stage: "prospecting",
      deal_value: 0,
      expected_close_date: "",
      probability: 0,
      owner: "",
      next_action: "",
    });
    setError("");
  };

  return (
    <Container className="mt-4">
      <h2>Opportunities</h2>
      {error && <Alert variant="danger">{error}</Alert>}
      {loading && <Alert variant="info">Loading...</Alert>}

      <Button variant="primary" onClick={() => { resetForm(); setShowModal(true); }} className="mb-3">
        Add Opportunity
      </Button>

      {opportunities.length === 0 ? (
        <p>No opportunities available.</p>
      ) : (
        <Table striped bordered hover className="mt-3">
          <thead>
            <tr>
              <th>ID</th>
              <th>Contact</th>
              <th>Company</th>
              <th>Deal Name</th>
              <th>Stage</th>
              <th>Deal Value</th>
              <th>Close Date</th>
              <th>Probability</th>
              <th>Owner</th>
              <th>Next Action</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {opportunities.map((opp) => (
              <tr key={opp.id}>
                <td>{opp.id}</td>
                <td>{opp.contact_detail || "-"}</td>
                <td>{opp.company_detail || "-"}</td>
                <td>{opp.deal_name}</td>
                <td>{opp.stage}</td>
                <td>${opp.deal_value?.toLocaleString() || 0}</td>
                <td>{opp.expected_close_date || "-"}</td>
                <td>{opp.probability}%</td>
                <td>{opp.owner_detail || "-"}</td>
                <td>{opp.next_action}</td>
                <td>
                  <Button variant="warning" size="sm" onClick={() => handleEdit(opp)} className="me-2">
                    Edit
                  </Button>
                  <Button variant="danger" size="sm" onClick={() => handleDelete(opp.id)}>
                    Delete
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}

      {/* Modal for Add/Edit */}
      <Modal show={showModal} onHide={() => setShowModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>{formData.id ? "Edit Opportunity" : "Add Opportunity"}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>Deal Name *</Form.Label>
              <Form.Control
                type="text"
                value={formData.deal_name}
                onChange={(e) => setFormData({ ...formData, deal_name: e.target.value })}
                required
                placeholder="Enter deal name"
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Contact *</Form.Label>
              <Form.Control
                as="select"
                value={formData.contact}
                onChange={(e) => setFormData({ ...formData, contact: e.target.value })}
                required
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
              <Form.Label>Stage *</Form.Label>
              <Form.Control
                as="select"
                value={formData.stage}
                onChange={(e) => setFormData({ ...formData, stage: e.target.value })}
                required
              >
                <option value="prospecting">Prospecting</option>
                <option value="qualification">Qualification</option>
                <option value="proposal">Proposal</option>
                <option value="negotiation">Negotiation</option>
                <option value="closed_won">Closed Won</option>
                <option value="closed_lost">Closed Lost</option>
              </Form.Control>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Deal Value</Form.Label>
              <Form.Control
                type="number"
                min="0"
                value={formData.deal_value}
                onChange={(e) => setFormData({ ...formData, deal_value: parseFloat(e.target.value) || 0 })}
                placeholder="Enter deal value"
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Expected Close Date</Form.Label>
              <Form.Control
                type="date"
                value={formData.expected_close_date}
                onChange={(e) => setFormData({ ...formData, expected_close_date: e.target.value })}
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Probability (%)</Form.Label>
              <Form.Control
                type="number"
                min="0"
                max="100"
                value={formData.probability}
                onChange={(e) => setFormData({ ...formData, probability: parseInt(e.target.value) || 0 })}
                placeholder="Enter probability (0-100)"
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Owner</Form.Label>
              <Form.Control
                as="select"
                value={formData.owner}
                onChange={(e) => setFormData({ ...formData, owner: e.target.value })}
              >
                <option value="">Select Owner (Optional)</option>
                {users.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.username || "Unknown"}
                  </option>
                ))}
              </Form.Control>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Next Action *</Form.Label>
              <Form.Control
                type="text"
                value={formData.next_action}
                onChange={(e) => setFormData({ ...formData, next_action: e.target.value })}
                required
                placeholder="Enter next action"
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

export default Opportunities;
import React, { useState, useEffect } from "react";
import { Container, Row, Col, Form, Button, Modal, Alert } from "react-bootstrap";
import axios from "axios";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import { useSelector } from "react-redux";

function Settings() {
  const { access } = useSelector((state) => state.auth); // Get token from Redux
  const [customFields, setCustomFields] = useState([]);
  const [emailTemplates, setEmailTemplates] = useState([]);
  const [fieldModal, setFieldModal] = useState(false);
  const [templateModal, setTemplateModal] = useState(false);
  const [fieldData, setFieldData] = useState({ name: "", entity: "", field_type: "" });
  const [editingFieldId, setEditingFieldId] = useState(null);
  const [templateData, setTemplateData] = useState({ name: "", subject: "", body: "" });
  const [editingTemplateId, setEditingTemplateId] = useState(null);
  const [error, setError] = useState(""); // Added for user feedback

  const apiUrl = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000/api"; // Use environment variable
  const headers = { Authorization: `Bearer ${access}` };

  useEffect(() => {
    if (access) {
      fetchCustomFields();
      fetchEmailTemplates();
    }
  }, [access]);

  // ---------------- Custom Fields ----------------
  const fetchCustomFields = async () => {
    try {
      const res = await axios.get(`${apiUrl}/customfields/`, { headers });
      setCustomFields(res.data.results || res.data);
      setError("");
    } catch (error) {
      console.error("Error fetching custom fields:", error);
      setError("Failed to fetch custom fields. Please try again.");
    }
  };

  const handleFieldChange = (e) => {
    const { name, value } = e.target;
    setFieldData({ ...fieldData, [name]: value });
  };

  const handleFieldSubmit = async (e) => {
    e.preventDefault();
    if (!access) {
      setError("No access token available. Please log in.");
      return;
    }

    try {
      if (editingFieldId) {
        await axios.put(`${apiUrl}/customfields/${editingFieldId}/`, fieldData, { headers });
      } else {
        await axios.post(`${apiUrl}/customfields/`, fieldData, { headers });
      }
      setFieldData({ name: "", entity: "", field_type: "" });
      setEditingFieldId(null);
      setFieldModal(false);
      setError("");
      fetchCustomFields();
    } catch (error) {
      console.error("Error saving custom field:", error);
      setError(error.response?.data?.error || "Failed to save custom field. Please try again.");
    }
  };

  const handleFieldEdit = (field) => {
    setFieldData({ name: field.name, entity: field.entity, field_type: field.field_type });
    setEditingFieldId(field.id);
    setFieldModal(true);
    setError("");
  };

  const handleFieldDelete = async (id) => {
    if (!access) {
      setError("No access token available. Please log in.");
      return;
    }
    try {
      await axios.delete(`${apiUrl}/customfields/${id}/`, { headers });
      setError("");
      fetchCustomFields();
    } catch (error) {
      console.error("Error deleting custom field:", error);
      setError(error.response?.data?.error || "Failed to delete custom field. Please try again.");
    }
  };

  // ---------------- Email Templates ----------------
  const fetchEmailTemplates = async () => {
    try {
      const res = await axios.get(`${apiUrl}/emailtemplates/`, { headers });
      setEmailTemplates(res.data.results || res.data);
      setError("");
    } catch (error) {
      console.error("Error fetching email templates:", error);
      setError("Failed to fetch email templates. Please try again.");
    }
  };

  const handleTemplateChange = (e) => {
    const { name, value } = e.target;
    setTemplateData({ ...templateData, [name]: value });
  };

  const handleTemplateBodyChange = (value) => {
    setTemplateData({ ...templateData, body: value });
  };

  const handleTemplateSubmit = async (e) => {
    e.preventDefault();
    if (!access) {
      setError("No access token available. Please log in.");
      return;
    }

    try {
      if (editingTemplateId) {
        await axios.put(`${apiUrl}/emailtemplates/${editingTemplateId}/`, templateData, { headers });
      } else {
        await axios.post(`${apiUrl}/emailtemplates/`, templateData, { headers });
      }
      setTemplateData({ name: "", subject: "", body: "" });
      setEditingTemplateId(null);
      setTemplateModal(false);
      setError("");
      fetchEmailTemplates();
    } catch (error) {
      console.error("Error saving email template:", error);
      setError(error.response?.data?.error || "Failed to save email template. Please try again.");
    }
  };

  const handleTemplateEdit = (template) => {
    setTemplateData({ name: template.name, subject: template.subject, body: template.body });
    setEditingTemplateId(template.id);
    setTemplateModal(true);
    setError("");
  };

  const handleTemplateDelete = async (id) => {
    if (!access) {
      setError("No access token available. Please log in.");
      return;
    }
    try {
      await axios.delete(`${apiUrl}/emailtemplates/${id}/`, { headers });
      setError("");
      fetchEmailTemplates();
    } catch (error) {
      console.error("Error deleting email template:", error);
      setError(error.response?.data?.error || "Failed to delete email template. Please try again.");
    }
  };

  return (
    <Container className="mt-4">
      <h2>Settings</h2>
      {error && <Alert variant="danger">{error}</Alert>}

      <Row>
        <Col md={6}>
          <h3>Custom Fields</h3>
          <Button variant="primary" className="mb-3" onClick={() => setFieldModal(true)}>
            Add Custom Field
          </Button>
          {customFields.length === 0 ? (
            <p>No custom fields available.</p>
          ) : (
            <ul className="list-unstyled">
              {customFields.map((field) => (
                <li key={field.id} className="d-flex align-items-center mb-2">
                  {field.name} ({field.entity}: {field.field_type})
                  <Button size="sm" variant="warning" className="ms-2" onClick={() => handleFieldEdit(field)}>
                    Edit
                  </Button>
                  <Button size="sm" variant="danger" className="ms-2" onClick={() => handleFieldDelete(field.id)}>
                    Delete
                  </Button>
                </li>
              ))}
            </ul>
          )}
        </Col>

        <Col md={6}>
          <h3>Email Templates</h3>
          <Button variant="primary" className="mb-3" onClick={() => setTemplateModal(true)}>
            Add Template
          </Button>
          {emailTemplates.length === 0 ? (
            <p>No email templates available.</p>
          ) : (
            <ul className="list-unstyled">
              {emailTemplates.map((template) => (
                <li key={template.id} className="d-flex align-items-center mb-2">
                  <b>{template.name}</b>: {template.subject}
                  <Button size="sm" variant="warning" className="ms-2" onClick={() => handleTemplateEdit(template)}>
                    Edit
                  </Button>
                  <Button size="sm" variant="danger" className="ms-2" onClick={() => handleTemplateDelete(template.id)}>
                    Delete
                  </Button>
                </li>
              ))}
            </ul>
          )}
        </Col>
      </Row>

      {/* -------- Custom Field Modal -------- */}
      <Modal show={fieldModal} onHide={() => setFieldModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>{editingFieldId ? "Edit Custom Field" : "Add Custom Field"}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleFieldSubmit}>
            <Form.Group className="mb-3">
              <Form.Label>Name</Form.Label>
              <Form.Control
                name="name"
                value={fieldData.name}
                onChange={handleFieldChange}
                required
                placeholder="Enter field name"
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Entity</Form.Label>
              <Form.Control
                name="entity"
                value={fieldData.entity}
                onChange={handleFieldChange}
                required
                placeholder="e.g., Contact, Opportunity"
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Field Type</Form.Label>
              <Form.Select name="field_type" value={fieldData.field_type} onChange={handleFieldChange} required>
                <option value="">-- Select Type --</option>
                <option value="text">Text</option>
                <option value="number">Number</option>
                <option value="date">Date</option>
                <option value="boolean">Yes/No</option>
              </Form.Select>
            </Form.Group>
            <Button type="submit" variant="success">
              {editingFieldId ? "Update Field" : "Save Field"}
            </Button>
          </Form>
        </Modal.Body>
      </Modal>

      {/* -------- Email Template Modal -------- */}
      <Modal show={templateModal} onHide={() => setTemplateModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>{editingTemplateId ? "Edit Template" : "Add Template"}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleTemplateSubmit}>
            <Form.Group className="mb-3">
              <Form.Label>Name</Form.Label>
              <Form.Control
                name="name"
                value={templateData.name}
                onChange={handleTemplateChange}
                required
                placeholder="Enter template name"
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Subject</Form.Label>
              <Form.Control
                name="subject"
                value={templateData.subject}
                onChange={handleTemplateChange}
                required
                placeholder="Enter email subject"
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Body</Form.Label>
              <ReactQuill value={templateData.body} onChange={handleTemplateBodyChange} />
            </Form.Group>
            <Button type="submit" variant="success">
              {editingTemplateId ? "Update Template" : "Save Template"}
            </Button>
          </Form>
        </Modal.Body>
      </Modal>
    </Container>
  );
}

export default Settings;
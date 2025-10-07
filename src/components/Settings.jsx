import React, { useState, useEffect } from "react";
import { Container, Row, Col, Form, Button, Modal } from "react-bootstrap";
import axios from "axios";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import { useSelector } from "react-redux";

function Settings() {
  const { access } = useSelector((state) => state.auth); // ✅ Get token from Redux
  const [customFields, setCustomFields] = useState([]);
  const [emailTemplates, setEmailTemplates] = useState([]);

  const [fieldModal, setFieldModal] = useState(false);
  const [templateModal, setTemplateModal] = useState(false);

  const [fieldData, setFieldData] = useState({ name: "", entity: "", field_type: "" });
  const [editingFieldId, setEditingFieldId] = useState(null);

  const [templateData, setTemplateData] = useState({ name: "", subject: "", body: "" });
  const [editingTemplateId, setEditingTemplateId] = useState(null);

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
      const res = await axios.get("/api/customfields/", { headers });
      setCustomFields(res.data.results || res.data);
    } catch (error) {
      console.error("Error fetching custom fields:", error);
    }
  };

  const handleFieldChange = (e) => {
    setFieldData({ ...fieldData, [e.target.name]: e.target.value });
  };

  const handleFieldSubmit = async (e) => {
    e.preventDefault();
    if (!access) return;

    try {
      if (editingFieldId) {
        await axios.put(`/api/customfields/${editingFieldId}/`, fieldData, { headers });
        setEditingFieldId(null);
      } else {
        await axios.post("/api/customfields/", fieldData, { headers });
      }
      setFieldData({ name: "", entity: "", field_type: "" });
      setFieldModal(false);
      fetchCustomFields();
    } catch (error) {
      console.error("Error saving custom field:", error);
    }
  };

  const handleFieldEdit = (field) => {
    setFieldData({ name: field.name, entity: field.entity, field_type: field.field_type });
    setEditingFieldId(field.id);
    setFieldModal(true);
  };

  const handleFieldDelete = async (id) => {
    if (!access) return;
    try {
      await axios.delete(`/api/customfields/${id}/`, { headers });
      fetchCustomFields();
    } catch (error) {
      console.error("Error deleting custom field:", error);
    }
  };

  // ---------------- Email Templates ----------------
  const fetchEmailTemplates = async () => {
    try {
      const res = await axios.get("/api/emailtemplates/", { headers });
      setEmailTemplates(res.data.results || res.data);
    } catch (error) {
      console.error("Error fetching email templates:", error);
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
    if (!access) return;

    try {
      if (editingTemplateId) {
        await axios.put(`/api/emailtemplates/${editingTemplateId}/`, templateData, { headers });
        setEditingTemplateId(null);
      } else {
        await axios.post("/api/emailtemplates/", templateData, { headers });
      }
      setTemplateData({ name: "", subject: "", body: "" });
      setTemplateModal(false);
      fetchEmailTemplates();
    } catch (error) {
      console.error("Error saving email template:", error);
    }
  };

  const handleTemplateEdit = (template) => {
    setTemplateData({ name: template.name, subject: template.subject, body: template.body });
    setEditingTemplateId(template.id);
    setTemplateModal(true);
  };

  const handleTemplateDelete = async (id) => {
    if (!access) return;
    try {
      await axios.delete(`/api/emailtemplates/${id}/`, { headers });
      fetchEmailTemplates();
    } catch (error) {
      console.error("Error deleting template:", error);
    }
  };

  return (
    <Container className="mt-4">
      <h2>Settings</h2>

      <Row>
        <Col md={6}>
          <h3>Custom Fields</h3>
          <Button variant="primary" className="mb-2" onClick={() => setFieldModal(true)}>Add Custom Field</Button>
          <ul>
            {customFields.map((field) => (
              <li key={field.id}>
                {field.name} ({field.entity}: {field.field_type})
                <Button size="sm" variant="warning" className="ms-2" onClick={() => handleFieldEdit(field)}>Edit</Button>
                <Button size="sm" variant="danger" className="ms-2" onClick={() => handleFieldDelete(field.id)}>Delete</Button>
              </li>
            ))}
          </ul>
        </Col>

        <Col md={6}>
          <h3>Email Templates</h3>
          <Button variant="primary" className="mb-2" onClick={() => setTemplateModal(true)}>Add Template</Button>
          <ul>
            {emailTemplates.map((template) => (
              <li key={template.id}>
                <b>{template.name}</b>: {template.subject}
                <Button size="sm" variant="warning" className="ms-2" onClick={() => handleTemplateEdit(template)}>Edit</Button>
                <Button size="sm" variant="danger" className="ms-2" onClick={() => handleTemplateDelete(template.id)}>Delete</Button>
              </li>
            ))}
          </ul>
        </Col>
      </Row>

      {/* -------- Modals -------- */}
      <Modal show={fieldModal} onHide={() => setFieldModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>{editingFieldId ? "Edit Custom Field" : "Add Custom Field"}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleFieldSubmit}>
            <Form.Group className="mb-2">
              <Form.Label>Name</Form.Label>
              <Form.Control name="name" value={fieldData.name} onChange={handleFieldChange} required />
            </Form.Group>
            <Form.Group className="mb-2">
              <Form.Label>Entity</Form.Label>
              <Form.Control name="entity" value={fieldData.entity} onChange={handleFieldChange} placeholder="Contact, Opportunity etc." required />
            </Form.Group>
            <Form.Group className="mb-2">
              <Form.Label>Field Type</Form.Label>
              <Form.Select name="field_type" value={fieldData.field_type} onChange={handleFieldChange} required>
                <option value="">-- Select Type --</option>
                <option value="text">Text</option>
                <option value="number">Number</option>
                <option value="date">Date</option>
                <option value="boolean">Yes/No</option>
              </Form.Select>
            </Form.Group>
            <Button type="submit" variant="success">{editingFieldId ? "Update Field" : "Save Field"}</Button>
          </Form>
        </Modal.Body>
      </Modal>

      <Modal show={templateModal} onHide={() => setTemplateModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>{editingTemplateId ? "Edit Template" : "Add Template"}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleTemplateSubmit}>
            <Form.Group className="mb-2">
              <Form.Label>Name</Form.Label>
              <Form.Control name="name" value={templateData.name} onChange={handleTemplateChange} required />
            </Form.Group>
            <Form.Group className="mb-2">
              <Form.Label>Subject</Form.Label>
              <Form.Control name="subject" value={templateData.subject} onChange={handleTemplateChange} required />
            </Form.Group>
            <Form.Group className="mb-2">
              <Form.Label>Body</Form.Label>
              <ReactQuill value={templateData.body} onChange={handleTemplateBodyChange} />
            </Form.Group>
            <Button type="submit" variant="success">{editingTemplateId ? "Update Template" : "Save Template"}</Button>
          </Form>
        </Modal.Body>
      </Modal>
    </Container>
  );
}

export default Settings;

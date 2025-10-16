import React, { useState, useEffect } from 'react';
import { Table, Button, Container, Modal, Form } from 'react-bootstrap';
import axios from 'axios';
import { useSelector } from 'react-redux';
import '../CSS/company.css';


function Companies() {
  const { access } = useSelector((state) => state.auth);
  const [companies, setCompanies] = useState([]);
  const [contacts, setContacts] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingCompany, setEditingCompany] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    industry: '',
    size_revenue: '',
    address: '',
    notes: '',
    primary_contact_id: ''
  });

  const apiUrl = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000/api";
  const headers = { Authorization: `Bearer ${access}` };

  useEffect(() => {
    if (access) {
      fetchCompanies();
      fetchContacts();
    }
  }, [access]);

  const fetchCompanies = async () => {
    try {
      const res = await axios.get(`${apiUrl}/companies/`, { headers });
      setCompanies(res.data);
    } catch (err) {
      console.error('Error fetching companies:', err);
    }
  };

  const fetchContacts = async () => {
    try {
      const res = await axios.get(`${apiUrl}/contacts/`, { headers });
      setContacts(res.data);
    } catch (err) {
      console.error('Error fetching contacts:', err);
    }
  };

  const handleShowModal = (company = null) => {
    if (company) {
      setEditingCompany(company);
      setFormData({
        name: company.name || '',
        industry: company.industry || '',
        size_revenue: company.size_revenue || '',
        address: company.address || '',
        notes: company.notes || '',
        primary_contact_id: company.primary_contact?.id || ''
      });
    } else {
      setEditingCompany(null);
      setFormData({
        name: '',
        industry: '',
        size_revenue: '',
        address: '',
        notes: '',
        primary_contact_id: ''
      });
    }
    setShowModal(true);
  };

  const handleCloseModal = () => setShowModal(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: name === "primary_contact_id" ? parseInt(value) || '' : value
    });
  };

  const handleSubmit = async () => {
    try {
      if (editingCompany) {
        await axios.put(`${apiUrl}/companies/${editingCompany.id}/`, formData, { headers });
      } else {
        await axios.post(`${apiUrl}/companies/`, formData, { headers });
      }
      fetchCompanies();
      handleCloseModal();
    } catch (err) {
      console.error('Error saving company:', err);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this company?')) {
      try {
        await axios.delete(`${apiUrl}/companies/${id}/`, { headers });
        fetchCompanies();
      } catch (err) {
        console.error('Error deleting company:', err);
      }
    }
  };

  return (
    <Container fluid className="mt-4 px-2 px-sm-3 px-md-4">
      <h2 className="mb-4">Companies</h2>

      <div className="table-responsive">
        <Table striped bordered hover className="company-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Industry</th>
              <th>Size/Revenue</th>
              <th>Primary Contact</th>
              <th>Address</th>
              <th>Notes</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {companies.map((company) => (
              <tr key={company.id}>
                <td>{company.name}</td>
                <td>{company.industry}</td>
                <td>{company.size_revenue}</td>
                <td>{company.primary_contact?.full_name || '-'}</td>
                <td>{company.address}</td>
                <td>{company.notes}</td>
                <td className="action-buttons">
                  <Button
                    variant="warning"
                    size="sm"
                    className="me-2 mb-1 mb-sm-0"
                    onClick={() => handleShowModal(company)}
                  >
                    Edit
                  </Button>
                  <Button
                    variant="danger"
                    size="sm"
                    className="mb-1 mb-sm-0"
                    onClick={() => handleDelete(company.id)}
                  >
                    Delete
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      </div>

      <Button variant="primary" onClick={() => handleShowModal()} className="mt-3">
        Add Company
      </Button>

      <Modal show={showModal} onHide={handleCloseModal} centered size="lg">
        <Modal.Header closeButton>
          <Modal.Title>{editingCompany ? 'Edit Company' : 'Add Company'}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>Name</Form.Label>
              <Form.Control
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                placeholder="Enter company name"
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Industry</Form.Label>
              <Form.Control
                name="industry"
                value={formData.industry}
                onChange={handleChange}
                placeholder="Enter industry"
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Size/Revenue</Form.Label>
              <Form.Control
                name="size_revenue"
                value={formData.size_revenue}
                onChange={handleChange}
                placeholder="Enter size or revenue"
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Primary Contact</Form.Label>
              <Form.Select
                name="primary_contact_id"
                value={formData.primary_contact_id || ''}
                onChange={handleChange}
              >
                <option value="">Select a contact</option>
                {contacts.map(contact => (
                  <option key={contact.id} value={contact.id}>
                    {contact.full_name}
                  </option>
                ))}
              </Form.Select>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Address</Form.Label>
              <Form.Control
                name="address"
                value={formData.address}
                onChange={handleChange}
                placeholder="Enter address"
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Notes</Form.Label>
              <Form.Control
                as="textarea"
                name="notes"
                value={formData.notes}
                onChange={handleChange}
                rows={4}
                placeholder="Enter notes"
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseModal}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleSubmit}>
            {editingCompany ? 'Update' : 'Save'}
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
}

export default Companies;

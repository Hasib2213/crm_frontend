import React, { useState, useEffect } from "react";
import { Table, Button, Container, Modal, Form } from "react-bootstrap";
import axios from "axios";
import { useSelector } from "react-redux";

function Tasks() {
  const { access } = useSelector((state) => state.auth); // ✅ Get access token from Redux
  const [tasks, setTasks] = useState([]);
  const [users, setUsers] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [formData, setFormData] = useState({
    description: "",
    due_date: "",
    status: "pending",
    owner: "",
  });

  // ✅ Fetch tasks
  const fetchTasks = async () => {
    if (!access) return;
    try {
      const res = await axios.get("/api/tasks/", {
        headers: { Authorization: `Bearer ${access}` },
      });
      setTasks(res.data.results || res.data);
    } catch (err) {
      console.error("Error fetching tasks:", err);
    }
  };

  // ✅ Fetch users
  const fetchUsers = async () => {
    if (!access) return;
    try {
      const res = await axios.get("/api/users/", {
        headers: { Authorization: `Bearer ${access}` },
      });
      setUsers(res.data.results || res.data);
    } catch (err) {
      console.error("Error fetching users:", err);
    }
  };

  // ✅ Load data on mount or when access changes
  useEffect(() => {
    fetchTasks();
    fetchUsers();
  }, [access]);

  const handleShow = (task = null) => {
    if (task) {
      setEditingTask(task);
      setFormData({
        description: task.description,
        due_date: task.due_date,
        status: task.status,
        owner: task.owner || "",
      });
    } else {
      setEditingTask(null);
      setFormData({
        description: "",
        due_date: "",
        status: "pending",
        owner: "",
      });
    }
    setShowModal(true);
  };

  const handleClose = () => {
    setShowModal(false);
    setEditingTask(null);
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!access) return;

    const payload = {
      description: formData.description,
      due_date: formData.due_date,
      status: formData.status,
      owner: formData.owner ? parseInt(formData.owner) : null,
    };

    try {
      if (editingTask) {
        // Update task
        await axios.put(`/api/tasks/${editingTask.id}/`, payload, {
          headers: { Authorization: `Bearer ${access}` },
        });
      } else {
        // Create task
        await axios.post("/api/tasks/", payload, {
          headers: { Authorization: `Bearer ${access}` },
        });
      }
      fetchTasks();
      handleClose();
    } catch (err) {
      console.error("Error saving task:", err.response?.data || err);
    }
  };

  const handleDelete = async (id) => {
    if (!access) return;
    if (!window.confirm("Are you sure you want to delete this task?")) return;

    try {
      await axios.delete(`/api/tasks/${id}/`, {
        headers: { Authorization: `Bearer ${access}` },
      });
      fetchTasks();
    } catch (err) {
      console.error("Error deleting task:", err);
    }
  };

  return (
    <Container className="mt-4">
      <h2>Tasks</h2>
      <Button variant="primary" onClick={() => handleShow()}>Add Task</Button>

      <Table striped bordered hover className="mt-3">
        <thead>
          <tr>
            <th>ID</th>
            <th>Owner</th>
            <th>Description</th>
            <th>Due Date</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {tasks.map(task => (
            <tr key={task.id}>
              <td>{task.id}</td>
              <td>{task.owner_detail || task.owner || "-"}</td>
              <td>{task.description}</td>
              <td>{task.due_date}</td>
              <td>{task.status}</td>
              <td>
                <Button variant="warning" size="sm" onClick={() => handleShow(task)}>Edit</Button>{" "}
                <Button variant="danger" size="sm" onClick={() => handleDelete(task.id)}>Delete</Button>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>

      <Modal show={showModal} onHide={handleClose}>
        <Form onSubmit={handleSubmit}>
          <Modal.Header closeButton>
            <Modal.Title>{editingTask ? "Edit Task" : "Add Task"}</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Form.Group className="mb-3">
              <Form.Label>Description</Form.Label>
              <Form.Control
                type="text"
                name="description"
                value={formData.description}
                onChange={handleChange}
                required
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Due Date</Form.Label>
              <Form.Control
                type="date"
                name="due_date"
                value={formData.due_date}
                onChange={handleChange}
                required
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Status</Form.Label>
              <Form.Select name="status" value={formData.status} onChange={handleChange}>
                <option value="pending">Pending</option>
                <option value="in_progress">In Progress</option>
                <option value="completed">Completed</option>
              </Form.Select>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Owner</Form.Label>
              <Form.Select name="owner" value={formData.owner} onChange={handleChange} required>
                <option value="">Select User</option>
                {users.map(u => <option key={u.id} value={u.id}>{u.username}</option>)}
              </Form.Select>
            </Form.Group>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={handleClose}>Cancel</Button>
            <Button variant="primary" type="submit">{editingTask ? "Update" : "Add"}</Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </Container>
  );
}

export default Tasks;

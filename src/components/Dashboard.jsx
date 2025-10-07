import React, { useState, useEffect } from "react";
import { Card, Table, Container, Row, Col, Spinner, Alert } from "react-bootstrap";
import axios from "axios";
import { Bar } from "react-chartjs-2";
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from "chart.js";
import { useSelector } from "react-redux";

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

function Dashboard() {
  const { access } = useSelector((state) => state.auth); // ✅ Get token from Redux
  const [data, setData] = useState({
    total_contacts: 0,
    total_leads: 0,
    total_clients: 0,
    leads_by_stage: [],
    open_opportunities_value: 0,
    recent_interactions: [],
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!access) {
      setError("Authentication required. Please log in.");
      setLoading(false);
      return;
    }

    axios
      .get("http://127.0.0.1:8000/api/dashboard/", {
        headers: { Authorization: `Bearer ${access}` },
      })
      .then((res) => {
        setData(res.data);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setError("Failed to load dashboard data.");
        setLoading(false);
      });
  }, [access]);

  const chartData = {
    labels: data.leads_by_stage.map((item) => item.stage),
    datasets: [
      {
        label: "Leads by Stage",
        data: data.leads_by_stage.map((item) => item.count),
        backgroundColor: "rgba(54, 162, 235, 0.6)",
        borderColor: "rgba(54, 162, 235, 1)",
        borderWidth: 1,
        borderRadius: 6,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: { position: "top" },
      title: { display: false },
    },
  };

  if (loading) {
    return (
      <Container className="mt-5 text-center">
        <Spinner animation="border" role="status" />
        <p className="mt-2">Loading Dashboard...</p>
      </Container>
    );
  }

  if (error) {
    return (
      <Container className="mt-5">
        <Alert variant="danger">{error}</Alert>
      </Container>
    );
  }

  return (
    <Container className="mt-4">
      <h2 className="mb-4">Dashboard Overview</h2>

      {/* Summary Cards */}
      <Row className="g-4">
        <Col md={4}>
          <Card className="shadow-sm border-0">
            <Card.Body>
              <Card.Title>Total Contacts</Card.Title>
              <Card.Text className="fs-4 fw-bold">{data.total_contacts}</Card.Text>
            </Card.Body>
          </Card>
        </Col>
        <Col md={4}>
          <Card className="shadow-sm border-0">
            <Card.Body>
              <Card.Title>Total Leads</Card.Title>
              <Card.Text className="fs-4 fw-bold text-primary">{data.total_leads}</Card.Text>
            </Card.Body>
          </Card>
        </Col>
        <Col md={4}>
          <Card className="shadow-sm border-0">
            <Card.Body>
              <Card.Title>Total Clients</Card.Title>
              <Card.Text className="fs-4 fw-bold text-success">{data.total_clients}</Card.Text>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Opportunities Value */}
      <Row className="mt-4">
        <Col>
          <Card className="shadow-sm border-0">
            <Card.Body>
              <Card.Title>Open Opportunities Value</Card.Title>
              <Card.Text className="fs-5 fw-semibold text-info">
                ${data.open_opportunities_value.toLocaleString()}
              </Card.Text>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Chart Section */}
      <Row className="mt-4">
        <Col>
          <Card className="shadow-sm border-0">
            <Card.Body>
              <Card.Title>Leads by Pipeline Stage</Card.Title>
              {data.leads_by_stage.length > 0 ? (
                <Bar data={chartData} options={chartOptions} />
              ) : (
                <p className="text-muted mt-3">No data available for leads by stage.</p>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Recent Interactions Table */}
      <Row className="mt-4">
        <Col>
          <Card className="shadow-sm border-0">
            <Card.Body>
              <Card.Title>Recent Interactions</Card.Title>
              {data.recent_interactions.length > 0 ? (
                <Table striped bordered hover responsive>
                  <thead>
                    <tr>
                      <th>Date</th>
                      <th>Type</th>
                      <th>Subject</th>
                      <th>Summary</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.recent_interactions.map((item, index) => (
                      <tr key={index}>
                        <td>{new Date(item.date).toLocaleString()}</td>
                        <td>{item.type}</td>
                        <td>{item.subject}</td>
                        <td>{item.summary}</td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              ) : (
                <p className="text-muted mt-3">No recent interactions found.</p>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
}

export default Dashboard;

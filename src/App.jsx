import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Container } from 'react-bootstrap';
import Navbar from './components/Navbar';
import Dashboard from './components/Dashboard';
import Contacts from './components/Contacts';
import Companies from './components/Companies';
import Opportunities from './components/Opportunities';
import Interactions from './components/Interactions';
import Tasks from './components/Tasks';
import Settings from './components/Settings';
import Login from './components/Login';
import Signup from './components/Signup';
import VerifyEmail from './components/VerifyEmail';
import Footer from './components/Footer';

function App() {
  return (
    <Router>
      <div className="d-flex flex-column min-vh-100">
        <Navbar />
        <main className="flex-grow-1">
          <Container fluid className="mt-3 px-2 px-sm-3 px-md-4">
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/contacts" element={<Contacts />} />
              <Route path="/companies" element={<Companies />} />
              <Route path="/opportunities" element={<Opportunities />} />
              <Route path="/interactions" element={<Interactions />} />
              <Route path="/tasks" element={<Tasks />} />
              <Route path="/settings" element={<Settings />} />
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />
              <Route path="/verify-email/:token" element={<VerifyEmail />} />
            </Routes>
          </Container>
        </main>
        <Footer />
      </div>
    </Router>
  );
}

export default App;
import React, { useState, useEffect } from 'react';
import { Container, Button, ListGroup, Modal } from 'react-bootstrap';
import { collection, getDocs, addDoc } from 'firebase/firestore';
import { db } from '../services/firebase';
import { Link, useNavigate } from 'react-router-dom';
import InvestmentForm from '../components/InvestmentForm';
import { FaChartLine } from 'react-icons/fa';

const Investment = () => {
  const [investments, setInvestments] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const fetchInvestments = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, 'investments'));
      const fetchedInvestments = querySnapshot.docs.map(doc => {
        const data = doc.data();
        return { 
          id: doc.id, 
          ...data,
          date: data.date ? new Date(data.date).toLocaleString() : 'Unknown',
        };
      });
      setInvestments(fetchedInvestments);
      setLoading(false);
    } catch (err) {
      console.error("Error fetching investments:", err);
      setError("Failed to fetch investments. Please try again later.");
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInvestments();
  }, []);

  const handleAddInvestment = async (newInvestment) => {
    try {
      await addDoc(collection(db, 'investments'), newInvestment);
      setShowForm(false);
      fetchInvestments(); // Refresh the list after adding a new investment
    } catch (error) {
      console.error("Error adding investment:", error);
      alert("Failed to add investment. Please try again.");
    }
  };

  if (loading) {
    return <Container><p>Loading investments...</p></Container>;
  }

  if (error) {
    return <Container><p>{error}</p></Container>;
  }

  return (
    <Container>
      <div className="d-flex justify-content-between align-items-center my-4">
        <h2>Investments</h2>
        <div>
          <Button variant="primary" onClick={() => setShowForm(true)} className="me-2">Add Investment</Button>
          <Button variant="info" onClick={() => navigate('/report/investments')}>
            <FaChartLine /> Investment Report
          </Button>
        </div>
      </div>
      <ListGroup>
        {investments.map((investment) => (
          <ListGroup.Item key={investment.id} as={Link} to={`/investments/${investment.id}`}>
            <h5>{investment.title}</h5>
            <p>Type: {investment.type}</p>
            <p>Platform: {investment.platform}</p>
            <p>Amount: {investment.totalAmount} {investment.currency} (Unit Price: {investment.unitPrice})</p>
            <p>Quantity: {investment.quantity} {investment.unit}</p>
            <p>Date: {investment.date}</p>
            <p>Style: {investment.style}</p>
          </ListGroup.Item>
        ))}
      </ListGroup>

      <Modal show={showForm} onHide={() => setShowForm(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Add New Investment</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <InvestmentForm onSubmit={handleAddInvestment} />
        </Modal.Body>
      </Modal>
    </Container>
  );
};

export default Investment;
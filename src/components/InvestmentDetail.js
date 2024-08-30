import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Container, Button, Form, Modal, Row, Col } from 'react-bootstrap';
import { doc, getDoc, updateDoc, deleteDoc } from 'firebase/firestore';
import { db } from '../services/firebase';
import { FaChartLine, FaEdit, FaTrash } from 'react-icons/fa';

const InvestmentDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [investment, setInvestment] = useState(null);
  const [showSellModal, setShowSellModal] = useState(false);
  const [sellAmount, setSellAmount] = useState('');

  useEffect(() => {
    const fetchInvestment = async () => {
      const docRef = doc(db, 'investments', id);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        setInvestment({ id: docSnap.id, ...docSnap.data() });
      } else {
        console.log("No such investment!");
      }
    };

    fetchInvestment();
  }, [id]);

  const handleSell = async () => {
    if (!sellAmount) return;

    const sellDate = new Date();
    const profit = parseFloat(sellAmount) - investment.totalAmount;

    try {
      await updateDoc(doc(db, 'investments', id), {
        soldAmount: parseFloat(sellAmount),
        soldDate: sellDate.toISOString(),
        profit: profit
      });

      setInvestment({
        ...investment,
        soldAmount: parseFloat(sellAmount),
        soldDate: sellDate.toISOString(),
        profit: profit
      });

      setShowSellModal(false);
    } catch (error) {
      console.error("Error updating investment: ", error);
    }
  };

  const handleEdit = () => {
    console.log("Edit functionality to be implemented");
  };

  const handleDelete = async () => {
    if (window.confirm("Are you sure you want to delete this investment?")) {
      try {
        await deleteDoc(doc(db, 'investments', id));
        navigate('/investments');
      } catch (error) {
        console.error("Error deleting investment: ", error);
      }
    }
  };

  if (!investment) return <div>Loading...</div>;

  return (
    <Container>
      <Row className="mt-3 mb-4">
        <Col>
          <Button variant="outline-primary" onClick={() => navigate('/investments')}>Back</Button>
        </Col>
        <Col className="text-end">
          <Button variant="outline-info" onClick={() => navigate('/report/investments')}>
            <FaChartLine />
          </Button>
        </Col>
      </Row>

      <h2>{investment.title}</h2>
      <p><strong>Type:</strong> {investment.type}</p>
      <p><strong>Platform:</strong> {investment.platform}</p>
      <p><strong>Purchase Date:</strong> {new Date(investment.date).toLocaleString()}</p>
      <p><strong>Quantity:</strong> {investment.quantity} {investment.unit}</p>
      <p><strong>Total Amount:</strong> {investment.totalAmount}</p>
      <p><strong>Unit Price:</strong> {investment.unitPrice}</p>
      <p><strong>Investment Style:</strong> {investment.style}</p>

      {investment.soldAmount && (
        <>
          <p><strong>Sold Amount:</strong> {investment.soldAmount}</p>
          <p><strong>Sold Date:</strong> {new Date(investment.soldDate).toLocaleString()}</p>
          <p><strong>Profit/Loss:</strong> {investment.profit > 0 ? `+${investment.profit}` : investment.profit}</p>
        </>
      )}

      <Row className="mt-4">
        <Col xs={4} className="d-flex justify-content-center">
          {!investment.soldAmount && (
            <Button variant="primary" onClick={() => setShowSellModal(true)} className="w-100">
              Sell
            </Button>
          )}
        </Col>
        <Col xs={4} className="d-flex justify-content-center">
          <Button variant="warning" onClick={handleEdit} className="w-100">
            <FaEdit /> Edit
          </Button>
        </Col>
        <Col xs={4} className="d-flex justify-content-center">
          <Button variant="danger" onClick={handleDelete} className="w-100">
            <FaTrash /> Delete
          </Button>
        </Col>
      </Row>

      <Modal show={showSellModal} onHide={() => setShowSellModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Sell Investment</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group>
              <Form.Label>Sell Amount</Form.Label>
              <Form.Control 
                type="number" 
                value={sellAmount} 
                onChange={(e) => setSellAmount(e.target.value)}
                step="0.01"
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowSellModal(false)}>Close</Button>
          <Button variant="primary" onClick={handleSell}>Confirm Sale</Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default InvestmentDetail;
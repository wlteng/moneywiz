import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Container, Button, Form, Modal, Row, Col, Alert } from 'react-bootstrap';
import { doc, getDoc, updateDoc, deleteDoc } from 'firebase/firestore';
import { db } from '../services/firebase';
import { FaChartLine, FaEdit, FaTrash } from 'react-icons/fa';
import { convertCurrency } from '../services/conversionService';

const InvestmentDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [investment, setInvestment] = useState(null);
  const [showSellModal, setShowSellModal] = useState(false);
  const [sellAmount, setSellAmount] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [convertedTotalAmount, setConvertedTotalAmount] = useState(null);
  const [convertedSoldAmount, setConvertedSoldAmount] = useState(null);
  const [convertedProfit, setConvertedProfit] = useState(null);
  const [mainCurrency, setMainCurrency] = useState(localStorage.getItem('mainCurrency') || 'USD');

  useEffect(() => {
    const fetchInvestment = async () => {
      setLoading(true);
      setError('');
      try {
        const docRef = doc(db, 'investments', id);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const investmentData = { id: docSnap.id, ...docSnap.data() };
          setInvestment(investmentData);
          await convertAmounts(investmentData);
        } else {
          setError("No such investment!");
        }
      } catch (err) {
        console.error("Error fetching investment:", err);
        setError("Failed to fetch investment details.");
      } finally {
        setLoading(false);
      }
    };

    fetchInvestment();
  }, [id]);

  const convertAmounts = async (investmentData) => {
    try {
      const convertedTotal = await convertCurrency(investmentData.totalAmount, investmentData.currency, mainCurrency);
      setConvertedTotalAmount(convertedTotal);

      if (investmentData.soldAmount) {
        const convertedSold = await convertCurrency(investmentData.soldAmount, investmentData.currency, mainCurrency);
        setConvertedSoldAmount(convertedSold);

        const convertedProfit = await convertCurrency(investmentData.profit, investmentData.currency, mainCurrency);
        setConvertedProfit(convertedProfit);
      }
    } catch (err) {
      console.error("Error converting amounts:", err);
      setError("Failed to convert currency amounts.");
    }
  };

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

      const updatedInvestment = {
        ...investment,
        soldAmount: parseFloat(sellAmount),
        soldDate: sellDate.toISOString(),
        profit: profit
      };
      setInvestment(updatedInvestment);
      await convertAmounts(updatedInvestment);

      setShowSellModal(false);
    } catch (error) {
      console.error("Error updating investment: ", error);
      setError("Failed to update investment.");
    }
  };

  const handleEdit = () => {
    // Implement edit functionality or navigate to edit page
    console.log("Edit functionality to be implemented");
  };

  const handleDelete = async () => {
    if (window.confirm("Are you sure you want to delete this investment?")) {
      try {
        await deleteDoc(doc(db, 'investments', id));
        navigate('/investments');
      } catch (error) {
        console.error("Error deleting investment: ", error);
        setError("Failed to delete investment.");
      }
    }
  };

  if (loading) return <Container className="mt-3"><p>Loading...</p></Container>;
  if (error) return <Container className="mt-3"><Alert variant="danger">{error}</Alert></Container>;
  if (!investment) return <Container className="mt-3"><p>Investment not found.</p></Container>;

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
      <p><strong>Total Amount:</strong> {investment.totalAmount} {investment.currency}</p>
      <p><strong>Total Amount (in {mainCurrency}):</strong> {convertedTotalAmount?.toFixed(2)} {mainCurrency}</p>
      <p><strong>Unit Price:</strong> {investment.unitPrice} {investment.currency}</p>
      <p><strong>Investment Style:</strong> {investment.style}</p>

      {investment.soldAmount && (
        <>
          <p><strong>Sold Amount:</strong> {investment.soldAmount} {investment.currency}</p>
          <p><strong>Sold Amount (in {mainCurrency}):</strong> {convertedSoldAmount?.toFixed(2)} {mainCurrency}</p>
          <p><strong>Sold Date:</strong> {new Date(investment.soldDate).toLocaleString()}</p>
          <p><strong>Profit/Loss:</strong> {investment.profit > 0 ? `+${investment.profit}` : investment.profit} {investment.currency}</p>
          <p><strong>Profit/Loss (in {mainCurrency}):</strong> {convertedProfit > 0 ? `+${convertedProfit.toFixed(2)}` : convertedProfit.toFixed(2)} {mainCurrency}</p>
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
              <Form.Label>Sell Amount ({investment.currency})</Form.Label>
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
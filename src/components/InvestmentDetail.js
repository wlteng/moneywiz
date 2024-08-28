import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Container, Button, Form, Modal } from 'react-bootstrap';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '../services/firebase';

const InvestmentDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [investment, setInvestment] = useState(null);
  const [showSellModal, setShowSellModal] = useState(false);
  const [sellAmount, setSellAmount] = useState('');

  React.useEffect(() => {
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

  if (!investment) return <div>Loading...</div>;

  return (
    <Container>
      <h2>{investment.title}</h2>
      <p><strong>Type:</strong> {investment.type}</p>
      <p><strong>Platform:</strong> {investment.platform}</p>
      <p><strong>Purchase Date:</strong> {new Date(investment.date).toLocaleString()}</p>
      <p><strong>Quantity:</strong> {investment.quantity} {investment.unit}</p>
      <p><strong>Total Amount:</strong> {investment.totalAmount}</p>
      <p><strong>Unit Price:</strong> {investment.unitPrice}</p>
      <p><strong>Investment Style:</strong> {investment.style}</p>

      {investment.soldAmount ? (
        <>
          <p><strong>Sold Amount:</strong> {investment.soldAmount}</p>
          <p><strong>Sold Date:</strong> {new Date(investment.soldDate).toLocaleString()}</p>
          <p><strong>Profit/Loss:</strong> {investment.profit > 0 ? `+${investment.profit}` : investment.profit}</p>
        </>
      ) : (
        <Button variant="primary" onClick={() => setShowSellModal(true)}>Sell</Button>
      )}

      <Button variant="secondary" className="ms-2" onClick={() => navigate('/investments')}>Back to Investments</Button>
      <Button variant="info" className="ms-2" onClick={() => navigate('/report/investments')}>Go to Investment Report</Button>

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
import React, { useState, useEffect } from 'react';
import { Container, Table, Button } from 'react-bootstrap';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../services/firebase';
import { useNavigate } from 'react-router-dom';

const ReportInvest = () => {
  const [investments, setInvestments] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchInvestments = async () => {
      const querySnapshot = await getDocs(collection(db, 'investments'));
      const fetchedInvestments = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setInvestments(fetchedInvestments);
    };

    fetchInvestments();
  }, []);

  const calculateTotalProfit = () => {
    return investments.reduce((total, inv) => total + (inv.profit || 0), 0);
  };

  const handleBackClick = () => {
    // Navigate to the home page
    navigate('/');
  };

  return (
    <Container>
      <div className="d-flex justify-content-between align-items-center my-4">
        <h2>Investment Report</h2>
        <Button variant="secondary" onClick={handleBackClick}>Back to Home</Button>
      </div>

      <h3>Total Profit/Loss: {calculateTotalProfit()}</h3>

      <Table striped bordered hover>
        <thead>
          <tr>
            <th>Title</th>
            <th>Type</th>
            <th>Purchase Amount</th>
            <th>Sell Amount</th>
            <th>Profit/Loss</th>
          </tr>
        </thead>
        <tbody>
          {investments.map((inv) => (
            <tr key={inv.id}>
              <td>{inv.title}</td>
              <td>{inv.type}</td>
              <td>{inv.totalAmount}</td>
              <td>{inv.soldAmount || 'Not sold'}</td>
              <td>{inv.profit ? (inv.profit > 0 ? `+${inv.profit}` : inv.profit) : 'N/A'}</td>
            </tr>
          ))}
        </tbody>
      </Table>
    </Container>
  );
};

export default ReportInvest;
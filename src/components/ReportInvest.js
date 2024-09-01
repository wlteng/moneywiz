import React, { useState, useEffect } from 'react';
import { Container, Table, Button, Badge, Row, Col } from 'react-bootstrap';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db, auth } from '../services/firebase';
import { useNavigate } from 'react-router-dom';
import './ReportInvest.css';

const ReportInvest = () => {
  const [investmentsByCurrency, setInvestmentsByCurrency] = useState({});
  const navigate = useNavigate();

  useEffect(() => {
    const fetchInvestments = async () => {
      const user = auth.currentUser;
      if (user) {
        const q = query(collection(db, 'investments'), where("userId", "==", user.uid));
        const querySnapshot = await getDocs(q);
        const fetchedInvestments = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

        const groupedInvestments = fetchedInvestments.reduce((acc, inv) => {
          if (!acc[inv.currency]) {
            acc[inv.currency] = [];
          }
          acc[inv.currency].push(inv);
          return acc;
        }, {});

        setInvestmentsByCurrency(groupedInvestments);
      }
    };

    fetchInvestments();
  }, []);

  const calculateTotalProfit = (investments) => {
    return investments.reduce((total, inv) => total + (inv.profit || 0), 0);
  };

  const calculateOngoingAmount = (investments) => {
    return investments.reduce((total, inv) => {
      if (!inv.soldAmount) {
        return total + inv.totalAmount;
      }
      return total;
    }, 0);
  };

  const handleBackClick = () => {
    navigate(-1);
  };

  const getStatusBadge = (investment) => {
    if (!investment.soldAmount) {
      return <Badge bg="warning">Ongoing</Badge>;
    }
    if (investment.profit > 0) {
      return <Badge bg="success">Completed +</Badge>;
    }
    return <Badge bg="danger">Completed -</Badge>;
  };

  const handleTitleClick = (investmentId) => {
    navigate(`/investments/${investmentId}`);
  };

  return (
    <Container fluid className="px-3">
      <div className="d-flex justify-content-between align-items-center mt-4 mb-4">
        <Button variant="outline-primary" onClick={handleBackClick}>Back</Button>
        <h2>Investment Report</h2>
      </div>

      {Object.entries(investmentsByCurrency).map(([currency, investments]) => (
        <div key={currency} className="mb-5">
          <Row className="summary-row">
            <Col xs={6} md={3} className="summary-item">
              <span className="summary-label">Total P/L:</span>
              <span className="summary-value">{calculateTotalProfit(investments).toFixed(2)} {currency}</span>
            </Col>
            <Col xs={6} md={3} className="summary-item">
              <span className="summary-label">Ongoing:</span>
              <span className="summary-value">{calculateOngoingAmount(investments).toFixed(2)} {currency}</span>
            </Col>
          </Row>
          <div className="table-responsive">
            <Table striped bordered hover className="investment-table">
              <thead>
                <tr>
                  <th className="title-column">Title</th>
                  <th>Type</th>
                  <th>Buy</th>
                  <th>Sell</th>
                  <th>P/L</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {investments.map((inv) => (
                  <tr key={inv.id}>
                    <td className="title-cell" onClick={() => handleTitleClick(inv.id)}>
                      <div className="truncate">{inv.title}</div>
                    </td>
                    <td>{inv.type}</td>
                    <td>{inv.totalAmount.toFixed(2)}</td>
                    <td>{inv.soldAmount ? inv.soldAmount.toFixed(2) : 'Not sold'}</td>
                    <td>
                      {inv.profit 
                        ? (inv.profit > 0 ? `+${inv.profit.toFixed(2)}` : inv.profit.toFixed(2)) 
                        : 'N/A'}
                    </td>
                    <td>{getStatusBadge(inv)}</td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </div>
        </div>
      ))}
    </Container>
  );
};

export default ReportInvest;
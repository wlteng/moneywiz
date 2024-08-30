import React, { useState, useEffect } from 'react';
import { Container, Table, Button } from 'react-bootstrap';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../services/firebase';
import { useNavigate } from 'react-router-dom';

const ReportDebt = () => {
  const [debts, setDebts] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchDebts = async () => {
      const querySnapshot = await getDocs(collection(db, 'debts'));
      const fetchedDebts = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setDebts(fetchedDebts);
    };

    fetchDebts();
  }, []);

  const calculateTotalDebt = () => {
    return debts.reduce((total, debt) => total + debt.amount, 0);
  };

  const handleBackClick = () => {
    navigate(-1);
  };

  return (
    <Container>
      <div className="d-flex justify-content-between align-items-center mt-4">
        <h3>Total Debt: {calculateTotalDebt().toFixed(2)}</h3>
        <Button variant="secondary" onClick={handleBackClick} style={{ 
          backgroundColor: 'transparent', 
          border: 'none', 
          color: 'blue',
          cursor: 'pointer'
        }}>Back</Button>
      </div>

      <Table striped bordered hover className="mt-4">
        <thead>
          <tr>
            <th>Owe To</th>
            <th>Amount</th>
            <th>Currency</th>
            <th>Due Date</th>
            <th>Interest Rate</th>
          </tr>
        </thead>
        <tbody>
          {debts.map((debt) => (
            <tr key={debt.id}>
              <td>
                <a 
                  href="#" 
                  onClick={(e) => {
                    e.preventDefault();
                    navigate(`/debts/${debt.id}`);
                  }}
                  style={{ color: 'blue', textDecoration: 'none' }}
                >
                  {debt.oweTo}
                </a>
              </td>
              <td>{debt.amount.toFixed(2)}</td>
              <td>{debt.currency}</td>
              <td>{new Date(debt.date).toLocaleDateString()}</td>
              <td>{debt.interestRate}%</td>
            </tr>
          ))}
        </tbody>
      </Table>
    </Container>
  );
};

export default ReportDebt;
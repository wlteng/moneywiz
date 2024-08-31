import React, { useState, useEffect } from 'react';
import { Container, Button, ListGroup } from 'react-bootstrap';
import { collection, getDocs, addDoc, query, where } from 'firebase/firestore';
import { db, auth } from '../services/firebase';
import { useNavigate } from 'react-router-dom';
import DebtForm from '../components/DebtForm';
import { FaPlus, FaChartLine } from 'react-icons/fa';

const Debt = () => {
  const [debts, setDebts] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchDebts();
  }, []);

  const fetchDebts = async () => {
    try {
      const user = auth.currentUser;
      if (user) {
        const q = query(collection(db, 'debts'), where('userId', '==', user.uid));
        const querySnapshot = await getDocs(q);
        const fetchedDebts = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setDebts(fetchedDebts);
      }
    } catch (error) {
      console.error("Error fetching debts:", error);
    }
  };

  const handleAddDebt = async (newDebt) => {
    try {
      const user = auth.currentUser;
      if (user) {
        await addDoc(collection(db, 'debts'), { ...newDebt, userId: user.uid });
        setShowForm(false);
        fetchDebts();
      }
    } catch (error) {
      console.error("Error adding debt:", error);
    }
  };

  return (
    <Container>
      <div className="d-flex justify-content-between align-items-center my-4">
        <h2>Debts</h2>
        <div>
          <Button variant="primary" onClick={() => setShowForm(true)} className="me-2">
            <FaPlus /> Create
          </Button>
          <Button variant="info" onClick={() => navigate('/report/debts')}>
            <FaChartLine />
          </Button>
        </div>
      </div>

      <ListGroup>
        {debts.map((debt) => (
          <ListGroup.Item 
            key={debt.id} 
            action 
            onClick={() => navigate(`/debts/${debt.id}`)}
            className="d-flex justify-content-between align-items-center"
          >
            <div className="d-flex align-items-center">
              <div className="me-3 text-center">
                <div style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>{new Date(debt.date).getDate()}</div>
                <small>{new Date(debt.date).toLocaleString('default', { month: 'short' })}</small>
              </div>
              <div>
                <h5 className="mb-1">{debt.oweTo}</h5>
                <small>{debt.interestRate}% yearly</small>
              </div>
            </div>
            <div className="text-end">
              <h5 className="mb-0">{debt.amount} {debt.currency}</h5>
              <small>Repay: {debt.repaymentAmount} {debt.currency}</small>
            </div>
          </ListGroup.Item>
        ))}
      </ListGroup>

      <DebtForm show={showForm} handleClose={() => setShowForm(false)} handleSubmit={handleAddDebt} />
    </Container>
  );
};

export default Debt;
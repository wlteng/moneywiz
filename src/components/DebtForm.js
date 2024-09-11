import React, { useState, useEffect } from 'react';
import { Modal, Form, Button, Row, Col } from 'react-bootstrap';
import { auth, db } from '../services/firebase';
import { doc, getDoc } from 'firebase/firestore';

const DebtForm = ({ show, handleClose, handleSubmit }) => {
  const [oweTo, setOweTo] = useState('');
  const [amount, setAmount] = useState('');
  const [repaymentAmount, setRepaymentAmount] = useState('');
  const [currency, setCurrency] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [interestRate, setInterestRate] = useState('');
  const [repaymentDay, setRepaymentDay] = useState('1');
  const [favoriteCurrencies, setFavoriteCurrencies] = useState([]);

  useEffect(() => {
    const fetchFavoriteCurrencies = async () => {
      const user = auth.currentUser;
      if (user) {
        const userRef = doc(db, 'users', user.uid);
        const userSnap = await getDoc(userRef);
        if (userSnap.exists()) {
          const userData = userSnap.data();
          setFavoriteCurrencies(userData.favoriteCurrencies || []);
          if (userData.favoriteCurrencies && userData.favoriteCurrencies.length > 0) {
            setCurrency(userData.favoriteCurrencies[0]);
          }
        }
      }
    };

    fetchFavoriteCurrencies();
  }, []);

  const onSubmit = (e) => {
    e.preventDefault();
    handleSubmit({
      oweTo,
      amount: parseFloat(amount),
      repaymentAmount: parseFloat(repaymentAmount),
      currency,
      date,
      interestRate: parseFloat(interestRate),
      repaymentDay: parseInt(repaymentDay)
    });
    handleClose();
  };

  return (
    <Modal show={show} onHide={handleClose}>
      <Modal.Header closeButton>
        <Modal.Title>Add New Debt</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form onSubmit={onSubmit}>
          <Form.Group className="mb-3">
            <Form.Label>Owe To</Form.Label>
            <Form.Control type="text" value={oweTo} onChange={(e) => setOweTo(e.target.value)} required />
          </Form.Group>
          <Row className="mb-3">
            <Col xs={8}>
              <Form.Group>
                <Form.Label>Amount</Form.Label>
                <Form.Control type="number" step="0.01" value={amount} onChange={(e) => setAmount(e.target.value)} required />
              </Form.Group>
            </Col>
            <Col xs={4}>
              <Form.Group>
                <Form.Label>Currency</Form.Label>
                <Form.Select value={currency} onChange={(e) => setCurrency(e.target.value)} required>
                  <option value="">Select</option>
                  {favoriteCurrencies.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </Form.Select>
              </Form.Group>
            </Col>
          </Row>
          <Form.Group className="mb-3">
            <Form.Label>Repayment Amount</Form.Label>
            <Form.Control type="number" step="0.01" value={repaymentAmount} onChange={(e) => setRepaymentAmount(e.target.value)} required />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Start Date</Form.Label>
            <Form.Control type="date" value={date} onChange={(e) => setDate(e.target.value)} required />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Yearly Interest Rate (%)</Form.Label>
            <Form.Control type="number" step="0.01" value={interestRate} onChange={(e) => setInterestRate(e.target.value)} required />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Repayment Day of Month</Form.Label>
            <Form.Select value={repaymentDay} onChange={(e) => setRepaymentDay(e.target.value)} required>
              {[...Array(31)].map((_, i) => (
                <option key={i+1} value={i+1}>{i+1}{['st', 'nd', 'rd'][i] || 'th'}</option>
              ))}
            </Form.Select>
          </Form.Group>
          <Button variant="primary" type="submit">Add Debt</Button>
        </Form>
      </Modal.Body>
    </Modal>
  );
};

export default DebtForm;
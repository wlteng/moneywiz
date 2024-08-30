import React, { useState } from 'react';
import { Modal, Form, Button, Row, Col } from 'react-bootstrap';
import { currencyList } from '../data/General';

const DebtForm = ({ show, handleClose, handleSubmit }) => {
  const [oweTo, setOweTo] = useState('');
  const [amount, setAmount] = useState('');
  const [repaymentAmount, setRepaymentAmount] = useState('');
  const [currency, setCurrency] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [interestRate, setInterestRate] = useState('');

  const onSubmit = (e) => {
    e.preventDefault();
    handleSubmit({
      oweTo,
      amount: parseFloat(amount),
      repaymentAmount: parseFloat(repaymentAmount),
      currency,
      date,
      interestRate: parseFloat(interestRate)
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
                  {currencyList.map((c) => (
                    <option key={c.code} value={c.code}>{c.code}</option>
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
          <Button variant="primary" type="submit">Add Debt</Button>
        </Form>
      </Modal.Body>
    </Modal>
  );
};

export default DebtForm;
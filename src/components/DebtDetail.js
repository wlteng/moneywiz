import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Container, Button, Form, Modal, Table, Badge } from 'react-bootstrap';
import { doc, getDoc, updateDoc, deleteDoc, collection, addDoc, getDocs, query, where } from 'firebase/firestore';
import { db } from '../services/firebase';

const DebtDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [debt, setDebt] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showPayModal, setShowPayModal] = useState(false);
  const [editedDebt, setEditedDebt] = useState({});
  const [paymentAmount, setPaymentAmount] = useState('');
  const [transactions, setTransactions] = useState([]);

  useEffect(() => {
    fetchDebt();
    fetchTransactions();
  }, [id]);

  const fetchDebt = async () => {
    const docRef = doc(db, 'debts', id);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      setDebt({ id: docSnap.id, ...docSnap.data() });
      setEditedDebt({ id: docSnap.id, ...docSnap.data() });
    } else {
      console.log("No such debt!");
    }
  };

  const fetchTransactions = async () => {
    const q = query(collection(db, 'debtTransactions'), where("debtId", "==", id));
    const querySnapshot = await getDocs(q);
    const fetchedTransactions = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    setTransactions(fetchedTransactions);
  };

  const handleEdit = async () => {
    if (window.confirm("Are you sure you want to edit this debt?")) {
      try {
        await updateDoc(doc(db, 'debts', id), editedDebt);
        setDebt(editedDebt);
        setShowEditModal(false);
      } catch (error) {
        console.error("Error updating debt: ", error);
      }
    }
  };

  const handleDelete = async () => {
    if (window.confirm("Are you sure you want to delete this debt?")) {
      try {
        await deleteDoc(doc(db, 'debts', id));
        navigate('/debts');
      } catch (error) {
        console.error("Error deleting debt: ", error);
      }
    }
  };

  const handlePayPartly = async () => {
    if (!paymentAmount) return;

    try {
      const newAmount = debt.amount - parseFloat(paymentAmount);
      await updateDoc(doc(db, 'debts', id), { amount: newAmount });
      await addDoc(collection(db, 'debtTransactions'), {
        debtId: id,
        type: 'payment',
        amount: parseFloat(paymentAmount),
        date: new Date().toISOString()
      });
      setDebt({ ...debt, amount: newAmount });
      setShowPayModal(false);
      fetchTransactions();
    } catch (error) {
      console.error("Error updating debt: ", error);
    }
  };

  const handleAddInterest = async () => {
    const interestAmount = (debt.amount * debt.interestRate) / 100;
    const newAmount = debt.amount + interestAmount;

    try {
      await updateDoc(doc(db, 'debts', id), { amount: newAmount });
      await addDoc(collection(db, 'debtTransactions'), {
        debtId: id,
        type: 'interest',
        amount: interestAmount,
        date: new Date().toISOString()
      });
      setDebt({ ...debt, amount: newAmount });
      fetchTransactions();
    } catch (error) {
      console.error("Error adding interest: ", error);
    }
  };

  const getTransactionBadge = (type) => {
    switch(type) {
      case 'payment':
        return <Badge bg="success">Payment</Badge>;
      case 'interest':
        return <Badge bg="warning">Interest</Badge>;
      default:
        return <Badge bg="secondary">{type}</Badge>;
    }
  };

  if (!debt) return <div>Loading...</div>;

  return (
    <Container>
      <Button variant="link" onClick={() => navigate(-1)} className="mt-3 mb-3">
        &lt; Back
      </Button>
      <h2>{debt.oweTo}</h2>
      <p><strong>Amount:</strong> {debt.amount} {debt.currency}</p>
      <p><strong>Repayment Amount:</strong> {debt.repaymentAmount} {debt.currency}</p>
      <p><strong>Start Date:</strong> {new Date(debt.date).toLocaleDateString()}</p>
      <p><strong>Interest Rate:</strong> {debt.interestRate}% YEARLY</p>

      <Button variant="primary" onClick={() => setShowEditModal(true)} className="me-2">Edit</Button>
      <Button variant="danger" onClick={handleDelete} className="me-2">Delete</Button>
      <Button variant="success" onClick={() => setShowPayModal(true)} className="me-2">Pay Partly</Button>
      <Button variant="warning" onClick={handleAddInterest}>Add Interest</Button>

      <h3 className="mt-4">Transactions</h3>
      <Table striped bordered hover>
        <thead>
          <tr>
            <th>Date</th>
            <th>Type</th>
            <th>Amount</th>
          </tr>
        </thead>
        <tbody>
          {transactions.map((transaction) => (
            <tr key={transaction.id}>
              <td>{new Date(transaction.date).toLocaleDateString()}</td>
              <td>{getTransactionBadge(transaction.type)}</td>
              <td>{transaction.amount} {debt.currency}</td>
            </tr>
          ))}
        </tbody>
      </Table>

      <Modal show={showEditModal} onHide={() => setShowEditModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Edit Debt</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>Owe To</Form.Label>
              <Form.Control 
                type="text" 
                value={editedDebt.oweTo} 
                onChange={(e) => setEditedDebt({...editedDebt, oweTo: e.target.value})}
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Amount</Form.Label>
              <Form.Control 
                type="number" 
                value={editedDebt.amount} 
                onChange={(e) => setEditedDebt({...editedDebt, amount: parseFloat(e.target.value)})}
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Due Date</Form.Label>
              <Form.Control 
                type="date" 
                value={editedDebt.date} 
                onChange={(e) => setEditedDebt({...editedDebt, date: e.target.value})}
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Interest Rate</Form.Label>
              <Form.Control 
                type="number" 
                value={editedDebt.interestRate} 
                onChange={(e) => setEditedDebt({...editedDebt, interestRate: parseFloat(e.target.value)})}
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowEditModal(false)}>Close</Button>
          <Button variant="primary" onClick={handleEdit}>Save Changes</Button>
        </Modal.Footer>
      </Modal>

      <Modal show={showPayModal} onHide={() => setShowPayModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Pay Partly</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>Payment Amount</Form.Label>
              <Form.Control 
                type="number" 
                value={paymentAmount} 
                onChange={(e) => setPaymentAmount(e.target.value)}
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowPayModal(false)}>Close</Button>
          <Button variant="primary" onClick={handlePayPartly}>Pay</Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default DebtDetail;
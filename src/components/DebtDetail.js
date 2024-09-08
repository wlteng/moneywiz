import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Container, Button, Form, Modal, Table, Badge, Alert } from 'react-bootstrap';
import { doc, getDoc, updateDoc, deleteDoc, collection, addDoc, getDocs, query, where } from 'firebase/firestore';
import { db } from '../services/firebase';
import { convertCurrency } from '../services/conversionService';

const DebtDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [debt, setDebt] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showPayModal, setShowPayModal] = useState(false);
  const [editedDebt, setEditedDebt] = useState({});
  const [paymentAmount, setPaymentAmount] = useState('');
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [convertedAmount, setConvertedAmount] = useState(null);
  const [convertedRepaymentAmount, setConvertedRepaymentAmount] = useState(null);
  const [mainCurrency, setMainCurrency] = useState(localStorage.getItem('mainCurrency') || 'USD');

  useEffect(() => {
    fetchDebt();
    fetchTransactions();
  }, [id]);

  const fetchDebt = async () => {
    setLoading(true);
    setError('');
    try {
      const docRef = doc(db, 'debts', id);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const debtData = { id: docSnap.id, ...docSnap.data() };
        setDebt(debtData);
        setEditedDebt(debtData);
        await convertAmounts(debtData);
      } else {
        setError("No such debt!");
      }
    } catch (err) {
      console.error("Error fetching debt:", err);
      setError("Failed to fetch debt details.");
    } finally {
      setLoading(false);
    }
  };

  const convertAmounts = async (debtData) => {
    try {
      const convertedAmount = await convertCurrency(debtData.amount, debtData.currency, mainCurrency);
      setConvertedAmount(convertedAmount);

      const convertedRepayment = await convertCurrency(debtData.repaymentAmount, debtData.currency, mainCurrency);
      setConvertedRepaymentAmount(convertedRepayment);
    } catch (err) {
      console.error("Error converting amounts:", err);
      setError("Failed to convert currency amounts.");
    }
  };

  const fetchTransactions = async () => {
    try {
      const q = query(collection(db, 'debtTransactions'), where("debtId", "==", id));
      const querySnapshot = await getDocs(q);
      const fetchedTransactions = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setTransactions(fetchedTransactions);
    } catch (err) {
      console.error("Error fetching transactions:", err);
      setError("Failed to fetch transaction history.");
    }
  };

  const handleEdit = async () => {
    if (window.confirm("Are you sure you want to edit this debt?")) {
      try {
        await updateDoc(doc(db, 'debts', id), editedDebt);
        setDebt(editedDebt);
        await convertAmounts(editedDebt);
        setShowEditModal(false);
      } catch (error) {
        console.error("Error updating debt: ", error);
        setError("Failed to update debt.");
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
        setError("Failed to delete debt.");
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
      await convertAmounts({ ...debt, amount: newAmount });
      setShowPayModal(false);
      fetchTransactions();
    } catch (error) {
      console.error("Error updating debt: ", error);
      setError("Failed to process payment.");
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
      await convertAmounts({ ...debt, amount: newAmount });
      fetchTransactions();
    } catch (error) {
      console.error("Error adding interest: ", error);
      setError("Failed to add interest.");
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

  if (loading) return <Container className="mt-3"><p>Loading...</p></Container>;
  if (error) return <Container className="mt-3"><Alert variant="danger">{error}</Alert></Container>;
  if (!debt) return <Container className="mt-3"><p>Debt not found.</p></Container>;

  return (
    <Container>
      <Button variant="link" onClick={() => navigate(-1)} className="mt-3 mb-3">
        &lt; Back
      </Button>
      <h2>{debt.oweTo}</h2>
      <p><strong>Amount:</strong> {debt.amount} {debt.currency}</p>
      <p><strong>Amount (in {mainCurrency}):</strong> {convertedAmount?.toFixed(2)} {mainCurrency}</p>
      <p><strong>Repayment Amount:</strong> {debt.repaymentAmount} {debt.currency}</p>
      <p><strong>Repayment Amount (in {mainCurrency}):</strong> {convertedRepaymentAmount?.toFixed(2)} {mainCurrency}</p>
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
              <Form.Label>Payment Amount ({debt.currency})</Form.Label>
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
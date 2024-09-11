import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Container, Button, Form, Modal, Table, Badge, Alert, Row, Col } from 'react-bootstrap';
import { doc, getDoc, updateDoc, deleteDoc, collection, addDoc, getDocs, query, where } from 'firebase/firestore';
import { db, auth } from '../services/firebase';
import { FaEdit, FaTrash } from 'react-icons/fa';
import { convertCurrency } from '../services/conversionService';

const DebtDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [debt, setDebt] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showPayModal, setShowPayModal] = useState(false);
  const [showRepaymentModal, setShowRepaymentModal] = useState(false);
  const [showEditTransactionModal, setShowEditTransactionModal] = useState(false);
  const [editedDebt, setEditedDebt] = useState({});
  const [editedTransaction, setEditedTransaction] = useState(null);
  const [paymentAmount, setPaymentAmount] = useState('');
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [mainCurrency, setMainCurrency] = useState('');
  const [convertedAmount, setConvertedAmount] = useState(null);
  const [convertedRepaymentAmount, setConvertedRepaymentAmount] = useState(null);
  const [nextRepaymentDate, setNextRepaymentDate] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError('');
      try {
        await fetchDebt();
        await Promise.all([
          fetchTransactions(),
          fetchMainCurrency(),
        ]);
      } catch (err) {
        console.error("Error fetching data:", err);
        setError("Failed to fetch data. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  useEffect(() => {
    const convertAmounts = async () => {
      if (debt && mainCurrency && debt.currency !== mainCurrency) {
        try {
          const convertedDebtAmount = await convertCurrency(debt.amount, debt.currency, mainCurrency);
          setConvertedAmount(isNaN(convertedDebtAmount) ? null : convertedDebtAmount);

          const convertedRepayAmount = await convertCurrency(debt.repaymentAmount, debt.currency, mainCurrency);
          setConvertedRepaymentAmount(isNaN(convertedRepayAmount) ? null : convertedRepayAmount);
        } catch (err) {
          console.error("Error converting amounts:", err);
          setError("Failed to convert amounts");
        }
      }
    };

    convertAmounts();
  }, [debt, mainCurrency]);

  useEffect(() => {
    if (debt) {
      const today = new Date();
      let nextRepayment = new Date(today.getFullYear(), today.getMonth(), debt.repaymentDay);
      if (nextRepayment <= today) {
        nextRepayment.setMonth(nextRepayment.getMonth() + 1);
      }
      setNextRepaymentDate(nextRepayment);
    }
  }, [debt]);

  const fetchDebt = async () => {
    const docRef = doc(db, 'debts', id);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      const debtData = { id: docSnap.id, ...docSnap.data() };
      setDebt(debtData);
      setEditedDebt(debtData);
    } else {
      throw new Error("Debt not found");
    }
  };

  const fetchTransactions = async () => {
    const q = query(collection(db, 'debtTransactions'), where("debtId", "==", id));
    const querySnapshot = await getDocs(q);
    const fetchedTransactions = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    setTransactions(fetchedTransactions);
  };

  const fetchMainCurrency = async () => {
    const user = auth.currentUser;
    if (!user) {
      throw new Error("User not authenticated");
    }
    const userRef = doc(db, 'users', user.uid);
    const userSnap = await getDoc(userRef);
    if (userSnap.exists()) {
      const userData = userSnap.data();
      setMainCurrency(userData.mainCurrency || 'USD');
    } else {
      throw new Error("User data not found");
    }
  };

  const handleEdit = async () => {
    if (window.confirm("Are you sure you want to edit this debt?")) {
      try {
        await updateDoc(doc(db, 'debts', id), editedDebt);
        setDebt(editedDebt);
        setShowEditModal(false);
        fetchDebt();
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
      setShowPayModal(false);
      fetchTransactions();
      fetchDebt();
    } catch (error) {
      console.error("Error updating debt: ", error);
      setError("Failed to process payment.");
    }
  };

  const handleRepayment = async () => {
    try {
      const newAmount = debt.amount - debt.repaymentAmount;
      await updateDoc(doc(db, 'debts', id), { amount: newAmount });
      await addDoc(collection(db, 'debtTransactions'), {
        debtId: id,
        type: 'repayment',
        amount: debt.repaymentAmount,
        date: new Date().toISOString()
      });
      setDebt({ ...debt, amount: newAmount });
      setShowRepaymentModal(false);
      fetchTransactions();
      fetchDebt();
    } catch (error) {
      console.error("Error processing repayment: ", error);
      setError("Failed to process repayment.");
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
      fetchDebt();
    } catch (error) {
      console.error("Error adding interest: ", error);
      setError("Failed to add interest.");
    }
  };

  const handleEditTransaction = (transaction) => {
    setEditedTransaction(transaction);
    setShowEditTransactionModal(true);
  };

  const handleUpdateTransaction = async () => {
    try {
      const transactionRef = doc(db, 'debtTransactions', editedTransaction.id);
      await updateDoc(transactionRef, {
        amount: parseFloat(editedTransaction.amount),
        date: editedTransaction.date
      });

      const updatedTransactions = transactions.map(t => 
        t.id === editedTransaction.id ? editedTransaction : t
      );
      const newDebtAmount = calculateDebtAmount(updatedTransactions);

      const debtRef = doc(db, 'debts', id);
      await updateDoc(debtRef, { amount: newDebtAmount });

      setShowEditTransactionModal(false);
      fetchTransactions();
      fetchDebt();
    } catch (error) {
      console.error("Error updating transaction:", error);
      setError("Failed to update transaction.");
    }
  };

  const handleDeleteTransaction = async (transactionId) => {
    if (window.confirm("Are you sure you want to delete this transaction?")) {
      try {
        await deleteDoc(doc(db, 'debtTransactions', transactionId));

        const updatedTransactions = transactions.filter(t => t.id !== transactionId);
        const newDebtAmount = calculateDebtAmount(updatedTransactions);

        const debtRef = doc(db, 'debts', id);
        await updateDoc(debtRef, { amount: newDebtAmount });

        fetchTransactions();
        fetchDebt();
      } catch (error) {
        console.error("Error deleting transaction:", error);
        setError("Failed to delete transaction.");
      }
    }
  };

  const calculateDebtAmount = (transactions) => {
    return transactions.reduce((total, transaction) => {
      if (transaction.type === 'payment' || transaction.type === 'repayment') {
        return total - parseFloat(transaction.amount);
      } else if (transaction.type === 'interest') {
        return total + parseFloat(transaction.amount);
      }
      return total;
    }, parseFloat(debt.amount));
  };

  const getTransactionBadge = (type) => {
    switch(type) {
      case 'payment':
        return <Badge bg="success">Payment</Badge>;
      case 'repayment':
        return <Badge bg="primary">Repayment</Badge>;
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
      <Row className="mt-3 mb-3 align-items-center">
        <Col>
          <Button variant="outline-primary" onClick={() => navigate(-1)}>
            Back
          </Button>
        </Col>
        <Col className="text-end">
          <Button variant="outline-warning" onClick={() => setShowEditModal(true)} className="me-2">
            <FaEdit />
          </Button>
          <Button variant="outline-danger" onClick={handleDelete}>
            <FaTrash />
          </Button>
        </Col>
      </Row>
      
      <h2>{debt.oweTo}</h2>
      <p><strong>Amount:</strong> {debt.amount} {debt.currency}</p>
      {convertedAmount !== null && mainCurrency !== debt.currency && (
        <p><strong>Converted Amount:</strong> {convertedAmount.toFixed(2)} {mainCurrency}</p>
      )}
      <p><strong>Repayment Amount:</strong> {debt.repaymentAmount} {debt.currency}</p>
      {convertedRepaymentAmount !== null && mainCurrency !== debt.currency && (
        <p><strong>Converted Repayment Amount:</strong> {convertedRepaymentAmount.toFixed(2)} {mainCurrency}</p>
      )}
      <p><strong>Start Date:</strong> {new Date(debt.date).toLocaleDateString()}</p>
      <p><strong>Interest Rate:</strong> {debt.interestRate}% YEARLY</p>
      <p><strong>Repayment Day:</strong> {debt.repaymentDay}{['st', 'nd', 'rd'][debt.repaymentDay - 1] || 'th'} of each month</p>
      <p><strong>Next Repayment Date:</strong> {nextRepaymentDate?.toLocaleDateString()}</p>

      <Button variant="success" onClick={() => setShowPayModal(true)} className="me-2">Pay Partly</Button>
      <Button variant="primary" onClick={() => setShowRepaymentModal(true)} className="me-2">Pay Repayment</Button>
      <Button variant="warning" onClick={handleAddInterest}>Add Interest</Button>

      <h3 className="mt-4">Transactions</h3>
      <Table striped bordered hover>
        <thead>
          <tr>
            <th>Date</th>
            <th>Type</th>
            <th>Amount</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {transactions.map((transaction) => (
            <tr key={transaction.id}>
              <td>{new Date(transaction.date).toLocaleDateString()}</td>
              <td>{getTransactionBadge(transaction.type)}</td>
              <td>{transaction.amount} {debt.currency}</td>
              <td>
                <Button variant="outline-primary" size="sm" onClick={() => handleEditTransaction(transaction)} className="me-2">
                  <FaEdit />
                </Button>
                <Button variant="outline-danger" size="sm" onClick={() => handleDeleteTransaction(transaction.id)}>
                  <FaTrash />
                </Button>
              </td>
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
            <Form.Group className="mb-3">
              <Form.Label>Repayment Day</Form.Label>
              <Form.Select
                value={editedDebt.repaymentDay}
                onChange={(e) => setEditedDebt({...editedDebt, repaymentDay: parseInt(e.target.value)})}
              >
                {[...Array(31)].map((_, i) => (
                  <option key={i+1} value={i+1}>{i+1}{['st', 'nd', 'rd'][i] || 'th'}</option>
                ))}
              </Form.Select>
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

      <Modal show={showRepaymentModal} onHide={() => setShowRepaymentModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Pay Repayment</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>Are you sure you want to make a repayment of {debt.repaymentAmount} {debt.currency}?</p>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowRepaymentModal(false)}>Cancel</Button>
          <Button variant="primary" onClick={handleRepayment}>Confirm Repayment</Button>
        </Modal.Footer>
      </Modal>

      <Modal show={showEditTransactionModal} onHide={() => setShowEditTransactionModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Edit Transaction</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>Amount ({debt.currency})</Form.Label>
              <Form.Control 
                type="number" 
                value={editedTransaction?.amount} 
                onChange={(e) => setEditedTransaction({...editedTransaction, amount: e.target.value})}
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Date</Form.Label>
              <Form.Control 
                type="date" 
                value={editedTransaction?.date.split('T')[0]} 
                onChange={(e) => setEditedTransaction({...editedTransaction, date: new Date(e.target.value).toISOString()})}
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowEditTransactionModal(false)}>Close</Button>
          <Button variant="primary" onClick={handleUpdateTransaction}>Save Changes</Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default DebtDetail;
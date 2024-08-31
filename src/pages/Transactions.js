import React, { useState, useEffect } from 'react';
import { useMediaQuery } from 'react-responsive';
import { db, auth } from '../services/firebase';
import { collection, getDocs, query, orderBy, where, doc, getDoc } from 'firebase/firestore';
import { Container, Button, Form, Modal, ListGroup, Badge, Row, Col, Dropdown } from 'react-bootstrap';
import { FaCalendarAlt, FaMoneyBillWave, FaTags, FaFileAlt, FaImage } from 'react-icons/fa';
import { Link } from 'react-router-dom';

const Transactions = () => {
  const [transactions, setTransactions] = useState([]);
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [filterMonth, setFilterMonth] = useState('');
  const [filterCurrency, setFilterCurrency] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [filterPaymentMethod, setFilterPaymentMethod] = useState('');
  const [userCategories, setUserCategories] = useState([]);

  const isMobile = useMediaQuery({ maxWidth: 767 });

  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        const user = auth.currentUser;
        if (user) {
          const q = query(
            collection(db, 'expenses'),
            where('userId', '==', user.uid),
            orderBy('date', 'desc')
          );
          const querySnapshot = await getDocs(q);
          const fetchedTransactions = [];
          querySnapshot.forEach((doc) => {
            fetchedTransactions.push({ id: doc.id, ...doc.data() });
          });
          setTransactions(fetchedTransactions);
        }
      } catch (error) {
        console.error('Error fetching transactions:', error);
      }
    };

    const fetchUserCategories = async () => {
      const user = auth.currentUser;
      if (user) {
        const userRef = doc(db, 'users', user.uid);
        const userSnap = await getDoc(userRef);
        if (userSnap.exists()) {
          const userData = userSnap.data();
          setUserCategories(userData.categories || []);
        }
      }
    };

    fetchTransactions();
    fetchUserCategories();
  }, []);

  const handleShowDescription = (transaction) => {
    setSelectedTransaction(transaction);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
  };

  const handleShowPaymentDetails = (payment) => {
    setSelectedPayment(payment);
    setShowPaymentModal(true);
  };

  const handleClosePaymentModal = () => {
    setShowPaymentModal(false);
  };

  const handleMonthChange = (month) => {
    setFilterMonth(month);
  };

  const handleCurrencyChange = (currency) => {
    setFilterCurrency(currency);
  };

  const handleCategoryChange = (category) => {
    setFilterCategory(category);
  };

  const handlePaymentMethodChange = (method) => {
    setFilterPaymentMethod(method);
  };

  const uniqueMonths = [
    ...new Set(
      transactions.map((transaction) =>
        new Date(transaction.date).toLocaleString('default', { month: 'long', year: 'numeric' })
      )
    ),
  ];

  const uniqueCurrencies = [...new Set(transactions.map((transaction) => transaction.fromCurrency))];

  const uniquePaymentMethods = [...new Set(transactions.map((transaction) => {
    const method = transaction.paymentMethod;
    if (method.type === 'Cash') return 'Cash';
    if (method.type === 'Credit Card' || method.type === 'Debit Card') {
      return `${method.type.toLowerCase()}-${method.details.bank || 'unknown'}-${method.details.last4 || ''}`;
    }
    return method.type;
  }))];

  const filteredTransactions = transactions.filter((transaction) => {
    const transactionDate = new Date(transaction.date);
    const monthMatches = filterMonth
      ? transactionDate.toLocaleString('default', { month: 'long', year: 'numeric' }) === filterMonth
      : true;
    const currencyMatches = filterCurrency ? transaction.fromCurrency === filterCurrency : true;
    const categoryMatches = filterCategory ? transaction.categoryId === filterCategory : true;
    const paymentMethodMatches = filterPaymentMethod 
      ? (filterPaymentMethod === 'Cash' 
          ? transaction.paymentMethod.type === 'Cash'
          : `${transaction.paymentMethod.type.toLowerCase()}-${transaction.paymentMethod.details.bank || 'unknown'}-${transaction.paymentMethod.details.last4 || ''}` === filterPaymentMethod)
      : true;
    return monthMatches && currencyMatches && categoryMatches && paymentMethodMatches;
  });

  const groupedTransactions = filteredTransactions.reduce((acc, transaction) => {
    const transactionDate = new Date(transaction.date);
    const monthYear = transactionDate.toLocaleString('default', { month: 'long', year: 'numeric' });
    if (!acc[monthYear]) {
      acc[monthYear] = [];
    }
    acc[monthYear].push(transaction);
    return acc;
  }, {});

  const getPaymentMethodBadgeColor = (type) => {
    switch (type) {
      case 'E-Wallet':
        return 'primary';
      case 'Debit Card':
        return 'success';
      case 'Credit Card':
        return 'danger';
      case 'Cash':
      default:
        return 'secondary';
    }
  };

  return (
    <Container className="mt-4">
      <h2>Transactions</h2>

      <Row className="mb-3">
        <Col xs={3} className="mb-2">
          <Dropdown>
            <Dropdown.Toggle variant="outline-secondary" id="dropdown-month" className="w-100">
              {filterMonth || 'Period'}
            </Dropdown.Toggle>
            <Dropdown.Menu>
              <Dropdown.Item onClick={() => handleMonthChange('')}>All months</Dropdown.Item>
              {uniqueMonths.map((month, index) => (
                <Dropdown.Item key={index} onClick={() => handleMonthChange(month)}>
                  {month}
                </Dropdown.Item>
              ))}
            </Dropdown.Menu>
          </Dropdown>
        </Col>
        <Col xs={3} className="mb-2">
          <Dropdown>
            <Dropdown.Toggle variant="outline-secondary" id="dropdown-currency" className="w-100">
              {filterCurrency || 'Currency'}
            </Dropdown.Toggle>
            <Dropdown.Menu>
              <Dropdown.Item onClick={() => handleCurrencyChange('')}>All currencies</Dropdown.Item>
              {uniqueCurrencies.map((currency, index) => (
                <Dropdown.Item key={index} onClick={() => handleCurrencyChange(currency)}>
                  {currency}
                </Dropdown.Item>
              ))}
            </Dropdown.Menu>
          </Dropdown>
        </Col>
        <Col xs={3} className="mb-2">
          <Dropdown>
            <Dropdown.Toggle variant="outline-secondary" id="dropdown-category" className="w-100">
              {filterCategory ? userCategories.find(cat => cat.id === filterCategory)?.name : 'Category'}
            </Dropdown.Toggle>
            <Dropdown.Menu>
              <Dropdown.Item onClick={() => handleCategoryChange('')}>All categories</Dropdown.Item>
              {userCategories.map((category, index) => (
                <Dropdown.Item key={index} onClick={() => handleCategoryChange(category.id)}>
                  {category.name}
                </Dropdown.Item>
              ))}
            </Dropdown.Menu>
          </Dropdown>
        </Col>
        <Col xs={3} className="mb-2">
          <Dropdown>
            <Dropdown.Toggle variant="outline-secondary" id="dropdown-payment" className="w-100">
              {filterPaymentMethod || 'Payment'}
            </Dropdown.Toggle>
            <Dropdown.Menu>
              <Dropdown.Item onClick={() => handlePaymentMethodChange('')}>All methods</Dropdown.Item>
              {uniquePaymentMethods.map((method, index) => (
                <Dropdown.Item key={index} onClick={() => handlePaymentMethodChange(method)}>
                  {method}
                </Dropdown.Item>
              ))}
            </Dropdown.Menu>
          </Dropdown>
        </Col>
      </Row>

      {Object.entries(groupedTransactions).map(([monthYear, transactions]) => (
        <div key={monthYear}>
          <h3 className="mt-4 mb-3">{monthYear}</h3>
          <ListGroup>
            {transactions.map((transaction) => (
              <ListGroup.Item key={transaction.id} className="d-flex justify-content-between align-items-center">
                <div>
                  <div className="fw-bold">{userCategories.find(cat => cat.id === transaction.categoryId)?.name || 'N/A'}</div>
                  <small>{new Date(transaction.date).toLocaleString()}</small>
                  <div>
                    <Badge
                      bg={getPaymentMethodBadgeColor(transaction.paymentMethod.type)}
                      style={{ cursor: 'pointer' }}
                      onClick={() => handleShowPaymentDetails(transaction.paymentMethod)}
                    >
                      {transaction.paymentMethod.type}
                    </Badge>
                    {transaction.description && <FaFileAlt className="ms-2" />}
                    {(transaction.receipt || transaction.productImage) && <FaImage className="ms-2" />}
                  </div>
                </div>
                <div className="text-end">
                  <div>{transaction.amount} {transaction.fromCurrency}</div>
                  <div>{transaction.convertedAmount} {transaction.toCurrency}</div>
                </div>
              </ListGroup.Item>
            ))}
          </ListGroup>
        </div>
      ))}

      <Modal show={showModal} onHide={handleCloseModal}>
        <Modal.Header closeButton>
          <Modal.Title>Transaction Details</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedTransaction && (
            <>
              <p><strong>Date:</strong> {new Date(selectedTransaction.date).toLocaleString()}</p>
              <p><strong>Category:</strong> {userCategories.find(cat => cat.id === selectedTransaction.categoryId)?.name || 'N/A'}</p>
              <p><strong>Amount:</strong> {selectedTransaction.amount} {selectedTransaction.fromCurrency}</p>
              <p><strong>Description:</strong> {selectedTransaction.description || 'No description'}</p>
            </>
          )}
        </Modal.Body>
      </Modal>

      <Modal show={showPaymentModal} onHide={handleClosePaymentModal}>
        <Modal.Header closeButton>
          <Modal.Title>Payment Details</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedPayment && (
            <>
              <p><strong>Type:</strong> {selectedPayment.type}</p>
              {selectedPayment.type === 'Cash' && (
                <p><strong>Currency:</strong> {selectedPayment.currency}</p>
              )}
              {(selectedPayment.type === 'Credit Card' || selectedPayment.type === 'Debit Card') && (
                <>
                  <p><strong>Bank:</strong> {selectedPayment.details.bank || 'N/A'}</p>
                  <p><strong>Last 4 digits:</strong> {selectedPayment.details.last4 || 'N/A'}</p>
                </>
              )}
              {selectedPayment.type === 'E-Wallet' && (
                <p><strong>Name:</strong> {selectedPayment.details.name || 'N/A'}</p>
              )}
            </>
          )}
        </Modal.Body>
      </Modal>
    </Container>
  );
};

export default Transactions;